import { addDaysISO, parseISODate, todayISO } from "@/lib/dates";
import { isScheduled } from "./catalog";

type HabitLike = { weekdays: number[]; checks: string[]; createdAt: string | null };

/**
 * O dia conta para a consistência? Precisa estar agendado, não ser antes da
 * criação nem futuro. Hoje só conta depois de marcado (o dia não acabou).
 */
export function countsForRate(h: HabitLike, day: string, today: string, checked: Set<string>): boolean {
  if (day > today) return false;
  if (h.createdAt && day < h.createdAt) return false;
  if (!isScheduled(h, day)) return false;
  return day !== today || checked.has(day);
}

/** Dias feitos / dias que contam entre `from` e `to` (inclusive). */
export function tally(h: HabitLike, from: string, to: string, today: string): { done: number; total: number } {
  const checked = new Set(h.checks);
  let done = 0;
  let total = 0;
  for (let d = from; d <= to; d = addDaysISO(d, 1)) {
    if (!countsForRate(h, d, today, checked)) continue;
    total += 1;
    if (checked.has(d)) done += 1;
  }
  return { done, total };
}

/** % dos dias agendados cumpridos nos últimos `days` dias; null quando nenhum dia conta ainda. */
export function habitRate(h: HabitLike, days = 30, today = todayISO()): number | null {
  const { done, total } = tally(h, addDaysISO(today, -(days - 1)), today, today);
  return total ? Math.round((done / total) * 100) : null;
}

/** Segunda-feira da semana de `day`. */
export function weekStart(day: string): string {
  const wd = parseISODate(day).getUTCDay();
  return addDaysISO(day, -((wd + 6) % 7));
}

/** Consistência somada de todos os hábitos, por semana (seg–dom), das `weeks` últimas semanas. */
export function weeklyRates(
  habits: HabitLike[],
  weeks = 12,
  today = todayISO(),
): { week: string; pct: number | null; done: number; total: number }[] {
  const lastMonday = weekStart(today);
  return Array.from({ length: weeks }, (_, i) => {
    const week = addDaysISO(lastMonday, -7 * (weeks - 1 - i));
    let done = 0;
    let total = 0;
    for (const h of habits) {
      const t = tally(h, week, addDaysISO(week, 6), today);
      done += t.done;
      total += t.total;
    }
    return { week, done, total, pct: total ? Math.round((done / total) * 100) : null };
  });
}

export type HeatCell = { day: string; state: "done" | "missed" | "off" | "future" };

/** Grade de `weeks` colunas (seg→dom) terminando na semana de hoje. */
export function heatmap(h: HabitLike, weeks = 13, today = todayISO()): HeatCell[][] {
  const checked = new Set(h.checks);
  const first = addDaysISO(weekStart(today), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, i) => {
      const day = addDaysISO(first, w * 7 + i);
      if (day > today) return { day, state: "future" as const };
      if (checked.has(day)) return { day, state: "done" as const };
      return { day, state: countsForRate(h, day, today, checked) ? ("missed" as const) : ("off" as const) };
    }),
  );
}
