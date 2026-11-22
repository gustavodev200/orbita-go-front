import type { ReminderDraft } from "@/lib/api/schemas";
import { addDaysISO, daysInMonth, formatDM, parseISODate } from "@/lib/dates";

export const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const REPEAT_LABEL = { none: "Uma vez", daily: "Todo dia", weekly: "Toda semana", monthly: "Todo mês" } as const;

type Schedule = Pick<ReminderDraft, "repeat" | "dayOfMonth" | "weekday" | "date">;

export function whenLabel(r: Schedule, today: string): string {
  if (r.repeat === "monthly") return r.dayOfMonth ? `Todo dia ${r.dayOfMonth}` : "Todo mês";
  if (r.repeat === "weekly") return r.weekday != null ? `Toda ${WEEKDAYS[r.weekday]}` : "Toda semana";
  if (r.repeat === "daily") return "Todo dia";
  if (!r.date) return "Hoje";
  const d = r.date.slice(0, 10);
  if (d === today) return "Hoje";
  if (d === addDaysISO(today, 1)) return `Amanhã, ${formatDM(d)}`;
  return formatDM(d);
}

/** Próxima data em que o lembrete dispara. */
export function nextFireDate(r: Schedule, today: string): string {
  if (r.repeat === "monthly" && r.dayOfMonth) {
    const [y, m, d] = today.split("-").map(Number);
    const target = r.dayOfMonth >= d ? new Date(Date.UTC(y, m - 1, r.dayOfMonth)) : new Date(Date.UTC(y, m, r.dayOfMonth));
    return target.toISOString().slice(0, 10);
  }
  if (r.repeat === "weekly" && r.weekday != null) {
    const wd = parseISODate(today).getUTCDay();
    return addDaysISO(today, (r.weekday - wd + 7) % 7);
  }
  return r.date?.slice(0, 10) ?? today;
}

/**
 * O lembrete ocorre neste dia? Mesma regra do back (`isReminderDueOn`):
 * mensal em mês curto cai no último dia; "uma vez" sem data não aparece.
 */
export function occursOn(r: Schedule, iso: string): boolean {
  switch (r.repeat) {
    case "daily":
      return true;
    case "weekly":
      return r.weekday != null && parseISODate(iso).getUTCDay() === r.weekday;
    case "monthly": {
      if (!r.dayOfMonth) return false;
      const day = Math.min(r.dayOfMonth, daysInMonth(iso.slice(0, 7)));
      return Number(iso.slice(8, 10)) === day;
    }
    default:
      return !!r.date && r.date.slice(0, 10) === iso;
  }
}

/** Dias (YYYY-MM-DD) em [start, end) em que o lembrete ocorre. */
export function occurrencesBetween(r: Schedule, start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d < end; d = addDaysISO(d, 1)) if (occursOn(r, d)) out.push(d);
  return out;
}

/** Converte a escolha "data + repetir" do formulário nos campos do contrato. */
export function scheduleFromDate(repeat: ReminderDraft["repeat"], date: string): Schedule {
  if (repeat === "weekly") return { repeat, weekday: parseISODate(date).getUTCDay(), dayOfMonth: null, date: null };
  if (repeat === "monthly") return { repeat, dayOfMonth: Number(date.slice(8, 10)), weekday: null, date: null };
  if (repeat === "daily") return { repeat, dayOfMonth: null, weekday: null, date: null };
  return { repeat, date, dayOfMonth: null, weekday: null };
}
