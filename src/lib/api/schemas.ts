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
  /** Horário (HH:mm) do resumo diário da central de notificações. */
  notificationDigestTime: z.string().default("08:00"),
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
  daily: z
    .array(
      z.object({
        day: z.number(),
        incomeCents: z.number(),
        expenseCents: z.number(),
      }),
    )
    .default([]),
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

/** Coluna do quadro Kanban (`done` ⇔ status "done", o back mantém em sincronia). */
export const taskStatusSchema = z.enum(["backlog", "todo", "doing", "done"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueDate: z.string().nullish(),
  priority: prioritySchema,
  reminderAt: z.string().nullish(),
  done: z.boolean(),
  doneAt: z.string().nullish(),
  status: taskStatusSchema.default("todo"),
  position: z.number().default(0),
  objectiveId: z.string().nullish(),
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
  /** "note" só aparece em espelhos de `Note.reminderAt` (gerados pelo back). */
  kind: z.enum(["finance", "task", "note"]),
  enabled: z.boolean(),
  /** Presente quando o lembrete é o espelho de `Task.reminderAt` (gerado pelo back). */
  taskId: z.string().nullish(),
  /** Presente quando o lembrete é o espelho de `Note.reminderAt` (gerado pelo back). */
  noteId: z.string().nullish(),
});
export type Reminder = z.infer<typeof reminderSchema>;

export const NOTE_COLORS = ["default", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "gray"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export const noteItemSchema = z.object({ id: z.string(), text: z.string(), done: z.boolean() });
export type NoteItem = z.infer<typeof noteItemSchema>;

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  color: z.enum(NOTE_COLORS).catch("default"),
  labels: z.array(z.string()).default([]),
  checklist: z.boolean(),
  items: z.array(noteItemSchema).default([]),
  pinned: z.boolean(),
  reminderAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Note = z.infer<typeof noteSchema>;

const monthStatSchema = z.object({
  month: z.string(),
  byCategory: z.array(z.object({ key: z.string(), cents: z.number() })).default([]),
  totalCents: z.number(),
});
export const compareSchema = z.object({
  previous: monthStatSchema,
  current: monthStatSchema,
});
export type Compare = z.infer<typeof compareSchema>;

export const habitSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  /** 0 = domingo … 6 = sábado. */
  weekdays: z.array(z.number()),
  reminderTime: z.string().nullable().default(null),
  /** Dias marcados (YYYY-MM-DD) dos últimos 91 dias (13 semanas). */
  checks: z.array(z.string()).default([]),
  /** Dias agendados seguidos marcados até hoje. */
  streak: z.number().default(0),
  /** Maior sequência já feita (janela de ~1 ano). */
  bestStreak: z.number().default(0),
  /** Dia (YYYY-MM-DD) de criação — dias anteriores não contam na consistência. */
  createdAt: z.string().nullable().default(null),
  /** Meta (objective) que o hábito sustenta. */
  objectiveId: z.string().nullable().default(null),
});
export type Habit = z.infer<typeof habitSchema>;

/** Card de vocabulário: `pt` = termo que a pessoa não sabia, `en` = tradução no contexto. */
export const flashcardSchema = z.object({
  id: z.string(),
  pt: z.string(),
  en: z.string(),
  example: z.string().nullable().default(null),
  note: z.string().nullable().default(null),
  correctCount: z.number().default(0),
  wrongCount: z.number().default(0),
  lastReviewedAt: z.string().nullable().default(null),
  /** Repetição espaçada: em que fase o card está e quando volta (null = novo). */
  state: z.enum(["new", "learning", "review", "relearning"]).catch("new"),
  intervalDays: z.number().default(0),
  dueAt: z.string().nullable().default(null),
  /** Em quantos minutos o card volta para cada botão (Esqueci / Difícil / Lembrei / Fácil). */
  nextIntervalMinutes: z.object({ again: z.number(), hard: z.number(), good: z.number(), easy: z.number() }).nullable().default(null),
  /** Legado: o mesmo intervalo em dias (usado se a API ainda não mandar minutos). */
  nextIntervalDays: z.object({ again: z.number(), hard: z.number(), good: z.number(), easy: z.number() }).default({ again: 1, hard: 2, good: 3, easy: 4 }),
  createdAt: z.string(),
});
export type Flashcard = z.infer<typeof flashcardSchema>;
export type FlashcardRating = keyof Flashcard["nextIntervalDays"];

export const createFlashcardsResultSchema = z.object({
  created: z.array(flashcardSchema),
  skipped: z.array(z.object({ pt: z.string(), en: z.string() })),
});

/** Token pessoal (só o prefixo volta na lista; o valor completo só na criação). */
export const apiTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  lastUsedAt: z.string().nullable().default(null),
  createdAt: z.string(),
});
export type ApiToken = z.infer<typeof apiTokenSchema>;

export const createdApiTokenSchema = apiTokenSchema.extend({
  token: z.string(),
});
export type CreatedApiToken = z.infer<typeof createdApiTokenSchema>;

export const monthTotalsSchema = z.object({
  month: z.string(),
  incomeCents: z.number(),
  expenseCents: z.number(),
});
export type MonthTotals = z.infer<typeof monthTotalsSchema>;

export const objectiveHorizonSchema = z.enum(["short", "medium", "long"]);
export type ObjectiveHorizon = z.infer<typeof objectiveHorizonSchema>;

/** Meta geral (Goals & OKRs). Diferente de `Goal`, que é meta de economia. */
export const objectiveSchema = z.object({
  id: z.string(),
  title: z.string(),
  why: z.string().nullable().default(null),
  expectedResult: z.string().nullable().default(null),
  horizon: objectiveHorizonSchema,
  /** "YYYY-MM-DD", opcional. */
  deadline: z.string().nullable().default(null),
  icon: z.string(),
  color: z.string(),
  completed: z.boolean(),
  completedAt: z.string().nullable().default(null),
  createdAt: z.string(),
  /** 0–100: etapas + tarefas vinculadas feitas. */
  progress: z.number(),
  milestones: z.array(z.object({ id: z.string(), title: z.string(), done: z.boolean() })).default([]),
  tasks: z
    .array(z.object({ id: z.string(), title: z.string(), done: z.boolean(), dueDate: z.string().nullable().default(null) }))
    .default([]),
  habits: z.array(z.object({ id: z.string(), name: z.string(), icon: z.string(), color: z.string() })).default([]),
});
export type Objective = z.infer<typeof objectiveSchema>;

export const challengeStatusSchema = z.enum(["upcoming", "active", "completed", "ended", "abandoned"]);
export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;

export const challengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  why: z.string().nullable().default(null),
  icon: z.string(),
  color: z.string(),
  durationDays: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  checks: z.array(z.string()).default([]),
  doneDays: z.number(),
  missedDays: z.number(),
  status: challengeStatusSchema,
  completedAt: z.string().nullable().default(null),
  abandonedAt: z.string().nullable().default(null),
});
export type Challenge = z.infer<typeof challengeSchema>;

export const lifeEventKindSchema = z.enum(["achievement", "project", "milestone"]);
export type LifeEventKind = z.infer<typeof lifeEventKindSchema>;

export const timelineEventSchema = z.object({
  id: z.string(),
  manual: z.boolean(),
  kind: z.enum(["achievement", "project", "milestone", "objective", "savings", "challenge"]),
  title: z.string(),
  description: z.string().nullable().default(null),
  date: z.string(),
  icon: z.string(),
});
export type TimelineEvent = z.infer<typeof timelineEventSchema>;

export const yearStatsSchema = z.object({
  year: z.number(),
  tasksDone: z.number(),
  habitChecks: z.number(),
  objectivesDone: z.number(),
  savingsGoalsDone: z.number(),
  challengesDone: z.number(),
  lifeEvents: z.number(),
  incomeCents: z.number(),
  expenseCents: z.number(),
});
export type YearStats = z.infer<typeof yearStatsSchema>;

export const timelineSchema = z.object({
  events: z.array(timelineEventSchema),
  years: z.array(yearStatsSchema),
});
export type Timeline = z.infer<typeof timelineSchema>;
