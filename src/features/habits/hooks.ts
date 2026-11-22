"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Habit } from "@/lib/api/schemas";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { checkHabit, createHabit, deleteHabit, getHabits, habitKeys, uncheckHabit, updateHabit, type HabitInput } from "./api";

export function useHabits() {
  return useQuery({ queryKey: habitKeys.all, queryFn: getHabits });
}

/** Cria (sem `id`) ou edita (com `id`) um hábito. */
export function useSaveHabit(onDone?: (h: Habit) => void) {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: HabitInput }) => (id ? updateHabit(id, input) : createHabit(input)),
    invalidate: [habitKeys.all],
    message: (_h, v) => (v.id ? "Hábito salvo" : "Hábito criado"),
    onSuccess: (h) => onDone?.(h),
  });
}

export function useDeleteHabit() {
  return useApiMutation({
    mutationFn: (id: string) => deleteHabit(id),
    invalidate: [habitKeys.all],
    message: () => "Hábito excluído",
  });
}

/** Marca/desmarca um dia com update otimista (o check muda na hora). */
export function useToggleHabitDay() {
  const qc = useQueryClient();
  const setChecks = (id: string, day: string, on: boolean) =>
    qc.setQueryData<Habit[]>(habitKeys.all, (old) =>
      old?.map((h) =>
        h.id === id ? { ...h, checks: on ? [...new Set([...h.checks, day])] : h.checks.filter((d) => d !== day) } : h,
      ),
    );
  const mutation = useApiMutation({
    mutationFn: ({ habit, day, on }: { habit: Habit; day: string; on: boolean }) =>
      on ? checkHabit(habit.id, day) : uncheckHabit(habit.id, day),
    onSuccess: (h) => qc.setQueryData<Habit[]>(habitKeys.all, (old) => old?.map((x) => (x.id === h.id ? h : x))),
    onError: (_e, v) => setChecks(v.habit.id, v.day, !v.on),
  });
  return (habit: Habit, day: string) => {
    const on = !habit.checks.includes(day);
    setChecks(habit.id, day, on);
    mutation.mutate({ habit, day, on });
  };
}
