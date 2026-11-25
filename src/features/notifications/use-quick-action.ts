"use client";

import { checkChallenge, challengeKeys } from "@/features/challenges/api";
import { checkHabit, habitKeys } from "@/features/habits/api";
import { reminderKeys } from "@/features/reminders/api";
import { useApiMutation, useRewardedMutation } from "@/features/rewards/use-api-mutation";
import { completeTask, taskKeys, updateTask } from "@/features/tasks/api";
import { todayISO } from "@/lib/dates";
import type { AppNotification } from "./api";
import { useRefreshNotifications } from "./hooks";
import { tomorrowISO, type QuickAction } from "./notification-meta";

/**
 * Ações rápidas da central: resolvem o alerta usando as mesmas rotas das
 * telas (XP, sincronização de lembretes etc. continuam valendo) e depois
 * recalculam a central para o alerta sumir.
 */
export function useQuickAction() {
  const refresh = useRefreshNotifications();
  const after = () => void refresh();

  const complete = useRewardedMutation({
    mutationFn: (id: string) => completeTask(id),
    invalidate: [taskKeys.all, reminderKeys.all],
    message: () => "Tarefa concluída",
    onSuccess: after,
  });
  const postpone = useApiMutation({
    mutationFn: (id: string) => updateTask(id, { dueDate: tomorrowISO() }),
    invalidate: [taskKeys.all],
    message: () => "Reagendada para amanhã",
    onSuccess: after,
  });
  const habit = useApiMutation({
    mutationFn: (id: string) => checkHabit(id, todayISO()),
    invalidate: [habitKeys.all],
    message: () => "Hábito marcado",
    onSuccess: after,
  });
  const challenge = useApiMutation({
    mutationFn: (id: string) => checkChallenge(id, todayISO()),
    invalidate: [challengeKeys.all, ["timeline"]],
    message: () => "Check-in feito",
    onSuccess: after,
  });

  const pending = complete.isPending || postpone.isPending || habit.isPending || challenge.isPending;

  function run(action: QuickAction, n: AppNotification) {
    const id = n.entityId;
    if (!id) return;
    if (action === "complete-task") complete.mutate(id);
    else if (action === "postpone-task") postpone.mutate(id);
    else if (action === "check-habit") habit.mutate(id);
    else challenge.mutate(id);
  }

  return { run, pending };
}

export const ACTION_LABEL: Record<QuickAction, { label: string; icon: string }> = {
  "complete-task": { label: "Concluir", icon: "check" },
  "postpone-task": { label: "Amanhã", icon: "event_repeat" },
  "check-habit": { label: "Marcar feito", icon: "check" },
  "check-challenge": { label: "Fazer check-in", icon: "check" },
};
