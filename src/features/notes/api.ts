import { z } from "zod";

import { get, send } from "@/lib/api/client";
import { noteSchema, type NoteColor, type NoteItem } from "@/lib/api/schemas";
import { reminderKeys } from "@/features/reminders/api";

export const noteKeys = {
  all: ["notes"] as const,
};

/** Lembrete de nota mexe na lista de lembretes (espelho gerado pelo back). */
export const NOTE_INVALIDATE = [noteKeys.all, reminderKeys.all];

export type NoteInput = {
  title?: string;
  body?: string;
  color?: NoteColor;
  labels?: string[];
  checklist?: boolean;
  items?: NoteItem[];
  pinned?: boolean;
  reminderAt?: string | null;
};

export const getNotes = () => get("/notes", z.array(noteSchema));
export const createNote = (input: NoteInput) => send("post", "/notes", noteSchema, input);
export const updateNote = (id: string, input: NoteInput) => send("patch", `/notes/${id}`, noteSchema, input);
export const deleteNote = (id: string) => send("delete", `/notes/${id}`, noteSchema);
