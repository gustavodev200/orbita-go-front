import { z } from "zod";

import { get, send } from "@/lib/api/client";
import { challengeSchema } from "@/lib/api/schemas";

export const challengeKeys = { all: ["challenges"] as const };

export type ChallengeInput = {
  title: string;
  why: string | null;
  icon: string;
  color: string;
  durationDays: 7 | 21 | 30;
  startDate: string;
};

export const getChallenges = () => get("/challenges", z.array(challengeSchema));
export const createChallenge = (input: ChallengeInput) => send("post", "/challenges", challengeSchema, input);
export const updateChallenge = (
  id: string,
  input: Partial<Pick<ChallengeInput, "title" | "why" | "icon" | "color">> & { abandoned?: boolean },
) => send("patch", `/challenges/${id}`, challengeSchema, input);
export const deleteChallenge = (id: string) => send("delete", `/challenges/${id}`, challengeSchema);
export const checkChallenge = (id: string, day: string) => send("put", `/challenges/${id}/checks/${day}`, challengeSchema);
export const uncheckChallenge = (id: string, day: string) => send("delete", `/challenges/${id}/checks/${day}`, challengeSchema);
