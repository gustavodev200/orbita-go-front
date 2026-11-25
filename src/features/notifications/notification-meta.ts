import { addDaysISO, todayISO } from "@/lib/dates";
import type { AppNotification, Severity } from "./api";

/** Rótulo, ícone e cores (tokens do tema) de cada nível. */
export const SEVERITY: Record<Severity, { label: string; tone: string; chip: string }> = {
  urgent: { label: "Urgente", tone: "bg-rs text-r", chip: "bg-rs text-r" },
  important: { label: "Importante", tone: "bg-os text-o", chip: "bg-os text-o" },
  info: { label: "Informativo", tone: "bg-bs text-b", chip: "bg-sf2 text-mut" },
};

const KIND_ICON: Record<string, string> = {
  task_overdue: "assignment_late",
  task_due_today: "alarm",
  tasks_today: "task_alt",
  objective_overdue: "flag",
  objective_due_soon: "flag",
  objective_stale: "hourglass_empty",
  objective_done: "emoji_events",
  goal_done: "savings",
  goal_near: "savings",
  goal_overdue: "savings",
  habit_pending: "self_improvement",
  challenge_checkin: "sports_score",
  bill_overdue: "receipt_long",
  bill_due: "receipt_long",
  bill_soon: "event_upcoming",
  flashcards_due: "translate",
  weekly_review: "insights",
  daily_digest: "wb_sunny",
};

export function kindIcon(kind: string): string {
  return KIND_ICON[kind] ?? "notifications";
}

const KIND_LINK: Record<string, string> = {
  task_overdue: "Ver tarefas",
  task_due_today: "Ver tarefa",
  tasks_today: "Ver tarefas",
  objective_overdue: "Revisar meta",
  objective_due_soon: "Ver minha meta",
  objective_stale: "Ver minha meta",
  objective_done: "Ver metas",
  goal_done: "Ver economia",
  goal_near: "Ver economia",
  goal_overdue: "Revisar economia",
  habit_pending: "Ver hábitos",
  challenge_checkin: "Ver desafio",
  bill_overdue: "Ver contas",
  bill_due: "Ver contas",
  bill_soon: "Ver contas",
  flashcards_due: "Revisar agora",
  weekly_review: "Planejar semana",
  daily_digest: "Ver alertas",
};

export function linkLabel(kind: string): string {
  return KIND_LINK[kind] ?? "Abrir";
}

/** Ação rápida que resolve o alerta sem sair da central. */
export type QuickAction = "complete-task" | "postpone-task" | "check-habit" | "check-challenge";

export function quickActions(n: Pick<AppNotification, "kind" | "entityId">): QuickAction[] {
  if (!n.entityId) return [];
  switch (n.kind) {
    case "task_overdue":
    case "task_due_today":
    case "tasks_today":
      return ["complete-task", "postpone-task"];
    case "habit_pending":
      return ["check-habit"];
    case "challenge_checkin":
      return ["check-challenge"];
    default:
      return [];
  }
}

/** Reagendar = mover o prazo para amanhã. */
export function tomorrowISO(now: Date = new Date()): string {
  return addDaysISO(todayISO(now), 1);
}

/** "Agora", "Há 10 min", "Há 2 h", "Há 3 dias". */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Há 1 dia" : `Há ${days} dias`;
}

export type NotificationGroup = { label: string; items: AppNotification[] };

/** Agrupa por dia (fuso de negócio): Hoje · Ontem · Anteriores. Mantém a ordem. */
export function groupByDay(items: AppNotification[], now: Date = new Date()): NotificationGroup[] {
  const today = todayISO(now);
  const yesterday = addDaysISO(today, -1);
  const groups: NotificationGroup[] = [
    { label: "Hoje", items: [] },
    { label: "Ontem", items: [] },
    { label: "Anteriores", items: [] },
  ];
  for (const n of items) {
    const day = todayISO(new Date(n.createdAt));
    const idx = day === today ? 0 : day === yesterday ? 1 : 2;
    groups[idx].items.push(n);
  }
  return groups.filter((g) => g.items.length > 0);
}
