"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Reminder, ReminderDraft } from "@/lib/api/schemas";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { createReminder, deleteReminder, getReminders, parseReminder, reminderKeys, updateReminder } from "./api";

export function useReminders() {
  return useQuery({ queryKey: reminderKeys.all, queryFn: getReminders });
}

export function useParseReminder() {
  return useApiMutation({ mutationFn: (text: string) => parseReminder(text) });
}

export function useCreateReminder(onDone?: (r: Reminder) => void) {
  return useApiMutation({
    mutationFn: (draft: ReminderDraft) => createReminder({ ...draft, enabled: true }),
    invalidate: [reminderKeys.all],
    message: () => "Lembrete criado",
    onSuccess: (r) => onDone?.(r),
  });
}

export function useDeleteReminder() {
  return useApiMutation({
    mutationFn: (id: string) => deleteReminder(id),
    invalidate: [reminderKeys.all],
    message: () => "Lembrete excluído",
  });
}

export function useToggleReminder() {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => updateReminder(id, { enabled }),
    onSuccess: (r) => qc.setQueryData<Reminder[]>(reminderKeys.all, (old) => old?.map((x) => (x.id === r.id ? r : x))),
    onError: () => qc.invalidateQueries({ queryKey: reminderKeys.all }),
  });
}
