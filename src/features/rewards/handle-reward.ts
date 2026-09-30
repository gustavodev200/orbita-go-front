import type { Reward } from "@/lib/api/schemas";
import { getQueryClient } from "@/lib/query-client";
import { useAppStore } from "@/stores/app-store";

/** Level-up abre 1,3s depois do toast (README · Motion). */
export const LEVEL_UP_DELAY = 1300;
/** Conquista abre logo depois do toast começar a sair. */
export const ACHIEVEMENT_DELAY = 900;

export const meQueryKey = ["me"] as const;

/**
 * Ponto único para toda resposta `{ data, reward }`:
 * 1. substitui o `me` (store + cache do react-query);
 * 2. mostra o toast de XP/moedas;
 * 3. agenda os modais de nível e de conquista.
 */
export function handleReward(reward: Reward | null | undefined, message?: string): void {
  if (!reward) return;
  const store = useAppStore.getState();

  store.setMe(reward.me);
  getQueryClient().setQueryData(meQueryKey, reward.me);

  if (reward.xp > 0 || reward.coins > 0) {
    store.showToast({ xp: reward.xp, coins: reward.coins, message });
  }

  if (reward.leveledUp) {
    const level = reward.me.level;
    setTimeout(() => useAppStore.getState().openModal({ kind: "nivel", level }), LEVEL_UP_DELAY);
  }

  const achievementDelay = reward.leveledUp ? LEVEL_UP_DELAY : ACHIEVEMENT_DELAY;
  for (const achievement of reward.achievements) {
    setTimeout(
      () => useAppStore.getState().openModal({ kind: "conquista", achievement }),
      achievementDelay,
    );
  }
}
