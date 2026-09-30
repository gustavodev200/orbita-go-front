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
