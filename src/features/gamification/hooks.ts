"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { meKeys } from "@/features/me/api";
import { financeKeys } from "@/features/finance/api";
import { useApiMutation, useRewardedMutation } from "@/features/rewards/use-api-mutation";
import { useAppStore } from "@/stores/app-store";
import {
  attackBoss,
  claimMission,
  closeDay,
  gamificationKeys,
  getBoss,
  getMissions,
  getStreak,
  postShield,
} from "./api";

export function useMissions() {
  return useQuery({ queryKey: gamificationKeys.missions, queryFn: getMissions });
}

export function useStreak() {
  return useQuery({ queryKey: gamificationKeys.streak, queryFn: getStreak });
}

export function useBoss() {
  return useQuery({ queryKey: gamificationKeys.boss, queryFn: getBoss });
}

export function useClaimMission() {
  return useRewardedMutation({
    mutationFn: ({ key }: { key: string; title: string }) => claimMission(key),
    invalidate: [gamificationKeys.missions],
    message: (_m, v) => `Missão: ${v.title}`,
  });
}

export function useCloseDay() {
  return useRewardedMutation({
    mutationFn: () => closeDay(),
    invalidate: [gamificationKeys.streak, gamificationKeys.missions],
    message: () => "Dia fechado! Ofensiva mantida",
  });
}

export function useAttackBoss() {
  return useRewardedMutation({
    mutationFn: (amountCents: number = 30000) => attackBoss(amountCents),
    invalidate: [gamificationKeys.boss, financeKeys.goals],
    message: (boss) => (boss.defeated ? `${boss.name} derrotado!` : "Golpe no chefão!"),
  });
}

/** Usa (ou compra por 200 moedas) um escudo de ofensiva. */
export function useShieldMutation(onDone?: () => void) {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: () => postShield(),
    invalidate: [gamificationKeys.streak, meKeys.shop],
    onSuccess: (me) => {
      qc.setQueryData(meKeys.me, me);
      useAppStore.getState().setMe(me);
      onDone?.();
    },
  });
}
