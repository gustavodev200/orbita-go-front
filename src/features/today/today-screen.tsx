"use client";

import { BossCard } from "./boss-card";
import { GreetingSection } from "./greeting-section";
import { MissionsSection } from "./missions-section";
import { MonthSummaryCard } from "./month-summary-card";
import { StreakCard } from "./streak-card";
import { TodayTasksCard } from "./today-tasks-card";
import { UpcomingRecurringsCard } from "./upcoming-recurrings-card";

/**
 * Hoje. Desktop: duas colunas independentes (1.45fr 1fr, gap 18).
 * Mobile: uma coluna na ordem g o m s r t b — colunas viram `display: contents`
 * e cada seção ganha `order`.
 */
export function TodayScreen() {
  return (
    <div className="flex flex-col gap-[18px] lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
      <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-[18px]">
        <GreetingSection className="order-1 lg:order-none" />
        <MissionsSection className="order-3 lg:order-none" />
        <MonthSummaryCard className="order-4 lg:order-none" />
        <TodayTasksCard className="order-6 lg:order-none" />
      </div>
      <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-[18px]">
        <StreakCard className="order-2 lg:order-none" />
        <UpcomingRecurringsCard className="order-5 lg:order-none" />
        <BossCard className="order-7 lg:order-none" />
      </div>
    </div>
  );
}
