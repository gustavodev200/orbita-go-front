"use client";

import Link from "next/link";

import { CheckCircle } from "@/components/orbita/check-circle";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { isScheduled } from "./catalog";
import { useHabits, useToggleHabitDay } from "./hooks";

/** Hábitos agendados para hoje, com check rápido e progresso do dia. */
export function TodayHabitsCard({ className }: { className?: string }) {
  const habits = useHabits();
  const toggle = useToggleHabitDay();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const today = todayISO();
  const list = (habits.data ?? []).filter((h) => isScheduled(h, today));
  const done = list.filter((h) => h.checks.includes(today)).length;

  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <CardHeader>
        <CardTitle>Hábitos de hoje</CardTitle>
        <Link href="/habitos" className="text-sm leading-none text-g no-underline hover:text-gd">
          Ver todos
        </Link>
      </CardHeader>
      {list.length ? (
        <div className="flex items-center gap-3">
          <Progress value={(done / list.length) * 100} size="sm" className="flex-1" />
          <span className="num text-xs leading-none text-mut">
            {done}/{list.length}
          </span>
        </div>
      ) : null}
      <QueryState
        query={habits}
        rows={2}
        compact
        isEmpty={list.length === 0}
        empty={
          <EmptyState
            compact
            icon="self_improvement"
            title={(habits.data ?? []).length ? "Nenhum hábito hoje" : "Crie um hábito"}
            text={(habits.data ?? []).length ? "Hoje não está na rotina de nenhum hábito." : "Rotinas pequenas, marcadas todo dia."}
            ctaLabel={(habits.data ?? []).length ? undefined : "Novo hábito"}
            onCta={() => openQuickAdd({ kind: "habit" })}
          />
        }
      >
        <div className="flex flex-col">
          {list.map((h) => {
            const on = h.checks.includes(today);
            return (
              <div key={h.id} className="flex items-center gap-3 py-2">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: h.color }}>
                  <Icon name={h.icon} size={18} />
                </span>
                <span className={cn("min-w-0 flex-1 truncate text-[15px] font-medium", on && "text-mut line-through")}>{h.name}</span>
                {h.streak > 1 ? <span className="text-xs text-mut">{h.streak} dias</span> : null}
                <CheckCircle checked={on} label={`Marcar ${h.name} hoje`} onCheckedChange={() => toggle(h, today)} />
              </div>
            );
          })}
        </div>
      </QueryState>
    </Card>
  );
}
