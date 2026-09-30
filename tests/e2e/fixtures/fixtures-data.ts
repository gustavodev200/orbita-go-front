// Dados de fixture batendo com API_CONTRACT.md — usados pelo mock de rede
// (tests/e2e/fixtures/mock-api.ts). Datas fixas em 2026-09 pra bater com
// "hoje" (mockado via clock) nos testes.

export const TODAY = "2026-09-30";
export const MONTH = "2026-09";

export const ME = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "marina@example.com",
  name: "Marina Alves",
  avatarUrl: null,
  onboarded: true,
  level: 7,
  xp: 1240,
  xpToNext: 1500,
  coins: 340,
  streak: 5,
  streakRecord: 12,
  shields: 1,
  theme: "system" as const,
  monthlyIncomeCents: 620000,
  ownedItems: [],
  enabledCategoryKeys: ["ali", "mer", "tra", "cas", "laz", "sau", "ass", "rou", "out", "sal", "fre", "inv", "pre"],
  notificationsEnabled: false,
};

export const CATEGORIES = [
  { key: "ali", name: "Alimentação", icon: "restaurant", color: "#FF8A1E", type: "expense" },
  { key: "mer", name: "Mercado", icon: "shopping_cart", color: "#20B878", type: "expense" },
  { key: "tra", name: "Transporte", icon: "directions_car", color: "#2E8BEF", type: "expense" },
  { key: "cas", name: "Casa", icon: "home", color: "#8B5CF6", type: "expense" },
  { key: "laz", name: "Lazer", icon: "sports_esports", color: "#EC4E9C", type: "expense" },
  { key: "sau", name: "Saúde", icon: "medication", color: "#EE5A4F", type: "expense" },
  { key: "ass", name: "Assinaturas", icon: "subscriptions", color: "#12B3C4", type: "expense" },
  { key: "edu", name: "Educação", icon: "school", color: "#D39500", type: "expense" },
  { key: "pet", name: "Pets", icon: "pets", color: "#B5703A", type: "expense" },
  { key: "rou", name: "Roupas", icon: "apparel", color: "#6A7BD8", type: "expense" },
  { key: "out", name: "Outros", icon: "more_horiz", color: "#9A8C7E", type: "expense" },
  { key: "sal", name: "Salário", icon: "payments", color: "#2E8BEF", type: "income" },
  { key: "fre", name: "Freela", icon: "work", color: "#20B878", type: "income" },
  { key: "inv", name: "Rendimentos", icon: "trending_up", color: "#8B5CF6", type: "income" },
  { key: "pre", name: "Presente", icon: "redeem", color: "#EC4E9C", type: "income" },
];

// "Carteira" de propósito sem `color` — cobre o fallback por nome
// (src/lib/colors.ts:accountColor) quando o back ainda não manda o campo
// (API_CONTRACT "Pedidos do front").
export const ACCOUNTS = [
  { id: "acc-nu", name: "Nubank", icon: "account_balance", color: "#8A05BE" },
  { id: "acc-itau", name: "Itaú", icon: "account_balance", color: "#EC7000" },
  { id: "acc-cart", name: "Carteira", icon: "wallet" },
];

export const TRANSACTIONS = [
  {
    id: "tx-1",
    type: "expense" as const,
    amountCents: 4500,
    description: "iFood — almoço",
    categoryKey: "ali",
    date: `${TODAY}`,
    accountId: "acc-nu",
    recurringId: null,
    createdAt: `${TODAY}T12:00:00Z`,
  },
  {
    id: "tx-2",
    type: "income" as const,
    amountCents: 620000,
    description: "Salário",
    categoryKey: "sal",
    date: "2026-09-29",
    accountId: "acc-itau",
    recurringId: null,
    createdAt: "2026-09-29T09:00:00Z",
  },
];

export const SUMMARY = {
  balanceCents: 615500,
  incomeCents: 620000,
  expenseCents: 4500,
  daily: [{ day: 30, incomeCents: 0, expenseCents: 4500 }],
};

export const RECURRINGS = [
  {
    id: "rec-1",
    description: "Aluguel",
    amountCents: 180000,
    categoryKey: "cas",
    type: "expense" as const,
    frequency: "monthly" as const,
    dueDay: 5,
    endDate: null,
    accountId: "acc-nu",
    status: "pending" as const,
    dueDate: "2026-10-05",
    paidAt: null,
  },
];

export const UPCOMING_RECURRINGS = [
  {
    id: "rec-1",
    description: "Aluguel",
    amountCents: 180000,
    categoryKey: "cas",
    type: "expense" as const,
    frequency: "monthly" as const,
    dueDay: 5,
    endDate: null,
    accountId: "acc-nu",
    status: "pending" as const,
    dueDate: "2026-10-05",
    paidAt: null,
  },
];

export const BUDGETS = [{ categoryKey: "ali", limitCents: 60000, spentCents: 45000 }];

export const GOALS = [
  {
    id: "goal-1",
    name: "Viagem",
    icon: "landscape",
    targetCents: 500000,
    savedCents: 150000,
    steps: 10,
    currentStep: 3,
    chestsOpened: [],
    completed: false,
    deadline: null,
  },
];

export const TASKS = [
  { id: "task-1", title: "Ligar pro dentista", dueDate: TODAY, priority: "high" as const, reminderAt: null, done: false, doneAt: null },
  { id: "task-2", title: "Revisar orçamento", dueDate: TODAY, priority: "medium" as const, reminderAt: null, done: false, doneAt: null },
];

export const REMINDERS = [
  { id: "rem-1", title: "Pagar o aluguel", kind: "finance" as const, time: "09:00", repeat: "monthly" as const, dayOfMonth: 5, weekday: null, date: null, enabled: true },
];

// A missão "gastar-pouco" chega sem `unit` de propósito — cobre o fallback
// (src/lib/api/schemas.ts:missionSchema + missions-section.tsx:isMoney) que
// deduz "cents" por `target >= 1000` quando o back não manda o campo.
export const MISSIONS = [
  { key: "registrar-lancamentos", title: "Registre 3 lançamentos", icon: "receipt_long", progress: 3, target: 3, xp: 15, coins: 5, claimed: false, unit: "count" as const },
  { key: "concluir-tarefas", title: "Conclua 2 tarefas", icon: "task_alt", progress: 0, target: 2, xp: 15, coins: 5, claimed: false, unit: "count" as const },
  { key: "gastar-pouco", title: "Gaste menos de R$ 80 hoje", icon: "savings", progress: 4500, target: 8000, xp: 20, coins: 10, claimed: false },
];

export const STREAK = {
  streak: 5,
  record: 12,
  shields: 1,
  days: [
    { date: "2026-09-24", done: true },
    { date: "2026-09-25", done: true },
    { date: "2026-09-26", done: true },
    { date: "2026-09-27", done: true },
    { date: "2026-09-28", done: true },
    { date: "2026-09-29", done: false },
  ],
  closedToday: false,
  lostStreak: 0,
};

export const BOSS = {
  name: "Aluguel",
  icon: "home",
  maxHpCents: 180000,
  hpCents: 90000,
  defeated: false,
  month: MONTH,
  dueDate: "2026-10-05",
};

export const ACHIEVEMENTS = [
  { key: "primeiro-passo", title: "Primeiro passo", description: "Configurou sua órbita", icon: "flag", hint: null, unlocked: true, unlockedAt: "2026-01-01" },
  { key: "fogo-aceso", title: "Fogo aceso", description: "3 dias de ofensiva", icon: "local_fire_department", hint: "Feche 3 dias seguidos", unlocked: true, unlockedAt: "2026-01-05" },
  { key: "cacador-de-chefao", title: "Caçador de chefão", description: "Derrotou um chefão", icon: "swords", hint: "Derrote um chefão do mês", unlocked: false, unlockedAt: null },
];

export const SHOP = [
  { key: "escudo", name: "Escudo", icon: "shield", price: 200, owned: false },
  { key: "tema-noite-estrelada", name: "Tema Noite Estrelada", icon: "palette", price: 500, owned: false },
];

export const COMPARE = {
  previous: { month: "2026-08", byCategory: [{ key: "ali", cents: 40000 }], totalCents: 40000 },
  current: { month: "2026-09", byCategory: [{ key: "ali", cents: 45000 }], totalCents: 45000 },
};
