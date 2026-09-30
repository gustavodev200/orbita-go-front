import { describe, expect, it } from "vitest";

import { FALLBACK_CATEGORIES, findCategory } from "@/lib/categories";
import type { Category } from "@/lib/api/schemas";

describe("findCategory", () => {
  it("prioriza a lista vinda do back", () => {
    const fromApi: Category[] = [{ key: "ali", name: "Comida", icon: "restaurant", color: "#111111", type: "expense" }];
    expect(findCategory(fromApi, "ali")).toEqual(fromApi[0]);
  });

  it("cai no catálogo fixo quando a chave não está na lista do back", () => {
    const fromApi: Category[] = [{ key: "ali", name: "Comida", icon: "restaurant", color: "#111111", type: "expense" }];
    const mercado = FALLBACK_CATEGORIES.find((c) => c.key === "mer")!;
    expect(findCategory(fromApi, "mer")).toEqual(mercado);
  });

  it("chave totalmente desconhecida vira 'Outros' (nunca quebra a UI)", () => {
    expect(findCategory([], "chave-nova")).toEqual({ key: "chave-nova", type: "expense", name: "Outros", icon: "more_horiz", color: "#9A8C7E" });
  });
});
