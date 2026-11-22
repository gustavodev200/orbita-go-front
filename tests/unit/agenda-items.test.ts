import { describe, expect, it } from "vitest";

import { agendaForDay, buildAgenda, isPastSlot, slotMinTimeFor } from "@/features/agenda/agenda-items";
import type { Recurring, Reminder, Task } from "@/lib/api/schemas";

function reminder(over: Partial<Reminder> = {}): Reminder {
  return {
    id: "r1",
    title: "Remédio",
    kind: "task",
    time: "08:00",
    repeat: "daily",
    dayOfMonth: null,
    weekday: null,
    date: null,
    enabled: true,
    taskId: null,
    ...over,
  };
}

function task(over: Partial<Task> = {}): Task {
  return { id: "t1", title: "Dentista", dueDate: "2026-10-02", priority: "medium", reminderAt: null, done: false, doneAt: null, ...over };
}

function bill(over: Partial<Recurring> = {}): Recurring {
  return {
    id: "b1",
    description: "Aluguel",
    amountCents: 180000,
    categoryKey: "cas",
    type: "expense",
    frequency: "monthly",
    dueDay: 5,
    endDate: null,
    accountId: null,
    status: "pending",
    dueDate: "2026-10-05",
    paidAt: null,
    ...over,
  };
}

describe("buildAgenda", () => {
  it("expande lembrete diário em todos os dias do intervalo", () => {
    const items = buildAgenda({ reminders: [reminder()] }, "2026-10-01", "2026-10-04");
    expect(items.map((i) => i.date)).toEqual(["2026-10-01", "2026-10-02", "2026-10-03"]);
    expect(new Set(items.map((i) => i.key)).size).toBe(3);
  });

  it("ignora lembretes desativados e espelhos de tarefa", () => {
    const items = buildAgenda(
      { reminders: [reminder({ enabled: false }), reminder({ id: "r2", taskId: "t1" })] },
      "2026-10-01",
      "2026-10-04",
    );
    expect(items).toEqual([]);
  });

  it("junta tarefas e contas no intervalo e ordena por data e horário", () => {
    const items = buildAgenda(
      {
        reminders: [reminder({ repeat: "none", date: "2026-10-02", time: "07:00" })],
        tasks: [task({ reminderAt: "2026-10-02T09:30:00-03:00" }), task({ id: "t2", dueDate: null })],
        recurrings: [bill()],
      },
      "2026-10-01",
      "2026-10-08",
    );
    expect(items.map((i) => [i.kind, i.date, i.time])).toEqual([
      ["reminder", "2026-10-02", "07:00"],
      ["task", "2026-10-02", "09:30"],
      ["bill", "2026-10-05", null],
    ]);
  });

  it("conta paga aparece concluída", () => {
    const [item] = agendaForDay({ recurrings: [bill({ status: "paid" })] }, "2026-10-05");
    expect(item.done).toBe(true);
  });
});

describe("slotMinTimeFor", () => {
  it("padrão 06:00 quando nada começa antes", () => {
    expect(slotMinTimeFor([{ time: "09:00" }, { time: null }])).toBe("06:00:00");
  });
  it("desce até a hora do item mais cedo", () => {
    expect(slotMinTimeFor([{ time: "05:30" }, { time: "09:00" }])).toBe("05:00:00");
    expect(slotMinTimeFor([{ time: "00:15" }])).toBe("00:00:00");
  });
});

describe("isPastSlot", () => {
  const now = new Date(2026, 10, 22, 10, 30); // 22/11 10:30 (hora local)
  it("horário que já passou", () => {
    expect(isPastSlot("2026-11-22", "10:00", now)).toBe(true);
    expect(isPastSlot("2026-11-21", "23:00", now)).toBe(true);
  });
  it("horário ainda por vir", () => {
    expect(isPastSlot("2026-11-22", "10:30", now)).toBe(false);
    expect(isPastSlot("2026-11-23", "08:00", now)).toBe(false);
  });
});
