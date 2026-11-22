"use client";

import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Habit } from "@/lib/api/schemas";
import { addDaysISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { WEEKDAY_SHORT, isScheduled, weekdaysLabel } from "./catalog";
import { useDeleteHabit, useHabits, useToggleHabitDay } from "./hooks";

function streakLabel(n: number) {
  return n === 1 ? "1 dia seguido" : `${n} dias seguidos`;
}

/** Últimos 7 dias (hoje à direita); toque marca/desmarca. Dias fora da rotina ficam esmaecidos. */
function HabitWeek({ habit }: { habit: Habit }) {
  const toggle = useToggleHabitDay();
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(today, i - 6));
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        const on = habit.checks.includes(d);
        const scheduled = isScheduled(habit, d);
        return (
          <button
            key={d}
            type="button"
            role="checkbox"
            aria-checked={on}
            aria-label={`${habit.name} em ${d}`}
            onClick={() => toggle(habit, d)}
            className={cn("flex flex-col items-center gap-1.5 rounded-2xl py-2 transition-colors", !scheduled && !on && "opacity-40")}
          >
            <span className={cn("text-[11px] leading-none", d === today ? "font-semibold text-ink" : "text-mut")}>
              {d === today ? "Hoje" : WEEKDAY_SHORT[new Date(`${d}T12:00:00Z`).getUTCDay()]}
            </span>
            <span
              className={cn("flex size-8 items-center justify-center rounded-full transition-colors", !on && "bg-sf2")}
              style={on ? { background: habit.color, color: "#fff" } : undefined}
            >
              {on ? <Icon name="check" size={18} /> : <span className="text-[13px] text-mut">{Number(d.slice(8, 10))}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HabitCard({ habit }: { habit: Habit }) {
  const del = useDeleteHabit();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: habit.color }}>
          <Icon name={habit.icon} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] leading-[1.25] font-semibold">{habit.name}</div>
          <div className="mt-1 text-xs leading-none text-mut">
            {weekdaysLabel(habit.weekdays)}
            {habit.reminderTime ? ` · ⏰ ${habit.reminderTime}` : ""}
            {habit.streak > 0 ? ` · ${streakLabel(habit.streak)}` : ""}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Opções de ${habit.name}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 data-[state=open]:bg-sf2"
          >
            <Icon name="more_horiz" size={20} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="start">
            <DropdownMenuItem tone="info" onSelect={() => openQuickAdd({ kind: "habit", editing: habit })}>
              <Icon name="edit" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem tone="danger" disabled={del.isPending} onSelect={() => del.mutate(habit.id)}>
              <Icon name="delete" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <HabitWeek habit={habit} />
    </Card>
  );
}

/** Hábitos: rotinas da semana, marcação diária e dias seguidos. */
export function HabitsScreen() {
  const habits = useHabits();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const list = habits.data ?? [];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm text-mut">Pequenas rotinas que você quer manter. Toque no dia para marcar.</p>
        <Button size="sm" onClick={() => openQuickAdd({ kind: "habit" })}>
          <Icon name="add" size={18} />
          Novo hábito
        </Button>
      </div>
      <QueryState
        query={habits}
        rows={3}
        isEmpty={list.length === 0}
        frame={(node) => <Card>{node}</Card>}
        empty={
          <EmptyState
            icon="self_improvement"
            title="Nenhum hábito ainda"
            text="Beber água, ler, caminhar… crie uma rotina e marque cada dia que cumprir."
            ctaLabel="Criar hábito"
            onCta={() => openQuickAdd({ kind: "habit" })}
          />
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((h) => (
            <HabitCard key={h.id} habit={h} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}
