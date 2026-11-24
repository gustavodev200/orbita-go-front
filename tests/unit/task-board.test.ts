import { describe, expect, it } from "vitest";

import {
  NO_FILTERS,
  dropPosition,
  dueInfo,
  groupByStatus,
  isFiltering,
  matchesFilters,
  normalize,
  positionBetween,
} from "@/features/tasks/board/board-model";
import type { Task } from "@/lib/api/schemas";

const TODAY = "2026-11-24";

function task(over: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Tarefa",
    dueDate: null,
    priority: "medium",
    reminderAt: null,
    done: false,
    doneAt: null,
    status: "todo",
    position: 1,
    objectiveId: null,
    ...over,
  };
}

describe("positionBetween / dropPosition", () => {
  it("calcula a média entre vizinhos e extrapola nas pontas", () => {
    expect(positionBetween()).toBe(1);
    expect(positionBetween(undefined, 4)).toBe(3);
    expect(positionBetween(4, undefined)).toBe(5);
    expect(positionBetween(1, 2)).toBe(1.5);
  });

  it("ignora o próprio card arrastado ao calcular a posição", () => {
    const col = [task({ id: "a", position: 1 }), task({ id: "b", position: 2 }), task({ id: "c", position: 3 })];
    // arrasta "a" para entre "b" e "c" (índice 1 na lista sem "a")
    expect(dropPosition(col, "a", 1)).toBe(2.5);
    // card de outra coluna solto no topo
    expect(dropPosition(col, "x", 0)).toBe(0);
    // índice além do fim prende no fim
    expect(dropPosition(col, "x", 99)).toBe(4);
    expect(dropPosition([], "x", 0)).toBe(1);
  });
});

describe("groupByStatus", () => {
  it("separa por coluna e ordena pela posição", () => {
    const g = groupByStatus([
      task({ id: "b", position: 2 }),
      task({ id: "a", position: 1 }),
      task({ id: "d", status: "done", done: true, position: -1 }),
      task({ id: "k", status: "doing" }),
    ]);
    expect(g.todo.map((t) => t.id)).toEqual(["a", "b"]);
    expect(g.doing.map((t) => t.id)).toEqual(["k"]);
    expect(g.done.map((t) => t.id)).toEqual(["d"]);
    expect(g.backlog).toEqual([]);
  });
});

describe("filtros", () => {
  it("busca ignora acento e caixa", () => {
    expect(normalize("  Reunião ÀS 10 ")).toBe("reuniao as 10");
    expect(matchesFilters(task({ title: "Reunião com time" }), { ...NO_FILTERS, query: "reuniao" }, TODAY)).toBe(true);
    expect(matchesFilters(task({ title: "Academia" }), { ...NO_FILTERS, query: "reuniao" }, TODAY)).toBe(false);
  });

  it("filtra por prioridade e prazo", () => {
    const late = task({ dueDate: "2026-11-20" });
    const today = task({ dueDate: TODAY });
    const nextWeek = task({ dueDate: "2026-11-30" });
    const far = task({ dueDate: "2026-12-10" });
    const none = task();
    const f = (due: typeof NO_FILTERS.due) => ({ ...NO_FILTERS, due });
    expect([late, today, nextWeek, far, none].filter((t) => matchesFilters(t, f("overdue"), TODAY))).toEqual([late]);
    expect([late, today, nextWeek, far, none].filter((t) => matchesFilters(t, f("week"), TODAY))).toEqual([today, nextWeek]);
    expect([late, today, nextWeek, far, none].filter((t) => matchesFilters(t, f("none"), TODAY))).toEqual([none]);
    // concluída não conta como atrasada
    expect(matchesFilters(task({ dueDate: "2026-11-20", done: true }), f("overdue"), TODAY)).toBe(false);
    expect(matchesFilters(task({ priority: "high" }), { ...NO_FILTERS, priority: "low" }, TODAY)).toBe(false);
    expect(isFiltering(NO_FILTERS)).toBe(false);
    expect(isFiltering({ ...NO_FILTERS, query: "  " })).toBe(false);
    expect(isFiltering(f("today"))).toBe(true);
  });
});

describe("dueInfo", () => {
  it("rotula o prazo do card", () => {
    expect(dueInfo(task(), TODAY)).toBeNull();
    expect(dueInfo(task({ dueDate: "2026-11-20" }), TODAY)).toEqual({ label: "Atrasada · 20/11", tone: "late" });
    expect(dueInfo(task({ dueDate: TODAY }), TODAY)).toEqual({ label: "Hoje", tone: "today" });
    expect(dueInfo(task({ dueDate: "2026-11-25" }), TODAY)).toEqual({ label: "Amanhã", tone: "soon" });
    expect(dueInfo(task({ dueDate: "2026-11-20", done: true }), TODAY)?.tone).toBe("normal");
  });
});
