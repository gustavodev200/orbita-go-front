import { describe, expect, it } from "vitest";

import { challengeDays, currentDayIndex } from "@/features/challenges/catalog";

describe("challengeDays", () => {
  it("classifica feito, perdido, hoje e futuro", () => {
    const c = { startDate: "2026-11-18", durationDays: 7, checks: ["2026-11-18", "2026-11-20"] };
    const days = challengeDays(c, "2026-11-20");
    expect(days.map((d) => d.state)).toEqual(["done", "missed", "done", "future", "future", "future", "future"]);
    expect(challengeDays(c, "2026-11-21")[3]).toEqual({ day: "2026-11-21", index: 4, state: "today" });
  });
});

describe("currentDayIndex", () => {
  it("dia 1 no início, limitado ao total e a 0 antes de começar", () => {
    const c = { startDate: "2026-11-18", durationDays: 7 };
    expect(currentDayIndex(c, "2026-11-18")).toBe(1);
    expect(currentDayIndex(c, "2026-12-30")).toBe(7);
    expect(currentDayIndex(c, "2026-11-10")).toBe(0);
  });
});
