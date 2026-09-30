// Formatação pt-BR / BRL. Dinheiro sempre chega em centavos (inteiro).
const BRL = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const MINUS = "−"; // "−" tipográfico, igual ao design

/** 123456 → "R$ 1.234,56". Negativo ganha "−"; `sign: "always"` põe "+" nos positivos. */
export function formatBRL(
  cents: number,
  opts: { sign?: "auto" | "always" | "never"; compact?: boolean } = {},
): string {
  const { sign = "auto", compact = false } = opts;
  const abs = Math.abs(Math.round(cents)) / 100;
  let body = BRL.format(abs);
  if (compact && body.endsWith(",00")) body = body.slice(0, -3);
  // Intl pode usar NBSP em alguns runtimes; o design usa espaço normal.
  const text = `R$ ${body}`;
  if (sign === "never") return text;
  if (cents < 0) return `${MINUS}${text}`;
  if (sign === "always") return `+${text}`;
  return text;
}

/** Valor com sinal pelo tipo: saída "−R$ 45,00", entrada "+R$ 6.200,00". */
export function formatSigned(cents: number, type: "expense" | "income"): string {
  return `${type === "expense" ? MINUS : "+"}${formatBRL(Math.abs(cents))}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

/** "1.234,56" | "1234,56" | "1234.56" → centavos. */
export function parseBRLToCents(value: string): number {
  const clean = value.replace(/[^\d.,]/g, "");
  if (!clean) return 0;
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Máscara "caixa registradora": dígitos entram como centavos. "749" → "7,49". */
export function maskBRLInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 10);
  if (!digits) return "";
  return BRL.format(Number(digits) / 100);
}
