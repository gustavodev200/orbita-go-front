// Datas de negócio sempre em America/Sao_Paulo.
export const TZ = "America/Sao_Paulo";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** "YYYY-MM-DD" de hoje no fuso de negócio. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

/** Interpreta "YYYY-MM-DD" (ou datetime) como meio-dia UTC (sem drift de fuso). */
export function parseISODate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "2026-09-29" → "29/09". */
export function formatDM(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}`;
}

export function formatDMY(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** "dd/mm/aaaa" → "aaaa-mm-dd" (ou null se inválida). */
export function parseDMY(value: string): string | null {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return Number.isNaN(parseISODate(iso).getTime()) ? null : iso;
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[parseISODate(iso).getUTCDay()];
}

export function weekdayLong(iso: string): string {
  return WEEKDAYS[parseISODate(iso).getUTCDay()];
}

export function diffDays(fromISO: string, toISO: string): number {
  return Math.round((parseISODate(toISO).getTime() - parseISODate(fromISO).getTime()) / 86_400_000);
}

/** "Hoje, 29/09", "Ontem, 28/09", "Sáb, 27/09". */
export function dayGroupLabel(iso: string, today: string = todayISO()): string {
  const diff = diffDays(iso, today);
  if (diff === 0) return `Hoje, ${formatDM(iso)}`;
  if (diff === 1) return `Ontem, ${formatDM(iso)}`;
  return `${weekdayShort(iso)}, ${formatDM(iso)}`;
}

/** "amanhã", "em 3 dias", "hoje", "há 2 dias". */
export function relativeDays(iso: string, today: string = todayISO()): string {
  const diff = diffDays(today, iso);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  if (diff === -1) return "ontem";
  if (diff > 1) return `em ${diff} dias`;
  return `há ${-diff} dias`;
}

export function currentMonth(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}

export function monthName(month: string): string {
  return MONTHS[Number(month.slice(5, 7)) - 1];
}

export function monthLabel(month: string): string {
  return `${monthName(month)} ${month.slice(0, 4)}`;
}

/** "2027-07" → "07/2027" (prazo de meta). */
export function monthYearShort(month: string): string {
  return `${month.slice(5, 7)}/${month.slice(0, 4)}`;
}

/** Prazo de meta: "YYYY-MM-DD" passa direto; "YYYY-MM" (formato antigo) vira dia 01. */
export function deadlineToISODay(deadline: string): string {
  return deadline.length === 7 ? `${deadline}-01` : deadline.slice(0, 10);
}

/** Prazo de meta pra exibição: "04/11/2026". */
export function formatDeadline(deadline: string): string {
  return formatDMY(deadlineToISODay(deadline));
}

/** Meses inteiros entre duas datas ISO, arredondado pra cima, mínimo 1 (pra não dividir por 0). */
export function monthsUntil(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.slice(0, 10).split("-").map(Number);
  const [ty, tm, td] = toISO.slice(0, 10).split("-").map(Number);
  let months = (ty - fy) * 12 + (tm - fm);
  if (td < fd) months -= 1;
  return Math.max(1, months);
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function hm(now: Date): [number, number] {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  return [
    Number(parts.find((p) => p.type === "hour")?.value ?? 0),
    Number(parts.find((p) => p.type === "minute")?.value ?? 0),
  ];
}

export function greeting(now: Date = new Date()): string {
  const [h] = hm(now);
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/** "9h 12min" — tempo até a meia-noite em SP. */
export function untilMidnightLabel(now: Date = new Date()): string {
  const [h, m] = hm(now);
  const left = 24 * 60 - (h * 60 + m);
  return `${Math.floor(left / 60)}h ${left % 60}min`;
}

/** % do mês já andado (1–100). */
export function monthProgressPct(month: string, today: string = todayISO()): number {
  if (today.slice(0, 7) !== month) return today.slice(0, 7) > month ? 100 : 0;
  return Math.round((Number(today.slice(8, 10)) / daysInMonth(month)) * 100);
}
