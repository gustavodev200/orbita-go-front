import type { Priority, Task, TaskStatus } from "@/lib/api/schemas";
import { addDaysISO, diffDays, formatDM } from "@/lib/dates";

/** Lógica pura do quadro Kanban (sem React) — testada em tests/unit/task-board.test.ts. */

export type BoardColumn = {
  status: TaskStatus;
  label: string;
  icon: string;
  /** Cor de identidade da coluna: só marca (ponto/faixa), nunca pinta texto. */
  color: string;
  empty: string;
};

export const BOARD_COLUMNS: BoardColumn[] = [
  { status: "backlog", label: "Para depois", icon: "inventory_2", color: "var(--mut)", empty: "Ideias e coisas sem pressa ficam aqui." },
  { status: "todo", label: "A fazer", icon: "radio_button_unchecked", color: "var(--b)", empty: "Nada na fila. Puxe algo de “Para depois”." },
  { status: "doing", label: "Fazendo", icon: "pending", color: "var(--g)", empty: "Mova para cá o que você está fazendo agora." },
  { status: "done", label: "Feito", icon: "check_circle", color: "var(--ok)", empty: "As tarefas concluídas aparecem aqui." },
];

export const STATUS_LABEL = Object.fromEntries(BOARD_COLUMNS.map((c) => [c.status, c.label])) as Record<TaskStatus, string>;

export function columnOf(status: TaskStatus): BoardColumn {
  return BOARD_COLUMNS.find((c) => c.status === status) ?? BOARD_COLUMNS[1];
}

export type DueFilter = "all" | "overdue" | "today" | "week" | "none";
export type BoardFilters = { query: string; priority: Priority | "all"; due: DueFilter };
export const NO_FILTERS: BoardFilters = { query: "", priority: "all", due: "all" };

export function isFiltering(f: BoardFilters): boolean {
  return f.query.trim() !== "" || f.priority !== "all" || f.due !== "all";
}

/** Minúsculas e sem acento: "reunião" acha "reuniao". */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

export function matchesFilters(task: Task, f: BoardFilters, today: string): boolean {
  if (f.query.trim() && !normalize(task.title).includes(normalize(f.query))) return false;
  if (f.priority !== "all" && task.priority !== f.priority) return false;
  const due = task.dueDate?.slice(0, 10) ?? null;
  switch (f.due) {
    case "overdue":
      return !!due && due < today && !task.done;
    case "today":
      return due === today;
    case "week":
      return !!due && due >= today && due <= addDaysISO(today, 6);
    case "none":
      return !due;
    default:
      return true;
  }
}

/** Cards de cada coluna, na ordem do quadro (`position`, desempate pelo título). */
export function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const out: Record<TaskStatus, Task[]> = { backlog: [], todo: [], doing: [], done: [] };
  for (const t of tasks) out[t.status].push(t);
  for (const list of Object.values(out)) list.sort((a, b) => a.position - b.position || a.title.localeCompare(b.title));
  return out;
}

/** Posição fracionária entre dois vizinhos (qualquer um pode faltar). */
export function positionBetween(prev?: number, next?: number): number {
  if (prev === undefined && next === undefined) return 1;
  if (prev === undefined) return (next as number) - 1;
  if (next === undefined) return prev + 1;
  return (prev + next) / 2;
}

/**
 * Posição para soltar `draggedId` no índice `index` da coluna `column`
 * (índice contado na coluna SEM o card arrastado).
 */
export function dropPosition(column: Task[], draggedId: string, index: number): number {
  const rest = column.filter((t) => t.id !== draggedId);
  const i = Math.max(0, Math.min(index, rest.length));
  return positionBetween(rest[i - 1]?.position, rest[i]?.position);
}

export type DueInfo = { label: string; tone: "late" | "today" | "soon" | "normal" };

/** Selo de prazo do card: "Atrasada · 12/11", "Hoje", "Amanhã", "28/11". */
export function dueInfo(task: Task, today: string): DueInfo | null {
  const due = task.dueDate?.slice(0, 10);
  if (!due) return null;
  const diff = diffDays(today, due);
  if (task.done) return { label: formatDM(due), tone: "normal" };
  if (diff < 0) return { label: `Atrasada · ${formatDM(due)}`, tone: "late" };
  if (diff === 0) return { label: "Hoje", tone: "today" };
  if (diff === 1) return { label: "Amanhã", tone: "soon" };
  return { label: formatDM(due), tone: "normal" };
}

