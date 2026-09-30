/** Fundo suave derivado de uma cor de categoria (equivale aos tokens `*s`). */
export function softOf(color: string, pct = 16): string {
  return `color-mix(in srgb, ${color} ${pct}%, var(--sf))`;
}

/** Paleta rotativa para itens sem cor própria (missões etc.). */
export const ROTATING_TONES = [
  { color: "var(--b)", soft: "var(--bs)" },
  { color: "var(--g)", soft: "var(--gs)" },
  { color: "var(--o)", soft: "var(--os)" },
  { color: "var(--p)", soft: "var(--ps)" },
] as const;

export const PRIORITY_COLOR = { high: "var(--r)", medium: "var(--o)", low: "var(--b)" } as const;
export const PRIORITY_LABEL = { high: "Alta", medium: "Média", low: "Baixa" } as const;

// API_CONTRACT "Pedidos do front": `Account.color` é opcional — sem o back
// mandar, mapeamos pelo nome das contas seed (Nubank/Itaú/Carteira).
const ACCOUNT_COLOR_BY_NAME: Record<string, string> = {
  nubank: "#8A05BE",
  itaú: "#EC7000",
  itau: "#EC7000",
  carteira: "#20B878",
};
const ACCOUNT_COLOR_FALLBACK = "#9A8C7E";

export function accountColor(account: { name: string; color?: string | null }): string {
  return account.color ?? ACCOUNT_COLOR_BY_NAME[account.name.trim().toLowerCase()] ?? ACCOUNT_COLOR_FALLBACK;
}
