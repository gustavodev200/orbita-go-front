import { describe, expect, it } from "vitest";

import { isMoney } from "@/features/today/missions-section";
import type { Mission } from "@/lib/api/schemas";

function mission(over: Partial<Mission> = {}): Mission {
  return { key: "m", title: "m", icon: "flag", progress: 0, target: 3, xp: 10, coins: 2, claimed: false, unit: "count", ...over };
}

describe("isMoney (fallback de `unit` — API_CONTRACT Pedidos do front)", () => {
  it("usa `unit` quando o back manda", () => {
    expect(isMoney(mission({ unit: "cents", target: 3 }))).toBe(true);
    expect(isMoney(mission({ unit: "count", target: 8000 }))).toBe(false);
  });

  it("sem `unit`, deduz por target >= 1000 (cobre gastar-pouco)", () => {
    expect(isMoney(mission({ unit: undefined, target: 8000 }))).toBe(true);
    expect(isMoney(mission({ unit: null as unknown as undefined, target: 8000 }))).toBe(true);
    expect(isMoney(mission({ unit: undefined, target: 3 }))).toBe(false);
    expect(isMoney(mission({ unit: undefined, target: 999 }))).toBe(false);
    expect(isMoney(mission({ unit: undefined, target: 1000 }))).toBe(true);
  });
});
