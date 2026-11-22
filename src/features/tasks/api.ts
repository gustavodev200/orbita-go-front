import { z } from "zod";

import { get, send, sendRewarded } from "@/lib/api/client";
import { chunk } from "@/lib/chunk";
import { taskSchema, type Priority } from "@/lib/api/schemas";

export const taskKeys = { all: ["tasks"] as const };

export const getTasks = () => get("/tasks", z.array(taskSchema));

export type TaskInput = { title: string; dueDate?: string | null; priority: Priority; reminderAt?: string | null };
export const createTask = (input: TaskInput) => send("post", "/tasks", taskSchema, input);
export const updateTask = (id: string, input: Partial<TaskInput>) => send("patch", `/tasks/${id}`, taskSchema, input);
export const deleteTask = (id: string) => send("delete", `/tasks/${id}`, z.unknown());
export const completeTask = (id: string) => sendRewarded("post", `/tasks/${id}/complete`, taskSchema);
export const uncompleteTask = (id: string) => send("post", `/tasks/${id}/uncomplete`, taskSchema);
/** Exclusão em lote; a rota aceita até 200 ids por chamada, então envia em lotes. */
export async function bulkDeleteTasks(ids: string[]) {
  let deleted = 0;
  for (const part of chunk(ids, 200)) {
    deleted += (await send("post", "/tasks/bulk-delete", z.object({ deleted: z.number() }), { ids: part })).deleted;
  }
  return { deleted };
}
