"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { createLifeEvent, deleteLifeEvent, getTimeline, timelineKeys, updateLifeEvent, type LifeEventInput } from "./api";

export function useTimeline() {
  return useQuery({ queryKey: timelineKeys.all, queryFn: getTimeline });
}

export function useSaveLifeEvent(onDone?: () => void) {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: LifeEventInput }) => (id ? updateLifeEvent(id, input) : createLifeEvent(input)),
    invalidate: [timelineKeys.all],
    message: (_e, v) => (v.id ? "Marco salvo" : "Marco adicionado"),
    onSuccess: () => onDone?.(),
  });
}

export function useDeleteLifeEvent() {
  return useApiMutation({
    mutationFn: (id: string) => deleteLifeEvent(id),
    invalidate: [timelineKeys.all],
    message: () => "Marco excluído",
  });
}
