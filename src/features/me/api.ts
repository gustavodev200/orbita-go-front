import { z } from "zod";

import { get, send, sendRewarded } from "@/lib/api/client";
import {
  accountSchema,
  achievementSchema,
  categorySchema,
  compareSchema,
  meSchema,
  shopItemSchema,
  type Me,
  type ThemePref,
} from "@/lib/api/schemas";

export const meKeys = {
  me: ["me"] as const,
  categories: ["categories"] as const,
  accounts: ["accounts"] as const,
  achievements: ["achievements"] as const,
  shop: ["shop"] as const,
  compare: ["stats", "compare"] as const,
};

export const getMe = () => get("/me", meSchema);

export type UpdateMeInput = Partial<{
  name: string;
  theme: ThemePref;
  monthlyIncomeCents: number | null;
  enabledCategoryKeys: string[];
  notificationsEnabled: boolean;
}>;
export const updateMe = (input: UpdateMeInput) => send("patch", "/me", meSchema, input);

export type OnboardingInput = {
  name: string;
  monthlyIncomeCents?: number;
  categoryKeys: string[];
  goal?: { name: string; targetCents: number; icon: string };
};
export const completeOnboarding = (input: OnboardingInput) => sendRewarded("post", "/onboarding", meSchema, input);

export const getCategories = () => get("/categories", z.array(categorySchema));
export const getAccounts = () => get("/accounts", z.array(accountSchema));
export const getAchievements = () => get("/achievements", z.array(achievementSchema));
export const getShop = () => get("/shop", z.array(shopItemSchema));
export const buyItem = (key: string) => send("post", `/shop/${key}/buy`, meSchema);
export const getCompare = () => get("/stats/compare", compareSchema);

export type { Me };
