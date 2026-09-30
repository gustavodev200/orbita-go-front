import type { Category } from "@/lib/api/schemas";

// Catálogo fixo (keys = ids do design, iguais ao back). A fonte da verdade é
// GET /categories; isto é fallback enquanto carrega ou se o back cair.
export const FALLBACK_CATEGORIES: Category[] = [
  { key: "ali", name: "Alimentação", icon: "restaurant", color: "#FF8A1E", type: "expense" },
  { key: "mer", name: "Mercado", icon: "shopping_cart", color: "#20B878", type: "expense" },
  { key: "tra", name: "Transporte", icon: "directions_car", color: "#2E8BEF", type: "expense" },
  { key: "cas", name: "Casa", icon: "home", color: "#8B5CF6", type: "expense" },
  { key: "laz", name: "Lazer", icon: "sports_esports", color: "#EC4E9C", type: "expense" },
  { key: "sau", name: "Saúde", icon: "medication", color: "#EE5A4F", type: "expense" },
  { key: "ass", name: "Assinaturas", icon: "subscriptions", color: "#12B3C4", type: "expense" },
  { key: "edu", name: "Educação", icon: "school", color: "#D39500", type: "expense" },
  { key: "pet", name: "Pets", icon: "pets", color: "#B5703A", type: "expense" },
  { key: "rou", name: "Roupas", icon: "apparel", color: "#6A7BD8", type: "expense" },
  { key: "out", name: "Outros", icon: "more_horiz", color: "#9A8C7E", type: "expense" },
  { key: "sal", name: "Salário", icon: "payments", color: "#2E8BEF", type: "income" },
  { key: "fre", name: "Freela", icon: "work", color: "#20B878", type: "income" },
  { key: "inv", name: "Rendimentos", icon: "trending_up", color: "#8B5CF6", type: "income" },
  { key: "pre", name: "Presente", icon: "redeem", color: "#EC4E9C", type: "income" },
];

const UNKNOWN: Omit<Category, "key" | "type"> = { name: "Outros", icon: "more_horiz", color: "#9A8C7E" };

export function findCategory(list: Category[], key: string): Category {
  return (
    list.find((c) => c.key === key) ??
    FALLBACK_CATEGORIES.find((c) => c.key === key) ?? { key, type: "expense", ...UNKNOWN }
  );
}

/** Ordem de exibição na grade do Novo lançamento (8 de saída, 4 de entrada). */
export const EXPENSE_GRID = ["ali", "mer", "tra", "cas", "laz", "sau", "ass", "out"];
export const INCOME_GRID = ["sal", "fre", "inv", "pre"];

/** Categorias pré-selecionadas no onboarding (todas de saída menos edu e pet). */
export const DEFAULT_DISABLED_KEYS = ["edu", "pet"];
