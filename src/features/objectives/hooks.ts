"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Objective } from "@/lib/api/schemas";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { habitKeys } from "@/features/habits/api";
import { taskKeys } from "@/features/tasks/api";
import {
  addMilestone,
  createObjective,
  deleteMilestone,
  deleteObjective,
  getObjectives,
  linkHabit,
  linkTask,
  objectiveKeys,
  updateMilestone,
  updateObjective,
  type ObjectiveInput,
} from "./api";

export function useObjectives() {
  return useQuery({ queryKey: objectiveKeys.all, queryFn: getObjectives });
}

/** Troca a meta atualizada no cache (as rotas de etapa/vínculo devolvem a meta inteira). */
function useReplaceObjective() {
  const qc = useQueryClient();
  return (o: Objective) => qc.setQueryData<Objective[]>(objectiveKeys.all, (old) => old?.map((x) => (x.id === o.id ? o : x)));
}

export function useSaveObjective(onDone?: (o: Objective) => void) {
  return useApiMutation({
    mutationFn: ({ id, input, milestones }: { id?: string; input: ObjectiveInput; milestones?: string[] }) =>
      id ? updateObjective(id, input) : createObjective({ ...input, milestones }),
    invalidate: [objectiveKeys.all],
    message: (_o, v) => (v.id ? "Meta salva" : "Meta criada"),
    onSuccess: (o) => onDone?.(o),
  });
}

export function useCompleteObjective() {
  const replace = useReplaceObjective();
  return useApiMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => updateObjective(id, { completed }),
    invalidate: [["timeline"]],
    message: (o) => (o.completed ? "Meta concluída" : "Meta reaberta"),
    onSuccess: replace,
  });
}

export function useDeleteObjective() {
  return useApiMutation({
    mutationFn: (id: string) => deleteObjective(id),
    invalidate: [objectiveKeys.all, taskKeys.all, habitKeys.all],
    message: () => "Meta excluída",
  });
}

export function useMilestoneActions() {
  const replace = useReplaceObjective();
  const add = useApiMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => addMilestone(id, title),
    onSuccess: replace,
  });
  const toggle = useApiMutation({
    mutationFn: ({ id, milestoneId, done }: { id: string; milestoneId: string; done: boolean }) =>
      updateMilestone(id, milestoneId, { done }),
    onSuccess: replace,
  });
  const remove = useApiMutation({
    mutationFn: ({ id, milestoneId }: { id: string; milestoneId: string }) => deleteMilestone(id, milestoneId),
    onSuccess: replace,
  });
  return { add, toggle, remove };
}

export function useLinkActions() {
  const replace = useReplaceObjective();
  const task = useApiMutation({
    mutationFn: ({ id, taskId, linked }: { id: string; taskId: string; linked: boolean }) => linkTask(id, taskId, linked),
    invalidate: [taskKeys.all],
    onSuccess: replace,
  });
  const habit = useApiMutation({
    mutationFn: ({ id, habitId, linked }: { id: string; habitId: string; linked: boolean }) => linkHabit(id, habitId, linked),
    invalidate: [habitKeys.all],
    onSuccess: replace,
  });
  return { task, habit };
}
