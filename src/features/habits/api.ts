import { z } from "zod";

import { get, send } from "@/lib/api/client";
import { habitSchema } from "@/lib/api/schemas";

export const habitKeys = { all: ["habits"] as const };

export type HabitInput = { name: string; icon: string; color: string; weekdays: number[]; reminderTime: string | null };

export const getHabits = () => get("/habits", z.array(habitSchema));
export const createHabit = (input: HabitInput) => send("post", "/habits", habitSchema, input);
export const updateHabit = (id: string, input: Partial<HabitInput>) => send("patch", `/habits/${id}`, habitSchema, input);
export const deleteHabit = (id: string) => send("delete", `/habits/${id}`, habitSchema);
export const checkHabit = (id: string, day: string) => send("put", `/habits/${id}/checks/${day}`, habitSchema);
export const uncheckHabit = (id: string, day: string) => send("delete", `/habits/${id}/checks/${day}`, habitSchema);
