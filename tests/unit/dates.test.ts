import { describe, expect, it } from "vitest";

import { addMonthsISO } from "@/lib/dates";

describe("addMonthsISO", () => {
  it("avança o mesmo dia do mês", () => {
    expect(addMonthsISO("2026-01-15", 1)).toBe("2026-02-15");
  });

  it("clampa pro último dia quando o mês de destino é mais curto", () => {
    expect(addMonthsISO("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("respeita ano bissexto ao clampar fevereiro", () => {
    expect(addMonthsISO("2028-01-31", 1)).toBe("2028-02-29");
  });

  it("atravessa o ano corretamente", () => {
    expect(addMonthsISO("2026-12-15", 1)).toBe("2027-01-15");
  });
});
