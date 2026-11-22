import { describe, expect, it } from "vitest";

import { isScheduled, weekdaysLabel } from "@/features/habits/catalog";

describe("isScheduled", () => {
  it("respeita os dias da semana do hábito", () => {
    // 2026-11-20 é sexta (5); 2026-11-21 é sábado (6).
    expect(isScheduled({ weekdays: [1, 3, 5] }, "2026-11-20")).toBe(true);
    expect(isScheduled({ weekdays: [1, 3, 5] }, "2026-11-21")).toBe(false);
  });
});

describe("weekdaysLabel", () => {
  it("todos os dias", () => {
    expect(weekdaysLabel([0, 1, 2, 3, 4, 5, 6])).toBe("Todo dia");
  });
  it("dias úteis", () => {
    expect(weekdaysLabel([1, 2, 3, 4, 5])).toBe("Seg a sex");
  });
  it("fim de semana", () => {
    expect(weekdaysLabel([0, 6])).toBe("Fim de semana");
  });
  it("lista os dias na ordem da semana", () => {
    expect(weekdaysLabel([5, 1, 3])).toBe("Seg, Qua, Sex");
  });
});
