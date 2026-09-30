import { z } from "zod";

import { get, send } from "@/lib/api/client";
import { reminderDraftSchema, reminderSchema, type ReminderDraft } from "@/lib/api/schemas";

export const reminderKeys = { all: ["reminders"] as const };

export const getReminders = () => get("/reminders", z.array(reminderSchema));
export const parseReminder = (text: string) => send("post", "/reminders/parse", reminderDraftSchema, { text });
export const createReminder = (input: ReminderDraft & { enabled?: boolean }) =>
  send("post", "/reminders", reminderSchema, input);
export const updateReminder = (id: string, input: Partial<ReminderDraft> & { enabled?: boolean }) =>
  send("patch", `/reminders/${id}`, reminderSchema, input);
