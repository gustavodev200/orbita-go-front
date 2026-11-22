import { describe, expect, it } from "vitest";

import { nextFireDate, occursOn, occurrencesBetween, scheduleFromDate, whenLabel } from "@/features/reminders/recurrence";
import type { ReminderDraft } from "@/lib/api/schemas";

const TODAY = "2026-09-30"; // quarta-feira

function draft(over: Partial<ReminderDraft> = {}): ReminderDraft {
  return { title: "Pagar o aluguel", kind: "finance", time: "09:00", repeat: "none", dayOfMonth: null, weekday: null, date: null, ...over };
}

describe("whenLabel", () => {
  it("mensal com dia marcado", () => {
    expect(whenLabel(draft({ repeat: "monthly", dayOfMonth: 5 }), TODAY)).toBe("Todo dia 5");
  });
  it("mensal sem dia", () => {
    expect(whenLabel(draft({ repeat: "monthly", dayOfMonth: null }), TODAY)).toBe("Todo mês");
  });
  it("semanal com dia da semana", () => {
    expect(whenLabel(draft({ repeat: "weekly", weekday: 1 }), TODAY)).toBe("Toda segunda");
  });
  it("semanal sem dia da semana", () => {
    expect(whenLabel(draft({ repeat: "weekly", weekday: null }), TODAY)).toBe("Toda semana");
  });
  it("diário", () => {
    expect(whenLabel(draft({ repeat: "daily" }), TODAY)).toBe("Todo dia");
  });
  it("uma vez, sem data: hoje", () => {
    expect(whenLabel(draft({ repeat: "none", date: null }), TODAY)).toBe("Hoje");
  });
  it("uma vez, com a data de hoje", () => {
    expect(whenLabel(draft({ repeat: "none", date: TODAY }), TODAY)).toBe("Hoje");
  });
  it("uma vez, amanhã", () => {
    expect(whenLabel(draft({ repeat: "none", date: "2026-10-01" }), TODAY)).toBe("Amanhã, 01/10");
  });
  it("uma vez, outra data", () => {
    expect(whenLabel(draft({ repeat: "none", date: "2026-10-15" }), TODAY)).toBe("15/10");
  });
});

describe("nextFireDate", () => {
  it("mensal: mesmo mês quando o dia ainda não passou", () => {
    expect(nextFireDate(draft({ repeat: "monthly", dayOfMonth: 30 }), TODAY)).toBe("2026-09-30");
  });
  it("mensal: mês seguinte quando o dia já passou", () => {
    expect(nextFireDate(draft({ repeat: "monthly", dayOfMonth: 5 }), TODAY)).toBe("2026-10-05");
  });
  it("semanal: próxima ocorrência do dia da semana", () => {
    // hoje é quarta (3); pedir domingo (0) -> 4 dias à frente
    expect(nextFireDate(draft({ repeat: "weekly", weekday: 0 }), TODAY)).toBe("2026-10-04");
    // pedir a própria quarta -> hoje
    expect(nextFireDate(draft({ repeat: "weekly", weekday: 3 }), TODAY)).toBe(TODAY);
  });
  it("sem repetição, usa a data do rascunho ou hoje", () => {
    expect(nextFireDate(draft({ repeat: "none", date: "2026-12-25" }), TODAY)).toBe("2026-12-25");
    expect(nextFireDate(draft({ repeat: "none", date: null }), TODAY)).toBe(TODAY);
  });
});

describe("occursOn", () => {
  it("diário ocorre todo dia", () => {
    expect(occursOn(draft({ repeat: "daily" }), "2026-10-07")).toBe(true);
  });
  it("semanal só no dia da semana", () => {
    expect(occursOn(draft({ repeat: "weekly", weekday: 3 }), TODAY)).toBe(true);
    expect(occursOn(draft({ repeat: "weekly", weekday: 1 }), TODAY)).toBe(false);
  });
  it("mensal em mês curto cai no último dia (igual ao back)", () => {
    expect(occursOn(draft({ repeat: "monthly", dayOfMonth: 31 }), "2026-09-30")).toBe(true);
    expect(occursOn(draft({ repeat: "monthly", dayOfMonth: 31 }), "2026-09-29")).toBe(false);
  });
  it("uma vez: só na data; sem data não aparece", () => {
    expect(occursOn(draft({ repeat: "none", date: "2026-10-02" }), "2026-10-02")).toBe(true);
    expect(occursOn(draft({ repeat: "none", date: null }), TODAY)).toBe(false);
  });
});

describe("occurrencesBetween", () => {
  it("lista as quartas de outubro (fim exclusivo)", () => {
    expect(occurrencesBetween(draft({ repeat: "weekly", weekday: 3 }), "2026-10-01", "2026-10-29")).toEqual([
      "2026-10-07",
      "2026-10-14",
      "2026-10-21",
      "2026-10-28",
    ]);
  });
});

describe("scheduleFromDate", () => {
  it("semanal usa o dia da semana da data", () => {
    expect(scheduleFromDate("weekly", TODAY)).toMatchObject({ repeat: "weekly", weekday: 3, date: null });
  });
  it("mensal usa o dia do mês", () => {
    expect(scheduleFromDate("monthly", "2026-10-05")).toMatchObject({ repeat: "monthly", dayOfMonth: 5 });
  });
  it("uma vez guarda a data", () => {
    expect(scheduleFromDate("none", "2026-10-05")).toMatchObject({ repeat: "none", date: "2026-10-05" });
  });
});
