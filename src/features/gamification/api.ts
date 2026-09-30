import { z } from "zod";

import { get, send, sendRewarded } from "@/lib/api/client";
import { bossSchema, meSchema, missionSchema, streakSchema } from "@/lib/api/schemas";

export const gamificationKeys = {
  all: ["gamification"] as const,
  missions: ["gamification", "missions"] as const,
  streak: ["gamification", "streak"] as const,
  boss: ["gamification", "boss"] as const,
};

export const getMissions = () => get("/missions/today", z.array(missionSchema));
export const claimMission = (key: string) => sendRewarded("post", `/missions/${key}/claim`, missionSchema);
export const getStreak = () => get("/streak", streakSchema);
export const closeDay = () => sendRewarded("post", "/streak/close-day", streakSchema);
export const postShield = () => send("post", "/streak/shield", meSchema);
/** `null` quando não há recorrente de saída no mês. */
export const getBoss = () => get("/boss", bossSchema.nullable());
export const attackBoss = (amountCents = 30000) => sendRewarded("post", "/boss/attack", bossSchema, { amountCents });
