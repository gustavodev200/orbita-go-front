"use client";

import { useQuery } from "@tanstack/react-query";

import type { Goal } from "@/lib/api/schemas";
import { gamificationKeys } from "@/features/gamification/api";
import { useApiMutation, useRewardedMutation } from "@/features/rewards/use-api-mutation";
import { useAppStore } from "@/stores/app-store";
import {
  createGoal,
  createTransaction,
  deleteTransaction,
  depositGoal,
  financeKeys,
  getBudgets,
  getGoals,
  getRecurrings,
  getSummary,
  getTransactions,
  getUpcomingRecurrings,
  parseTransaction,
  payRecurring,
  putBudgets,
  updateGoal,
  updateTransaction,
  type GoalInput,
  type TransactionFilters,
  type TransactionInput,
  type UpdateGoalInput,
} from "./api";

export function useTransactions(filters: TransactionFilters) {
  return useQuery({ queryKey: financeKeys.transactions(filters), queryFn: () => getTransactions(filters) });
}

export function useSummary(month: string) {
  return useQuery({ queryKey: financeKeys.summary(month), queryFn: () => getSummary(month) });
}

export function useRecurrings(month: string) {
  return useQuery({ queryKey: financeKeys.recurrings(month), queryFn: () => getRecurrings(month) });
}

export function useUpcomingRecurrings(days = 7) {
  return useQuery({ queryKey: financeKeys.upcoming(days), queryFn: () => getUpcomingRecurrings(days) });
}

export function useBudgets(month: string) {
  return useQuery({ queryKey: financeKeys.budgets(month), queryFn: () => getBudgets(month) });
}

export function useGoals() {
  return useQuery({ queryKey: financeKeys.goals, queryFn: getGoals });
}

/** Tudo que um lançamento novo mexe: extrato, resumo, orçamento, missões, chefão. */
const TX_INVALIDATE = [financeKeys.all, gamificationKeys.all];

export function useParseTransaction() {
  return useApiMutation({ mutationFn: (text: string) => parseTransaction(text) });
}

export function useCreateTransaction(onDone?: () => void) {
  return useRewardedMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    invalidate: TX_INVALIDATE,
    message: (tx) => `Lançamento salvo: ${tx.description}`,
    onSuccess: () => onDone?.(),
  });
}

export function useUpdateTransaction(onDone?: () => void) {
  return useApiMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TransactionInput> }) => updateTransaction(id, input),
    invalidate: TX_INVALIDATE,
    onSuccess: () => onDone?.(),
  });
}

export function useDeleteTransaction() {
  return useApiMutation({ mutationFn: (id: string) => deleteTransaction(id), invalidate: TX_INVALIDATE });
}

export function usePayRecurring() {
  return useRewardedMutation({
    mutationFn: ({ id, month }: { id: string; month?: string; name: string }) => payRecurring(id, month),
    invalidate: TX_INVALIDATE,
    message: (_r, v) => `${v.name} paga em dia`,
  });
}

export function usePutBudgets(onDone?: () => void) {
  return useApiMutation({
    mutationFn: (items: { categoryKey: string; limitCents: number }[]) => putBudgets(items),
    invalidate: [["finance", "budgets"]],
    onSuccess: () => onDone?.(),
  });
}

export function useCreateGoal(onDone?: (g: Goal) => void) {
  return useApiMutation({
    mutationFn: (input: GoalInput) => createGoal(input),
    invalidate: [financeKeys.goals],
    onSuccess: (g) => onDone?.(g),
  });
}

export function useUpdateGoal(onDone?: (g: Goal) => void) {
  return useApiMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) => updateGoal(id, input),
    invalidate: [financeKeys.goals],
    onSuccess: (g) => onDone?.(g),
  });
}

/** Depósito na meta: +20 XP (+50 moedas por baú). Último passo → modal Meta. */
export function useDepositGoal() {
  return useRewardedMutation({
    mutationFn: ({ goal, amountCents }: { goal: Goal; amountCents: number }) => depositGoal(goal.id, amountCents),
    invalidate: [financeKeys.goals, gamificationKeys.all],
    message: (g, v) =>
      v.goal.chestsOpened.length < g.chestsOpened.length ? "Baú aberto no caminho!" : "Dinheiro guardado na meta",
    onSuccess: (g, v) => {
      if (g.completed && !v.goal.completed) {
        setTimeout(
          () =>
            useAppStore.getState().openModal({
              kind: "meta",
              goal: { name: g.name, targetCents: g.targetCents, steps: g.steps },
            }),
          700,
        );
      }
    },
  });
}
