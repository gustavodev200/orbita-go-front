import { z } from "zod";

// Tipos do contrato (API_CONTRACT.md). Zod na borda: toda resposta passa por
// aqui antes de chegar na UI. Campos nulos usam `.nullish()` para tolerar
// back que omite a chave.

export const themeSchema = z.enum(["light", "dark", "system"]);
export type ThemePref = z.infer<typeof themeSchema>;

export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  onboarded: z.boolean(),
  level: z.number(),
  xp: z.number(),
  xpToNext: z.number().default(1500),
  coins: z.number(),
  streak: z.number(),
  streakRecord: z.number(),
  shields: z.number(),
  theme: themeSchema.default("system"),
  monthlyIncomeCents: z.number().nullish(),
  ownedItems: z.array(z.string()).default([]),
  enabledCategoryKeys: z.array(z.string()).default([]),
  notificationsEnabled: z.boolean().default(true),
});
export type Me = z.infer<typeof meSchema>;

export const achievementBriefSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});
export type AchievementBrief = z.infer<typeof achievementBriefSchema>;

export const rewardSchema = z.object({
  xp: z.number(),
  coins: z.number(),
  leveledUp: z.boolean(),
  achievements: z.array(achievementBriefSchema).default([]),
  me: meSchema,
});
export type Reward = z.infer<typeof rewardSchema>;

export const txTypeSchema = z.enum(["expense", "income"]);
export type TxType = z.infer<typeof txTypeSchema>;

export const categorySchema = z.object({
  key: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  type: txTypeSchema,
});
export type Category = z.infer<typeof categorySchema>;

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullish(),
  /** Opcional (API_CONTRACT "Pedidos do front"): sem o back mandar, mapeamos pelo nome. */
  color: z.string().nullish(),
});
export type Account = z.infer<typeof accountSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  type: txTypeSchema,
  amountCents: z.number(),
  description: z.string(),
  categoryKey: z.string(),
  date: z.string(),
  accountId: z.string().nullish(),
  recurringId: z.string().nullish(),
  createdAt: z.string().nullish(),
});
export type Transaction = z.infer<typeof transactionSchema>;

export const frequencySchema = z.enum(["monthly", "weekly", "yearly"]);
export type Frequency = z.infer<typeof frequencySchema>;

export const summarySchema = z.object({
  balanceCents: z.number(),
  incomeCents: z.number(),
  expenseCents: z.number(),
  daily: z.array(z.object({ day: z.number(), incomeCents: z.number(), expenseCents: z.number() })).default([]),
});
export type Summary = z.infer<typeof summarySchema>;

export const parsedTxSchema = z.object({
  type: txTypeSchema,
  amountCents: z.number(),
  description: z.string(),
  categoryKey: z.string(),
  date: z.string(),
});
export type ParsedTx = z.infer<typeof parsedTxSchema>;

export const recurringStatusSchema = z.enum(["paid", "pending", "overdue"]);
export type RecurringStatus = z.infer<typeof recurringStatusSchema>;

export const recurringSchema = z.object({
  id: z.string(),
  description: z.string(),
  amountCents: z.number(),
  categoryKey: z.string(),
  type: txTypeSchema,
  frequency: frequencySchema,
  dueDay: z.number(),
  endDate: z.string().nullish(),
  accountId: z.string().nullish(),
  status: recurringStatusSchema.nullish(),
  dueDate: z.string().nullish(),
  paidAt: z.string().nullish(),
});
export type Recurring = z.infer<typeof recurringSchema>;

export const budgetSchema = z.object({
  categoryKey: z.string(),
  limitCents: z.number(),
  spentCents: z.number(),
});
export type Budget = z.infer<typeof budgetSchema>;

export const goalFrequencySchema = z.enum(["weekly", "biweekly", "monthly"]);
export type GoalFrequency = z.infer<typeof goalFrequencySchema>;

export const goalSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  targetCents: z.number(),
  savedCents: z.number(),
  /** Quanto guardar por vez. Nulo = gerado (target/10). */
  installmentCents: z.number().nullable().default(null),
  steps: z.number().default(10),
  currentStep: z.number(),
  chestsOpened: z.array(z.number()).default([]),
  completed: z.boolean(),
  /** "YYYY-MM", opcional. */
  deadline: z.string().nullable().default(null),
  /** Cadência dos aportes na trilha por data; só tem efeito junto com `deadline`. */
  frequency: goalFrequencySchema.nullable().default(null),
  /** Âncora (somente leitura) de onde a trilha por data começa a contar. */
  trailStartDate: z.string().nullable().default(null),
});
export type Goal = z.infer<typeof goalSchema>;

export const prioritySchema = z.enum(["high", "medium", "low"]);
export type Priority = z.infer<typeof prioritySchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueDate: z.string().nullish(),
  priority: prioritySchema,
  reminderAt: z.string().nullish(),
  done: z.boolean(),
  doneAt: z.string().nullish(),
});
export type Task = z.infer<typeof taskSchema>;

export const reminderKindSchema = z.enum(["finance", "task"]);
export const repeatSchema = z.enum(["none", "daily", "weekly", "monthly"]);
export type Repeat = z.infer<typeof repeatSchema>;

export const reminderDraftSchema = z.object({
  title: z.string(),
  kind: reminderKindSchema,
  time: z.string(),
  repeat: repeatSchema,
  dayOfMonth: z.number().nullish(),
  weekday: z.number().nullish(),
  date: z.string().nullish(),
});
export type ReminderDraft = z.infer<typeof reminderDraftSchema>;

export const reminderSchema = reminderDraftSchema.extend({
  id: z.string(),
  enabled: z.boolean(),
  /** Presente quando o lembrete é o espelho de `Task.reminderAt` (gerado pelo back). */
  taskId: z.string().nullish(),
});
export type Reminder = z.infer<typeof reminderSchema>;

const monthStatSchema = z.object({
  month: z.string(),
  byCategory: z.array(z.object({ key: z.string(), cents: z.number() })).default([]),
  totalCents: z.number(),
});
export const compareSchema = z.object({ previous: monthStatSchema, current: monthStatSchema });
export type Compare = z.infer<typeof compareSchema>;


export const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  /** 0 = domingo … 6 = sábado. */
  weekdays: z.array(z.number()),
  reminderTime: z.string().nullable().default(null),
  /** Dias marcados (YYYY-MM-DD) dos últimos 35 dias. */
  checks: z.array(z.string()).default([]),
  /** Dias agendados seguidos marcados até hoje. */
  streak: z.number().default(0),
});
export type Habit = z.infer<typeof habitSchema>;
