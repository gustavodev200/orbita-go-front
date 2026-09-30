import { z } from "zod";

import { get, send, sendRewarded } from "@/lib/api/client";
import {
  budgetSchema,
  goalSchema,
  parsedTxSchema,
  recurringSchema,
  summarySchema,
  transactionSchema,
  type Frequency,
  type GoalFrequency,
  type TxType,
} from "@/lib/api/schemas";

export const financeKeys = {
  all: ["finance"] as const,
  transactions: (p: TransactionFilters) => ["finance", "transactions", p] as const,
  transactionsRoot: ["finance", "transactions"] as const,
  summary: (month: string) => ["finance", "summary", month] as const,
  recurrings: (month: string) => ["finance", "recurrings", month] as const,
  upcoming: (days: number) => ["finance", "recurrings", "upcoming", days] as const,
  recurringsRoot: ["finance", "recurrings"] as const,
  budgets: (month: string) => ["finance", "budgets", month] as const,
  goals: ["finance", "goals"] as const,
};

export type TransactionFilters = { month: string; type?: TxType; category?: string };

export const getTransactions = (f: TransactionFilters) => get("/transactions", z.array(transactionSchema), f);
export const getSummary = (month: string) => get("/transactions/summary", summarySchema, { month });
export const parseTransaction = (text: string) => send("post", "/transactions/parse", parsedTxSchema, { text });

export type TransactionInput = {
  type: TxType;
  amountCents: number;
  description: string;
  categoryKey: string;
  date: string;
  accountId: string;
  recurring?: { frequency: Frequency; dueDay: number; endDate?: string };
};
export const createTransaction = (input: TransactionInput) =>
  sendRewarded("post", "/transactions", transactionSchema, input);
export const updateTransaction = (id: string, input: Partial<TransactionInput>) =>
  send("patch", `/transactions/${id}`, transactionSchema, input);
export const deleteTransaction = (id: string) => send("delete", `/transactions/${id}`, z.unknown());

export const getRecurrings = (month: string) => get("/recurrings", z.array(recurringSchema), { month });
export const getUpcomingRecurrings = (days = 7) => get("/recurrings/upcoming", z.array(recurringSchema), { days });
export const payRecurring = (id: string, month?: string) =>
  sendRewarded("post", `/recurrings/${id}/pay`, recurringSchema, undefined, month ? { month } : undefined);

export const getBudgets = (month: string) => get("/budgets", z.array(budgetSchema), { month });
export const putBudgets = (items: { categoryKey: string; limitCents: number }[]) =>
  send("put", "/budgets", z.array(budgetSchema), { items });

export const getGoals = () => get("/goals", z.array(goalSchema));
export type GoalInput = {
  name: string;
  targetCents: number;
  icon: string;
  deadline?: string | null;
  installmentCents?: number | null;
  /** Cadência dos aportes na trilha por data; só tem efeito junto com `deadline`. */
  frequency?: GoalFrequency | null;
  /** Quanto já tinha guardado antes de criar a meta no app (backfill). */
  savedCents?: number;
};
export type UpdateGoalInput = Partial<Omit<GoalInput, "savedCents">>;
export const createGoal = (input: GoalInput) => send("post", "/goals", goalSchema, input);
export const updateGoal = (id: string, input: UpdateGoalInput) => send("patch", `/goals/${id}`, goalSchema, input);
export const depositGoal = (id: string, amountCents: number) =>
  sendRewarded("post", `/goals/${id}/deposit`, goalSchema, { amountCents });
