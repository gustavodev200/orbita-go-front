"use client";

import { FocusShortcut } from "@/features/focus/focus-shortcut";
import { TodayHabitsCard } from "@/features/habits/today-habits-card";
import { BalanceHero } from "./balance-hero";
import { DayAgendaCard } from "./day-agenda-card";
import { TodayTasksCard } from "./today-tasks-card";
import { UpcomingRecurringsCard } from "./upcoming-recurrings-card";

/**
 * Início: o que importa no dia a dia. Mobile: uma coluna (saldo → semana →
 * tarefas → contas). Desktop: duas colunas.
 */
export function TodayScreen() {
  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-5">
        <BalanceHero />
        <DayAgendaCard />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <TodayTasksCard />
        <TodayHabitsCard />
        <FocusShortcut />
        <UpcomingRecurringsCard />
      </div>
    </div>
  );
}
