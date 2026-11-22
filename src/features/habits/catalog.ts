import { parseISODate } from "@/lib/dates";

/** Ícones e cores sugeridos ao criar um hábito (catálogo pequeno e fixo). */
export const HABIT_ICONS = [
  "water_drop",
  "fitness_center",
  "self_improvement",
  "menu_book",
  "bedtime",
  "directions_walk",
  "nutrition",
  "medication",
  "edit_note",
  "savings",
] as const;

export const HABIT_COLORS = ["#FF6A1F", "#3B82F6", "#16A34A", "#8B5CF6", "#EC4899", "#F59E0B"] as const;

export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
/** Ordem de exibição: segunda primeiro. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function isScheduled(habit: { weekdays: number[] }, day: string): boolean {
  return habit.weekdays.includes(parseISODate(day).getUTCDay());
}

export function weekdaysLabel(weekdays: number[]): string {
  const set = new Set(weekdays);
  if (set.size === 7) return "Todo dia";
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return "Seg a sex";
  if (set.size === 2 && set.has(0) && set.has(6)) return "Fim de semana";
  return WEEK_ORDER.filter((d) => set.has(d))
    .map((d) => WEEKDAY_SHORT[d])
    .join(", ");
}
