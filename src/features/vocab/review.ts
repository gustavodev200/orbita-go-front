import type { Flashcard } from "@/lib/api/schemas";

export type ReviewResult = "correct" | "wrong";

/** % de acerto do card (null se nunca revisado). */
export function accuracy(card: Pick<Flashcard, "correctCount" | "wrongCount">): number | null {
  const total = card.correctCount + card.wrongCount;
  return total === 0 ? null : Math.round((card.correctCount / total) * 100);
}

/** Resumo da rodada: acertos, total e os cards errados (para repetir). */
export function summarize(results: Record<string, ReviewResult>, cards: Flashcard[]) {
  const answered = cards.filter((c) => results[c.id]);
  const missed = answered.filter((c) => results[c.id] === "wrong");
  return { correct: answered.length - missed.length, total: answered.length, missed };
}
