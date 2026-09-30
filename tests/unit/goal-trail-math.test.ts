import { describe, expect, it } from "vitest";

import {
  chestOpenedOf,
  chestStepsFor,
  currentStepOf,
  hasDateSchedule,
  installmentByDeadline,
  nodeDateOf,
  nodeStateOf,
  scheduleDatesOf,
  stepAmountOf,
  suggestedStepAmountOf,
} from "@/features/finance/goal-trail-math";
import type { Goal } from "@/lib/api/schemas";

const TODAY = "2026-01-15";
const CHEST_AFTER = chestStepsFor(10).map((step) => step - 1); // [2, 6] — compat da trilha padrão de 10 passos

function goal(over: Partial<Goal> = {}): Goal {
  return {
    id: "g1", name: "Viagem", icon: "landscape", targetCents: 500000, savedCents: 150000,
    installmentCents: null, steps: 10, currentStep: 3, chestsOpened: [], completed: false, deadline: null,
    frequency: null, trailStartDate: null, ...over,
  };
}

describe("currentStepOf", () => {
  it("usa currentStep normalmente", () => expect(currentStepOf(goal({ currentStep: 4 }))).toBe(4));
  it("meta concluída = todos os passos feitos", () => expect(currentStepOf(goal({ completed: true, steps: 10, currentStep: 4 }))).toBe(10));
});

describe("nodeStateOf", () => {
  const g = goal({ currentStep: 3 });
  it("nós antes do atual: done", () => expect(nodeStateOf(g, 0)).toBe("done"));
  it("nó atual: current", () => expect(nodeStateOf(g, 3)).toBe("current"));
  it("nós depois: locked", () => expect(nodeStateOf(g, 9)).toBe("locked"));
});

describe("stepAmountOf", () => {
  it("divide o alvo igualmente pelos passos", () => {
    const g = goal({ targetCents: 500000, steps: 10 });
    expect(stepAmountOf(g, 0)).toBe(50000);
    expect(stepAmountOf(g, 5)).toBe(50000);
  });

  it("último passo absorve o resto do arredondamento (soma bate com o alvo)", () => {
    const g = goal({ targetCents: 100000, steps: 3 }); // 100000/3 = 33333.33
    const amounts = Array.from({ length: 3 }, (_, i) => stepAmountOf(g, i));
    expect(amounts.reduce((a, b) => a + b, 0)).toBe(100000);
    expect(amounts[2]).not.toBe(amounts[0]);
  });
});

describe("installmentByDeadline", () => {
  it("sem prazo, retorna null", () => {
    expect(installmentByDeadline(500000, 150000, null, TODAY)).toBeNull();
  });

  it("prazo já vencido, retorna null (cai no cálculo padrão)", () => {
    expect(installmentByDeadline(500000, 150000, "2026-01-01", TODAY)).toBeNull();
  });

  it("divide o que falta pelos meses restantes, arredondando pra cima", () => {
    // falta 350000, prazo em 2026-04-15 = 3 meses exatos a partir de 2026-01-15
    expect(installmentByDeadline(500000, 150000, "2026-04-15", TODAY)).toBe(Math.ceil(350000 / 3));
  });

  it("prazo antes do dia do mês atual conta um mês a menos (arredonda pra cima)", () => {
    // 2026-04-10 é só 2 meses e alguns dias depois de 2026-01-15 → 2 meses inteiros
    expect(installmentByDeadline(500000, 150000, "2026-04-10", TODAY)).toBe(Math.ceil(350000 / 2));
  });

  it("meta já vencida no mesmo mês usa no mínimo 1 mês (nunca divide por 0)", () => {
    expect(installmentByDeadline(500000, 150000, "2026-01-20", TODAY)).toBe(350000);
  });
});

describe("suggestedStepAmountOf", () => {
  it("sem parcela e sem prazo, sugere o valor calculado (divisão igual)", () => {
    const g = goal({ targetCents: 500000, steps: 10, installmentCents: null, deadline: null });
    expect(suggestedStepAmountOf(g, 0, TODAY)).toBe(stepAmountOf(g, 0));
  });

  it("com parcela manual configurada, sugere a parcela em vez do valor calculado", () => {
    const g = goal({ targetCents: 500000, steps: 10, installmentCents: 80000, deadline: null });
    expect(suggestedStepAmountOf(g, 0, TODAY)).toBe(80000);
    expect(suggestedStepAmountOf(g, 0, TODAY)).not.toBe(stepAmountOf(g, 0));
  });

  it("parcela zero ou negativa é ignorada (volta pro valor calculado)", () => {
    const g = goal({ targetCents: 500000, steps: 10, installmentCents: 0, deadline: null });
    expect(suggestedStepAmountOf(g, 0, TODAY)).toBe(stepAmountOf(g, 0));
  });

  it("sem parcela manual mas com prazo, sugere o valor gerado a partir da data", () => {
    const g = goal({ targetCents: 500000, savedCents: 150000, installmentCents: null, deadline: "2026-04-15" });
    expect(suggestedStepAmountOf(g, 0, TODAY)).toBe(Math.ceil(350000 / 3));
  });

  it("parcela manual tem prioridade sobre o prazo", () => {
    const g = goal({ targetCents: 500000, savedCents: 150000, installmentCents: 90000, deadline: "2026-04-15" });
    expect(suggestedStepAmountOf(g, 0, TODAY)).toBe(90000);
  });
});

describe("chestOpenedOf", () => {
  it("abre quando a trilha já passou do baú", () => {
    const g = goal({ currentStep: 4, chestsOpened: [] });
    expect(chestOpenedOf(g, CHEST_AFTER[0])).toBe(true); // baú após o nó 3 (índice 2)
  });

  it("fechado quando a trilha ainda não chegou e o back não marcou", () => {
    const g = goal({ currentStep: 1, chestsOpened: [] });
    expect(chestOpenedOf(g, CHEST_AFTER[0])).toBe(false);
  });

  it("respeita `chestsOpened` (1-based) vindo do back mesmo se currentStep ainda não passou", () => {
    const g = goal({ currentStep: 0, chestsOpened: [3] }); // baú após o nó de índice 2 = passo 3 (1-based)
    expect(chestOpenedOf(g, 2)).toBe(true);
  });
});

describe("chestStepsFor", () => {
  it("trilha padrão de 10 passos: baús após os passos 3 e 7 (compatibilidade)", () => {
    expect(chestStepsFor(10)).toEqual([3, 7]);
  });

  it("trilha curta: dedupe quando os dois baús cairiam no mesmo passo", () => {
    expect(chestStepsFor(2)).toEqual([1]);
  });

  it("trilha de 1 passo: sem baú", () => {
    expect(chestStepsFor(1)).toEqual([]);
  });
});

describe("scheduleDatesOf", () => {
  it("semanal: um aporte a cada 7 dias até o prazo", () => {
    expect(scheduleDatesOf("2026-09-30", "2026-10-21", "weekly")).toEqual(["2026-10-07", "2026-10-14", "2026-10-21"]);
  });

  it("quinzenal: um aporte a cada 15 dias, último absorve o resto", () => {
    expect(scheduleDatesOf("2026-09-30", "2026-11-20", "biweekly")).toEqual(["2026-10-15", "2026-10-30", "2026-11-14", "2026-11-20"]);
  });

  it("mensal: mesmo dia do mês, avançando", () => {
    expect(scheduleDatesOf("2026-09-30", "2026-12-30", "monthly")).toEqual(["2026-10-30", "2026-11-30", "2026-12-30"]);
  });

  it("prazo já vencido: sempre pelo menos 1 data (o prazo)", () => {
    expect(scheduleDatesOf("2026-09-30", "2026-09-30", "monthly")).toEqual(["2026-09-30"]);
  });

  it('mensal: dia 31 não fica "preso" em 28 depois de atravessar fevereiro', () => {
    expect(scheduleDatesOf("2026-01-31", "2026-05-31", "monthly")).toEqual(["2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31"]);
  });
});

describe("hasDateSchedule", () => {
  it("true só quando deadline + frequency + trailStartDate estão presentes", () => {
    expect(hasDateSchedule(goal({ deadline: "2026-12-30", frequency: "monthly", trailStartDate: "2026-09-30" }))).toBe(true);
  });

  it("false sem frequency (trilha por dinheiro)", () => {
    expect(hasDateSchedule(goal({ deadline: "2026-12-30", frequency: null, trailStartDate: null }))).toBe(false);
  });
});

describe("nodeDateOf", () => {
  it("sem schedule ativo, retorna null", () => {
    expect(nodeDateOf(goal(), 0)).toBeNull();
  });

  it("com schedule ativo, retorna a data daquele nó", () => {
    const g = goal({ deadline: "2026-12-30", frequency: "monthly", trailStartDate: "2026-09-30", steps: 3 });
    expect(nodeDateOf(g, 0)).toBe("2026-10-30");
    expect(nodeDateOf(g, 2)).toBe("2026-12-30");
  });
});
