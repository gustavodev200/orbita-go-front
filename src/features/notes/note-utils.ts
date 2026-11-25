import type { Note, NoteColor, NoteItem } from "@/lib/api/schemas";

/** Cor de destaque de cada chave da paleta; o fundo do card mistura com --sf (funciona no claro e no escuro). */
export const NOTE_COLOR_HEX: Record<NoteColor, string | null> = {
  default: null,
  red: "#ef4444",
  orange: "#ff8a1e",
  yellow: "#f5b400",
  green: "#16a34a",
  teal: "#14b8a6",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4e9c",
  gray: "#8b8b94",
};

export const NOTE_COLOR_LABEL: Record<NoteColor, string> = {
  default: "Padrão",
  red: "Vermelho",
  orange: "Laranja",
  yellow: "Amarelo",
  green: "Verde",
  teal: "Azul-esverdeado",
  blue: "Azul",
  purple: "Roxo",
  pink: "Rosa",
  gray: "Cinza",
};

export function noteBackground(color: NoteColor): string {
  const hex = NOTE_COLOR_HEX[color];
  return hex ? `color-mix(in srgb, ${hex} 18%, var(--sf))` : "var(--sf)";
}

export function newItem(text = ""): NoteItem {
  return { id: crypto.randomUUID(), text, done: false };
}

/** Texto → checklist (uma linha por item) e volta, como no Keep. */
export function bodyToItems(body: string): NoteItem[] {
  return body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((t) => newItem(t));
}

export function itemsToBody(items: NoteItem[]): string {
  return items
    .map((i) => i.text.trim())
    .filter(Boolean)
    .join("\n");
}

export function isEmptyNote(n: Pick<Note, "title" | "body" | "items">): boolean {
  return !n.title.trim() && !n.body.trim() && !n.items.some((i) => i.text.trim());
}

/** Busca simples: título, texto, itens e etiquetas, sem acento/maiúscula. */
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function filterNotes(notes: Note[], query: string, label: string | null): Note[] {
  const q = fold(query.trim());
  return notes.filter((n) => {
    if (label && !n.labels.includes(label)) return false;
    if (!q) return true;
    const hay = fold([n.title, n.body, ...n.items.map((i) => i.text), ...n.labels].join(" "));
    return hay.includes(q);
  });
}

export function allLabels(notes: Note[]): string[] {
  return [...new Set(notes.flatMap((n) => n.labels))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** "Hoje 09:00", "Amanhã 18:30" ou "25/11 09:00" a partir do `reminderAt` (fuso -03:00). */
export function reminderLabel(reminderAt: string, today: string, tomorrow: string): string {
  const day = reminderAt.slice(0, 10);
  const time = reminderAt.slice(11, 16);
  if (day === today) return `Hoje ${time}`;
  if (day === tomorrow) return `Amanhã ${time}`;
  return `${day.slice(8, 10)}/${day.slice(5, 7)} ${time}`;
}

export function reminderAtFrom(day: string, time: string): string {
  return `${day}T${time}:00-03:00`;
}
