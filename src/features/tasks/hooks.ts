"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Task } from "@/lib/api/schemas";
import { gamificationKeys } from "@/features/gamification/api";
import { useApiMutation, useRewardedMutation } from "@/features/rewards/use-api-mutation";
import { completeTask, createTask, getTasks, taskKeys, uncompleteTask, type TaskInput } from "./api";

export function useTasks() {
  return useQuery({ queryKey: taskKeys.all, queryFn: getTasks });
}

export function useCreateTask() {
  return useApiMutation({ mutationFn: (input: TaskInput) => createTask(input), invalidate: [taskKeys.all] });
}

/** Marca/desmarca com update otimista (o check anima na hora). */
export function useToggleTask() {
  const qc = useQueryClient();
  const setDone = (id: string, done: boolean) =>
    qc.setQueryData<Task[]>(taskKeys.all, (old) => old?.map((t) => (t.id === id ? { ...t, done } : t)));

  const complete = useRewardedMutation({
    mutationFn: (task: Task) => completeTask(task.id),
    invalidate: [taskKeys.all, gamificationKeys.missions],
    message: () => "Tarefa concluída",
    onError: (_e, task) => setDone(task.id, false),
  });
  const uncomplete = useApiMutation({
    mutationFn: (task: Task) => uncompleteTask(task.id),
    invalidate: [taskKeys.all, gamificationKeys.missions],
    onError: (_e, task) => setDone(task.id, true),
  });

  return (task: Task) => {
    setDone(task.id, !task.done);
    if (task.done) uncomplete.mutate(task);
    else complete.mutate(task);
  };
}
