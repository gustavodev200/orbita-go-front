import { describe, expect, it } from "vitest";

import type { AppNotification } from "@/features/notifications/api";
import { groupByDay, quickActions, timeAgo } from "@/features/notifications/notification-meta";

// 12:00 em São Paulo de 2026-11-20.
const NOW = new Date("2026-11-20T15:00:00.000Z");

function n(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: "1",
    kind: "task_overdue",
    severity: "important",
    title: "t",
    body: "b",
    url: "/tarefas",
    entityId: "e1",
    read: false,
    createdAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("timeAgo", () => {
  it("formata minutos, horas e dias", () => {
    expect(timeAgo("2026-11-20T14:59:40.000Z", NOW)).toBe("Agora");
    expect(timeAgo("2026-11-20T14:50:00.000Z", NOW)).toBe("Há 10 min");
    expect(timeAgo("2026-11-20T12:00:00.000Z", NOW)).toBe("Há 3 h");
    expect(timeAgo("2026-11-19T12:00:00.000Z", NOW)).toBe("Há 1 dia");
    expect(timeAgo("2026-11-15T12:00:00.000Z", NOW)).toBe("Há 5 dias");
  });
});

describe("groupByDay", () => {
  it("separa Hoje, Ontem e Anteriores no fuso de negócio", () => {
    const groups = groupByDay(
      [
        n({ id: "a" }),
        // 01:00 UTC do dia 20 = 22:00 do dia 19 em São Paulo → Ontem
        n({ id: "b", createdAt: "2026-11-20T01:00:00.000Z" }),
        n({ id: "c", createdAt: "2026-11-10T12:00:00.000Z" }),
      ],
      NOW,
    );
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ["Hoje", ["a"]],
      ["Ontem", ["b"]],
      ["Anteriores", ["c"]],
    ]);
  });
});

describe("quickActions", () => {
  it("oferece ações só quando há um registro alvo", () => {
    expect(quickActions(n())).toEqual(["complete-task", "postpone-task"]);
    expect(quickActions(n({ entityId: null }))).toEqual([]);
    expect(quickActions(n({ kind: "habit_pending" }))).toEqual(["check-habit"]);
    expect(quickActions(n({ kind: "challenge_checkin" }))).toEqual(["check-challenge"]);
    expect(quickActions(n({ kind: "bill_overdue" }))).toEqual([]);
  });
});
