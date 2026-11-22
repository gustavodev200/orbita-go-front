import { z } from "zod";

import { get, send } from "@/lib/api/client";
import { chunk } from "@/lib/chunk";
import { reminderDraftSchema, reminderSchema, type ReminderDraft } from "@/lib/api/schemas";

export const reminderKeys = { all: ["reminders"] as const };

export const getReminders = () => get("/reminders", z.array(reminderSchema));
export const parseReminder = (text: string) => send("post", "/reminders/parse", reminderDraftSchema, { text });
export const createReminder = (input: ReminderDraft & { enabled?: boolean }) =>
  send("post", "/reminders", reminderSchema, input);
export const updateReminder = (id: string, input: Partial<ReminderDraft> & { enabled?: boolean }) =>
  send("patch", `/reminders/${id}`, reminderSchema, input);
export const deleteReminder = (id: string) => send("delete", `/reminders/${id}`, z.unknown());
/** Exclusão em lote; a rota aceita até 200 ids por chamada, então envia em lotes. */
export async function bulkDeleteReminders(ids: string[]) {
  let deleted = 0;
  for (const part of chunk(ids, 200)) {
    deleted += (await send("post", "/reminders/bulk-delete", z.object({ deleted: z.number() }), { ids: part })).deleted;
  }
  return { deleted };
}
