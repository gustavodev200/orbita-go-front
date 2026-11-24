import { describe, expect, it } from "vitest";

import { habitRate, heatmap, weekStart, weeklyRates } from "@/features/habits/consistency";

// 2026-11-20 é sexta-feira.
const TODAY = "2026-11-20";
const ALL = [0, 1, 2, 3, 4, 5, 6];

describe("weekStart", () => {
  it("volta para a segunda-feira", () => {
    expect(weekStart("2026-11-20")).toBe("2026-11-16");
    expect(weekStart("2026-11-16")).toBe("2026-11-16");
    expect(weekStart("2026-11-22")).toBe("2026-11-16"); // domingo
  });
});

describe("habitRate", () => {
  it("ignora dias antes da criação e hoje ainda não marcado", () => {
    const h = { weekdays: ALL, checks: ["2026-11-18"], createdAt: "2026-11-18" };
    // conta 18 (✓) e 19 (✗); hoje (20) sem marcação não conta
    expect(habitRate(h, 30, TODAY)).toBe(50);
  });

  it("hoje marcado conta", () => {
    const h = { weekdays: ALL, checks: ["2026-11-19", "2026-11-20"], createdAt: "2026-11-19" };
    expect(habitRate(h, 30, TODAY)).toBe(100);
  });

  it("só dias agendados entram", () => {
    // seg/qua/sex desde 16/11: 16 ✓, 18 ✗, 20 ✓
    const h = { weekdays: [1, 3, 5], checks: ["2026-11-16", "2026-11-20"], createdAt: "2026-11-16" };
    expect(habitRate(h, 30, TODAY)).toBe(67);
  });

  it("nenhum dia contável → null", () => {
    const h = { weekdays: ALL, checks: [], createdAt: TODAY };
    expect(habitRate(h, 30, TODAY)).toBeNull();
  });
});

describe("weeklyRates", () => {
  it("soma todos os hábitos por semana, semanas sem dados = null", () => {
    const a = { weekdays: ALL, checks: ["2026-11-16", "2026-11-17"], createdAt: "2026-11-16" };
    const b = { weekdays: ALL, checks: ["2026-11-16"], createdAt: "2026-11-16" };
    const out = weeklyRates([a, b], 2, TODAY);
    expect(out[0]).toMatchObject({ week: "2026-11-09", pct: null });
    // 16–19 contam (hoje não marcado): a 2/4, b 1/4 → 3/8
    expect(out[1]).toMatchObject({ week: "2026-11-16", done: 3, total: 8, pct: 38 });
  });
});

describe("heatmap", () => {
  it("13 colunas × 7 dias, futuro marcado como future", () => {
    const h = { weekdays: ALL, checks: [TODAY], createdAt: "2026-11-01" };
    const grid = heatmap(h, 13, TODAY);
    expect(grid).toHaveLength(13);
    expect(grid[12]).toHaveLength(7);
    expect(grid[12][4]).toEqual({ day: TODAY, state: "done" });
    expect(grid[12][5].state).toBe("future");
    expect(grid[0][0].state).toBe("off"); // antes da criação
  });
});
