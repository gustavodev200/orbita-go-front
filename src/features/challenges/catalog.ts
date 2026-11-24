import type { Challenge } from "@/lib/api/schemas";
import { addDaysISO, diffDays, todayISO } from "@/lib/dates";

export const CHALLENGE_DURATIONS = [7, 21, 30] as const;
export type ChallengeDuration = (typeof CHALLENGE_DURATIONS)[number];

export const CHALLENGE_ICONS = ["bolt", "menu_book", "fitness_center", "no_food", "water_drop", "self_improvement", "savings", "translate", "bedtime", "phonelink_off"] as const;
export const CHALLENGE_COLORS = ["#FF6A1F", "#3B82F6", "#16A34A", "#8B5CF6", "#EC4899", "#F59E0B"] as const;

/** Ideias prontas (um toque preenche o formulário). */
export const CHALLENGE_IDEAS: { title: string; icon: (typeof CHALLENGE_ICONS)[number]; days: ChallengeDuration }[] = [
  { title: "Ler 10 páginas por dia", icon: "menu_book", days: 21 },
  { title: "Estudar inglês 20 min", icon: "translate", days: 30 },
  { title: "Treinar todo dia", icon: "fitness_center", days: 21 },
  { title: "Sem açúcar", icon: "no_food", days: 7 },
  { title: "Sem delivery", icon: "savings", days: 30 },
  { title: "Celular longe antes de dormir", icon: "phonelink_off", days: 7 },
];

export type ChallengeDay = { day: string; index: number; state: "done" | "missed" | "today" | "future" };

/** Os N dias do desafio, com o estado de cada um. */
export function challengeDays(c: Pick<Challenge, "startDate" | "durationDays" | "checks">, today = todayISO()): ChallengeDay[] {
  const checked = new Set(c.checks);
  return Array.from({ length: c.durationDays }, (_, i) => {
    const day = addDaysISO(c.startDate, i);
    let state: ChallengeDay["state"];
    if (checked.has(day)) state = "done";
    else if (day === today) state = "today";
    else if (day < today) state = "missed";
    else state = "future";
    return { day, index: i + 1, state };
  });
}

/** Em que dia do desafio estamos (1..N), limitado ao intervalo. */
export function currentDayIndex(c: Pick<Challenge, "startDate" | "durationDays">, today = todayISO()): number {
  return Math.min(c.durationDays, Math.max(0, diffDays(c.startDate, today) + 1));
}
