import type { Reward } from "@/lib/api/schemas";
import { getQueryClient } from "@/lib/query-client";
import { useAppStore } from "@/stores/app-store";

export const meQueryKey = ["me"] as const;

/**
 * Algumas rotas do back ainda respondem `{ data, reward }` (legado da versão
 * gamificada). A UI não mostra XP/moedas: aqui só mantemos o `me` em dia
 * (store + cache do react-query) com o estado que veio junto.
 */
export function handleReward(reward: Reward | null | undefined): void {
  if (!reward) return;
  useAppStore.getState().setMe(reward.me);
  getQueryClient().setQueryData(meQueryKey, reward.me);
}
