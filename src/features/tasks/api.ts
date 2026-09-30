import { z } from "zod";

import { get, send, sendRewarded } from "@/lib/api/client";
import { taskSchema, type Priority } from "@/lib/api/schemas";

export const taskKeys = { all: ["tasks"] as const };

export const getTasks = () => get("/tasks", z.array(taskSchema));

export type TaskInput = { title: string; dueDate?: string | null; priority: Priority; reminderAt?: string | null };
export const createTask = (input: TaskInput) => send("post", "/tasks", taskSchema, input);
export const updateTask = (id: string, input: Partial<TaskInput>) => send("patch", `/tasks/${id}`, taskSchema, input);
export const deleteTask = (id: string) => send("delete", `/tasks/${id}`, z.unknown());
export const completeTask = (id: string) => sendRewarded("post", `/tasks/${id}/complete`, taskSchema);
export const uncompleteTask = (id: string) => send("post", `/tasks/${id}/uncomplete`, taskSchema);
