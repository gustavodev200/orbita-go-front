import type { Recurring, Reminder, Task } from "@/lib/api/schemas";
import { addDaysISO } from "@/lib/dates";
import { occursOn } from "@/features/reminders/recurrence";

export type AgendaKind = "reminder" | "task" | "bill";

export type AgendaItem = {
  /** Único por ocorrência (o mesmo lembrete aparece em vários dias). */
  key: string;
  kind: AgendaKind;
  date: string;
  time: string | null;
  title: string;
  done: boolean;
  reminder?: Reminder;
  task?: Task;
  recurring?: Recurring;
};

export const AGENDA_COLOR: Record<AgendaKind, string> = {
  reminder: "var(--g)",
  task: "var(--b)",
  bill: "var(--p)",
};

export const AGENDA_LABEL: Record<AgendaKind, string> = {
  reminder: "Lembrete",
  task: "Tarefa",
  bill: "Conta",
};

function taskTime(t: Task): string | null {
  return t.reminderAt && t.reminderAt.length >= 16 ? t.reminderAt.slice(11, 16) : null;
}

/**
 * Tudo que acontece em [start, end) — lembretes ativos (expandidos pela
 * repetição), tarefas com data e contas fixas com vencimento. Lembretes
 * criados a partir de tarefa (o back sincroniza `Task.reminderAt` e marca
 * `taskId`) já aparecem como a própria tarefa: pulamos o espelho.
 */
export function buildAgenda(
  { reminders = [], tasks = [], recurrings = [] }: { reminders?: Reminder[]; tasks?: Task[]; recurrings?: Recurring[] },
  start: string,
  end: string,
): AgendaItem[] {
  const items: AgendaItem[] = [];

  for (const r of reminders) {
    if (!r.enabled) continue;
    if (r.taskId) continue;
    for (let d = start; d < end; d = addDaysISO(d, 1)) {
      if (!occursOn(r, d)) continue;
      items.push({ key: `r-${r.id}-${d}`, kind: "reminder", date: d, time: r.time, title: r.title, done: false, reminder: r });
    }
  }

  for (const t of tasks) {
    const d = t.dueDate?.slice(0, 10);
    if (!d || d < start || d >= end) continue;
    items.push({ key: `t-${t.id}`, kind: "task", date: d, time: taskTime(t), title: t.title, done: t.done, task: t });
  }

  const seenBills = new Set<string>();
  for (const r of recurrings) {
    const d = r.dueDate?.slice(0, 10);
    if (!d || d < start || d >= end) continue;
    const key = `b-${r.id}-${d}`;
    if (seenBills.has(key)) continue;
    seenBills.add(key);
    items.push({ key, kind: "bill", date: d, time: null, title: r.description, done: r.status === "paid", recurring: r });
  }

  return items.sort((a, b) => (a.date + (a.time ?? "99:99")).localeCompare(b.date + (b.time ?? "99:99")));
}

/** Itens de um único dia. */
export function agendaForDay(sources: Parameters<typeof buildAgenda>[0], day: string): AgendaItem[] {
  return buildAgenda(sources, day, addDaysISO(day, 1));
}
