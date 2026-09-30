import type { Goal } from "@/lib/api/schemas";

/** Baús depois dos nós 3 e 7 (índices 0-based 2 e 6 — design README). */
export const CHEST_AFTER = [2, 6];
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
 * Valor sugerido no botão "Guardar" do nó atual: usa a parcela configurada
 * na meta (`installmentCents`, manual ou nula) quando fizer sentido; senão
 * cai no valor calculado por `stepAmountOf` (divisão igual em 10 passos).
 * Os marcos da trilha (labels dos nós, baús) continuam em partes iguais —
 * só a sugestão de depósito muda.
 */
export function suggestedStepAmountOf(
  goal: Pick<Goal, "targetCents" | "steps" | "installmentCents">,
  i: number,
): number {
  const amount = stepAmountOf(goal, i);
  return goal.installmentCents && goal.installmentCents > 0 ? goal.installmentCents : amount;
}
