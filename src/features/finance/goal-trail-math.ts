import { addDaysISO, addMonthsISO, deadlineToISODay, monthsUntil } from "@/lib/dates";
import type { Goal, GoalFrequency } from "@/lib/api/schemas";

export const CHEST_COINS = 50;

export type NodeState = "done" | "current" | "locked";

/** Passo "atual" da trilha (meta concluída = todos os passos feitos). */
export function currentStepOf(goal: Pick<Goal, "completed" | "currentStep" | "steps">): number {
  return goal.completed ? goal.steps : goal.currentStep;
}

/** Estado do nó `i` (0-based) da trilha. */
export function nodeStateOf(goal: Pick<Goal, "completed" | "currentStep" | "steps">, i: number): NodeState {
  const current = currentStepOf(goal);
  return i < current ? "done" : i === current ? "current" : "locked";
}

/**
 * Valor sugerido de depósito para o nó `i` (0-based): divide `targetCents`
 * igualmente pelos passos, mas o último nó absorve o resto do
 * arredondamento pra soma total bater com `targetCents` exatamente.
 */
export function stepAmountOf(goal: Pick<Goal, "targetCents" | "steps">, i: number): number {
  const steps = goal.steps || 10;
  const per = Math.round(goal.targetCents / steps);
  return i === steps - 1 ? goal.targetCents - per * (steps - 1) : per;
}

/**
 * Um baú (posicionado depois do nó `chestIndex`, 0-based) está aberto quando
 * a trilha já passou dele, ou quando o back marcou explicitamente em
 * `chestsOpened` (1-based, conferir API_CONTRACT).
 */
export function chestOpenedOf(goal: Pick<Goal, "completed" | "currentStep" | "steps" | "chestsOpened">, chestIndex: number): boolean {
  return currentStepOf(goal) > chestIndex || goal.chestsOpened.includes(chestIndex + 1);
}

/**
 * Parcela sugerida quando o modo é "gerar" E a meta tem prazo (ainda não
 * vencido): quanto falta ÷ meses restantes até a data, arredondado pra cima
 * (nunca sugere menos do que precisa pra chegar lá a tempo). `null` quando
 * não há prazo utilizável — aí quem chama cai no cálculo padrão (10 passos).
 */
export function installmentByDeadline(
  targetCents: number,
  savedCents: number,
  deadline: string | null | undefined,
  today: string,
): number | null {
  if (!deadline) return null;
  const deadlineDay = deadlineToISODay(deadline);
  if (deadlineDay <= today) return null;
  const remaining = Math.max(0, targetCents - savedCents);
  return Math.ceil(remaining / monthsUntil(today, deadlineDay));
}

/**
 * Valor sugerido no botão "Guardar" do nó atual, nessa ordem: parcela manual
 * (`installmentCents`) → parcela gerada a partir do prazo → divisão igual em
 * 10 passos (`stepAmountOf`). Os marcos da trilha (labels dos nós, baús)
 * continuam em partes iguais — só a sugestão de depósito muda.
 */
export function suggestedStepAmountOf(
  goal: Pick<Goal, "targetCents" | "savedCents" | "steps" | "installmentCents" | "deadline">,
  i: number,
  today: string,
): number {
  if (goal.installmentCents && goal.installmentCents > 0) return goal.installmentCents;
  return installmentByDeadline(goal.targetCents, goal.savedCents, goal.deadline, today) ?? stepAmountOf(goal, i);
}

/**
 * Passos (1-based) após os quais abre um baú, proporcional ao tamanho da
 * trilha (~30% e ~70% do caminho). Pra `steps` = 10 (trilha padrão, sem
 * prazo/frequência) dá exatamente [3, 7] — mesmo resultado de sempre.
 * Espelha `chestStepsFor` do back (gamification/rules.ts).
 */
export function chestStepsFor(steps: number): number[] {
  const candidates = [Math.round(steps * 0.3), Math.round(steps * 0.7)];
  return [...new Set(candidates)].filter((step) => step > 0 && step < steps).sort((a, b) => a - b);
}

/**
 * Datas (YYYY-MM-DD) de cada aporte esperado entre `trailStartDate` e
 * `deadline`, na cadência escolhida. Sempre termina exatamente no prazo e
 * sempre tem pelo menos 1 data. Espelha `scheduleDatesOf` do back.
 */
export function scheduleDatesOf(trailStartDate: string, deadline: string, frequency: GoalFrequency): string[] {
  // Mensal soma sempre a partir da âncora original (não encadeia a partir do
  // resultado anterior) — senão um mês curto que clampa o dia (31→28 em
  // fev) deixaria os meses seguintes presos em 28 pra sempre.
  function occurrence(n: number): string {
    if (frequency === "weekly") return addDaysISO(trailStartDate, n * 7);
    if (frequency === "biweekly") return addDaysISO(trailStartDate, n * 15);
    return addMonthsISO(trailStartDate, n);
  }

  const dates: string[] = [];
  let n = 1;
  let cur = occurrence(n);
  while (cur < deadline) {
    dates.push(cur);
    n += 1;
    cur = occurrence(n);
  }
  dates.push(deadline);
  return dates;
}

/** Meta tem trilha por data (em vez da trilha por dinheiro de 10 passos fixos)? */
export function hasDateSchedule(goal: Pick<Goal, "deadline" | "frequency" | "trailStartDate">): boolean {
  return Boolean(goal.deadline && goal.frequency && goal.trailStartDate);
}

/** Data do aporte esperado no nó `i` (0-based), ou `null` se a meta não tem trilha por data. */
export function nodeDateOf(goal: Pick<Goal, "deadline" | "frequency" | "trailStartDate">, i: number): string | null {
  if (!hasDateSchedule(goal)) return null;
  const dates = scheduleDatesOf(goal.trailStartDate!, deadlineToISODay(goal.deadline!), goal.frequency!);
  return dates[i] ?? null;
}
