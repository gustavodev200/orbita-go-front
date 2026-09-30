import { describe, expect, it } from "vitest";

import {
  CHEST_AFTER,
  chestOpenedOf,
  currentStepOf,
  installmentByDeadline,
  nodeStateOf,
  stepAmountOf,
  suggestedStepAmountOf,
} from "@/features/finance/goal-trail-math";
import type { Goal } from "@/lib/api/schemas";

const TODAY = "2026-01-15";

function goal(over: Partial<Goal> = {}): Goal {
  return {
    id: "g1", name: "Viagem", icon: "landscape", targetCents: 500000, savedCents: 150000,
    installmentCents: null, steps: 10, currentStep: 3, chestsOpened: [], completed: false, deadline: null, ...over,
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
