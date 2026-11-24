"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Challenge } from "@/lib/api/schemas";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import {
  challengeKeys,
  checkChallenge,
  createChallenge,
  deleteChallenge,
  getChallenges,
  uncheckChallenge,
  updateChallenge,
  type ChallengeInput,
} from "./api";

export function useChallenges() {
  return useQuery({ queryKey: challengeKeys.all, queryFn: getChallenges });
}

export function useCreateChallenge(onDone?: () => void) {
  return useApiMutation({
    mutationFn: (input: ChallengeInput) => createChallenge(input),
    invalidate: [challengeKeys.all],
    message: (c) => `Desafio de ${c.durationDays} dias criado`,
    onSuccess: () => onDone?.(),
  });
}

export function useAbandonChallenge() {
  return useApiMutation({
    mutationFn: ({ id, abandoned }: { id: string; abandoned: boolean }) => updateChallenge(id, { abandoned }),
    invalidate: [challengeKeys.all],
    message: (c) => (c.abandonedAt ? "Desafio encerrado" : "Desafio retomado"),
  });
}

export function useDeleteChallenge() {
  return useApiMutation({
    mutationFn: (id: string) => deleteChallenge(id),
    invalidate: [challengeKeys.all, ["timeline"]],
    message: () => "Desafio excluído",
  });
}

/** Marca/desmarca um dia (otimista). Avisa quando o último dia fecha o desafio. */
export function useToggleChallengeDay() {
  const qc = useQueryClient();
  const set = (c: Challenge) => qc.setQueryData<Challenge[]>(challengeKeys.all, (old) => old?.map((x) => (x.id === c.id ? c : x)));
  const mutation = useApiMutation({
    mutationFn: ({ c, day, on }: { c: Challenge; day: string; on: boolean }) =>
      on ? checkChallenge(c.id, day) : uncheckChallenge(c.id, day),
    onSuccess: (c, v) => {
      set(c);
      if (c.status === "completed" && v.c.status !== "completed") {
        toast.success(`Desafio concluído: ${c.durationDays} de ${c.durationDays} dias`);
        void qc.invalidateQueries({ queryKey: ["timeline"] });
      }
    },
    onError: (_e, v) => set(v.c),
  });
  return (c: Challenge, day: string) => {
    const on = !c.checks.includes(day);
    const checks = on ? [...c.checks, day].sort() : c.checks.filter((d) => d !== day);
    set({ ...c, checks, doneDays: checks.length });
    mutation.mutate({ c, day, on });
  };
}
