import { z } from "zod";

import { send, get } from "@/lib/api/client";
import { objectiveSchema, type ObjectiveHorizon } from "@/lib/api/schemas";

export const objectiveKeys = { all: ["objectives"] as const };

export type ObjectiveInput = {
  title: string;
  why: string | null;
  expectedResult: string | null;
  horizon: ObjectiveHorizon;
  deadline: string | null;
  icon: string;
  color: string;
};

export const getObjectives = () => get("/objectives", z.array(objectiveSchema));
export const createObjective = (input: ObjectiveInput & { milestones?: string[] }) =>
  send("post", "/objectives", objectiveSchema, input);
export const updateObjective = (id: string, input: Partial<ObjectiveInput> & { completed?: boolean }) =>
  send("patch", `/objectives/${id}`, objectiveSchema, input);
export const deleteObjective = (id: string) => send("delete", `/objectives/${id}`, objectiveSchema);

export const addMilestone = (id: string, title: string) =>
  send("post", `/objectives/${id}/milestones`, objectiveSchema, { title });
export const updateMilestone = (id: string, milestoneId: string, input: { title?: string; done?: boolean }) =>
  send("patch", `/objectives/${id}/milestones/${milestoneId}`, objectiveSchema, input);
export const deleteMilestone = (id: string, milestoneId: string) =>
  send("delete", `/objectives/${id}/milestones/${milestoneId}`, objectiveSchema);

export const linkTask = (id: string, taskId: string, linked: boolean) =>
  send(linked ? "put" : "delete", `/objectives/${id}/tasks/${taskId}`, objectiveSchema);
export const linkHabit = (id: string, habitId: string, linked: boolean) =>
  send(linked ? "put" : "delete", `/objectives/${id}/habits/${habitId}`, objectiveSchema);
