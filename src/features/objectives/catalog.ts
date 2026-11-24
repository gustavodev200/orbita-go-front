import type { ObjectiveHorizon } from "@/lib/api/schemas";
import { addMonthsISO, diffDays, formatDMY, todayISO } from "@/lib/dates";

export const OBJECTIVE_ICONS = [
  "flag",
  "translate",
  "school",
  "fitness_center",
  "work",
  "savings",
  "favorite",
  "flight",
  "menu_book",
  "rocket_launch",
] as const;

export const OBJECTIVE_COLORS = ["#FF6A1F", "#3B82F6", "#16A34A", "#8B5CF6", "#EC4899", "#F59E0B"] as const;

export const HORIZONS: { value: ObjectiveHorizon; label: string; hint: string; months: number }[] = [
  { value: "short", label: "Curto prazo", hint: "até 3 meses", months: 3 },
  { value: "medium", label: "Médio prazo", hint: "3 a 12 meses", months: 6 },
  { value: "long", label: "Longo prazo", hint: "mais de 1 ano", months: 24 },
];

export const horizonLabel = (h: ObjectiveHorizon) => HORIZONS.find((x) => x.value === h)?.label ?? "";

/** Horizonte sugerido pelo prazo escolhido. */
export function horizonForDeadline(deadline: string, today = todayISO()): ObjectiveHorizon {
  if (deadline <= addMonthsISO(today, 3)) return "short";
  if (deadline <= addMonthsISO(today, 12)) return "medium";
  return "long";
}

/** "Até 30/05/2027 · faltam 187 dias" / "Prazo passou há 3 dias". */
export function deadlineLabel(deadline: string, today = todayISO()): string {
  const left = diffDays(today, deadline);
  if (left < 0) return `Prazo era ${formatDMY(deadline)} · passou há ${-left} ${-left === 1 ? "dia" : "dias"}`;
  if (left === 0) return "Prazo é hoje";
  return `Até ${formatDMY(deadline)} · ${left === 1 ? "falta 1 dia" : `faltam ${left} dias`}`;
}

/** Mesmo cálculo do back: etapas + tarefas vinculadas feitas sobre o total; concluída = 100. */
export function objectiveProgress(o: { completed: boolean; milestones: { done: boolean }[]; tasks: { done: boolean }[] }): number {
  if (o.completed) return 100;
  const items = [...o.milestones, ...o.tasks];
  if (!items.length) return 0;
  return Math.round((items.filter((i) => i.done).length / items.length) * 100);
}
