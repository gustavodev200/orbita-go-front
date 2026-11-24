import type { Flashcard, FlashcardRating } from "@/lib/api/schemas";

export type Rating = FlashcardRating;

/** Os 4 botões depois de virar o card (o intervalo de cada um vem do servidor). */
export const RATING_OPTIONS: {
  value: Rating;
  label: string;
  className: string;
}[] = [
  { value: "again", label: "Esqueci", className: "border-r/40 text-r" },
  { value: "hard", label: "Difícil", className: "border-bd text-ink" },
  { value: "good", label: "Lembrei", className: "border-g/40 text-g" },
  { value: "easy", label: "Fácil", className: "border-b/40 text-b" },
];

export const STATE_LABEL: Record<Flashcard["state"], string> = {
  new: "Novo",
  learning: "Aprendendo",
  review: "Revisão",
  relearning: "Reaprendendo",
};

const DAY_MS = 86_400_000;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const decimal = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");

/** "1 dia", "8 dias", "2 meses", "1,5 ano". */
export function formatDays(days: number): string {
  const d = Math.max(1, Math.round(days));
  if (d < 30) return plural(d, "dia", "dias");
  if (d < 365) return plural(Math.round(d / 30), "mês", "meses");
  const years = d / 365;
  return `${decimal(years)} ${years < 2 ? "ano" : "anos"}`;
}

/** Quando o card volta: "novo", "agora", "amanhã", "em 8 dias". */
export function dueLabel(card: Pick<Flashcard, "dueAt">, now = Date.now()): string {
  if (!card.dueAt) return "novo";
  const days = Math.ceil((new Date(card.dueAt).getTime() - now) / DAY_MS);
  if (days <= 0) return "agora";
  return days === 1 ? "amanhã" : `em ${formatDays(days)}`;
}

/** Próximo card a vencer (para "volte em X" quando a fila esvazia). */
export function nextDue(cards: Pick<Flashcard, "dueAt">[], now = Date.now()): string | null {
  let best: number | null = null;
  for (const c of cards) {
    if (!c.dueAt) continue;
    const t = new Date(c.dueAt).getTime();
    if (t > now && (best === null || t < best)) best = t;
  }
  return best === null ? null : new Date(best).toISOString();
}

/** % de acerto do card (null se nunca revisado). */
export function accuracy(card: Pick<Flashcard, "correctCount" | "wrongCount">): number | null {
  const total = card.correctCount + card.wrongCount;
  return total === 0 ? null : Math.round((card.correctCount / total) * 100);
}

export type Answer = { id: string; rating: Rating };

/** Resumo da rodada: respostas dadas, quantos lembrou e os esquecidos (sem repetir). */
export function summarize(answers: Answer[], cards: Flashcard[]) {
  const forgotten = new Set(answers.filter((a) => a.rating === "again").map((a) => a.id));
  const byId = new Map(cards.map((c) => [c.id, c]));
  const missed = [...forgotten].map((id) => byId.get(id)).filter((c): c is Flashcard => !!c);
  const remembered = answers.filter((a) => a.rating !== "again").length;
  return { total: answers.length, remembered, missed };
}
