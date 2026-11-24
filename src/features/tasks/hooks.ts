"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Task, TaskStatus } from "@/lib/api/schemas";
import { reminderKeys } from "@/features/reminders/api";
import { useApiMutation, useRewardedMutation } from "@/features/rewards/use-api-mutation";
import { bulkDeleteTasks, completeTask, createTask, deleteTask, getTasks, moveTask, taskKeys, uncompleteTask, updateTask, type TaskInput } from "./api";

export function useTasks() {
  return useQuery({ queryKey: taskKeys.all, queryFn: getTasks });
}

/** O back sincroniza `Task.reminderAt` com um Reminder — invalida os dois. */
const TASK_INVALIDATE = [taskKeys.all, reminderKeys.all];

export function useCreateTask(onDone?: () => void) {
  return useApiMutation({
    mutationFn: (input: TaskInput) => createTask(input),
    invalidate: TASK_INVALIDATE,
    message: () => "Tarefa criada",
    onSuccess: () => onDone?.(),
  });
}

export function useUpdateTask(onDone?: () => void) {
  return useApiMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaskInput> }) => updateTask(id, input),
    invalidate: TASK_INVALIDATE,
    onSuccess: () => onDone?.(),
  });
}

export function useDeleteTask() {
  return useApiMutation({ mutationFn: (id: string) => deleteTask(id), invalidate: TASK_INVALIDATE, message: () => "Tarefa excluída" });
}

export function useBulkDeleteTasks(onDone?: () => void) {
  return useApiMutation({
    mutationFn: (ids: string[]) => bulkDeleteTasks(ids),
    invalidate: TASK_INVALIDATE,
    message: ({ deleted }) => (deleted === 1 ? "1 tarefa excluída" : `${deleted} tarefas excluídas`),
    onSuccess: () => onDone?.(),
  });
}

/** Marca/desmarca com update otimista (o check anima na hora). */
export function useToggleTask() {
  const qc = useQueryClient();
  const setDone = (id: string, done: boolean) =>
    qc.setQueryData<Task[]>(taskKeys.all, (old) => old?.map((t) => (t.id === id ? { ...t, done } : t)));

  const complete = useRewardedMutation({
    mutationFn: (task: Task) => completeTask(task.id),
    invalidate: [taskKeys.all],
    onError: (_e, task) => setDone(task.id, false),
  });
  const uncomplete = useApiMutation({
    mutationFn: (task: Task) => uncompleteTask(task.id),
    invalidate: [taskKeys.all],
    onError: (_e, task) => setDone(task.id, true),
  });

  return (task: Task) => {
    setDone(task.id, !task.done);
    if (task.done) uncomplete.mutate(task);
    else complete.mutate(task);
  };
}

export type MoveVars = { task: Task; status: TaskStatus; position?: number };

/**
 * Move card no quadro com update otimista (o card já aparece na coluna nova);
 * em erro volta ao lugar. Ir para "done" passa pelo fluxo de recompensa.
 */
export function useMoveTask() {
  const qc = useQueryClient();
  const patch = (id: string, fields: Partial<Task>) =>
    qc.setQueryData<Task[]>(taskKeys.all, (old) => old?.map((t) => (t.id === id ? { ...t, ...fields } : t)));

  const mutation = useRewardedMutation({
    mutationFn: ({ task, status, position }: MoveVars) => moveTask(task.id, { status, position }),
    invalidate: [taskKeys.all],
    onError: (_e, { task }) => patch(task.id, task),
  });

  return (vars: MoveVars) => {
    if (vars.status === vars.task.status && vars.position === undefined) return;
    patch(vars.task.id, {
      status: vars.status,
      done: vars.status === "done",
      ...(vars.position !== undefined && { position: vars.position }),
    });
    mutation.mutate(vars);
  };
}
