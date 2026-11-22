"use client";

import { useQueries } from "@tanstack/react-query";

import { financeKeys, getRecurrings } from "@/features/finance/api";
import { useReminders } from "@/features/reminders/hooks";
import { useTasks } from "@/features/tasks/hooks";
import { addDaysISO, shiftMonth } from "@/lib/dates";
import { buildAgenda } from "./agenda-items";

/** Meses (YYYY-MM) tocados por [start, end). */
function monthsIn(start: string, end: string): string[] {
  const last = addDaysISO(end, -1).slice(0, 7);
  const out: string[] = [];
  for (let m = start.slice(0, 7); m <= last; m = shiftMonth(m, 1)) out.push(m);
  return out;
}

/** Itens da agenda em [start, end) + estado de carregamento combinado. */
export function useAgenda(start: string, end: string) {
  const reminders = useReminders();
  const tasks = useTasks();
  const months = monthsIn(start, end);
  const recurrings = useQueries({
    queries: months.map((month) => ({ queryKey: financeKeys.recurrings(month), queryFn: () => getRecurrings(month) })),
  });

  // Barato (algumas semanas × poucos itens): recalcula a cada render, sem memo.
  const items = buildAgenda(
    { reminders: reminders.data, tasks: tasks.data, recurrings: recurrings.flatMap((q) => q.data ?? []) },
    start,
    end,
  );

  return {
    items,
    isPending: reminders.isPending || tasks.isPending,
    isError: reminders.isError || tasks.isError,
    refetch: () => {
      void reminders.refetch();
      void tasks.refetch();
    },
  };
}
