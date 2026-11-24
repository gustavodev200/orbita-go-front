"use client";

import { BarChart } from "@/components/orbita/charts";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Habit } from "@/lib/api/schemas";
import { addDaysISO, formatDM, formatDMY, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { WEEKDAY_SHORT, isScheduled, weekdaysLabel } from "./catalog";
import { habitRate, heatmap, weeklyRates, type HeatCell } from "./consistency";
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

const HEAT_LABEL: Record<HeatCell["state"], string> = {
  done: "feito",
  missed: "não feito",
  off: "fora da rotina",
  future: "",
};

/** Últimas 13 semanas (colunas seg→dom): cheio = feito, cinza = faltou, apagado = fora da rotina. */
function HabitHeatmap({ habit }: { habit: Habit }) {
  const grid = heatmap(habit);
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-1.5">
      <div className="grid auto-cols-fr grid-flow-col grid-rows-7 gap-[3px]" role="img" aria-label={`Últimas 13 semanas de ${habit.name}`}>
        {grid.flat().map((c) => (
          <span
            key={c.day}
            title={c.state === "future" ? undefined : `${formatDMY(c.day)} · ${HEAT_LABEL[c.state]}`}
            className={cn(
              "aspect-square rounded-[3px]",
              c.state === "missed" && "bg-bd",
              c.state === "off" && "bg-sf2",
              c.state === "future" && "bg-transparent",
            )}
            style={c.state === "done" ? { background: habit.color } : undefined}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] leading-none text-mut">
        <span>13 semanas atrás</span>
        <span>Esta semana</span>
      </div>
    </div>
  );
}

function HabitStats({ habit }: { habit: Habit }) {
  const rate = habitRate(habit);
  const items = [
    { label: "Sequência", value: habit.streak ? streakLabel(habit.streak) : "—" },
    { label: "Recorde", value: habit.bestStreak ? `${habit.bestStreak} ${habit.bestStreak === 1 ? "dia" : "dias"}` : "—" },
    { label: "Últimos 30 dias", value: rate === null ? "—" : `${rate}%` },
  ];
  return (
    <dl className="m-0 grid grid-cols-3 gap-2">
      {items.map((i) => (
        <div key={i.label} className="rounded-2xl bg-sf2 px-3 py-2.5">
          <dt className="text-[11px] leading-none text-mut">{i.label}</dt>
          <dd className="num m-0 mt-1.5 text-sm leading-none font-semibold">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Topo da tela: feitos hoje, taxa de 30 dias, recorde e barras das últimas 12 semanas. */
function ConsistencyPanel({ habits }: { habits: Habit[] }) {
  const today = todayISO();
  const dueToday = habits.filter((h) => isScheduled(h, today));
  const doneToday = dueToday.filter((h) => h.checks.includes(today)).length;
  const weeks = weeklyRates(habits);
  const last30 = (() => {
    const rates = habits.map((h) => habitRate(h)).filter((r): r is number => r !== null);
    return rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : null;
  })();
  const best = habits.reduce((a, h) => Math.max(a, h.bestStreak), 0);
  const stats = [
    { label: "Feitos hoje", value: `${doneToday}/${dueToday.length}` },
    { label: "Consistência 30 dias", value: last30 === null ? "—" : `${last30}%` },
    { label: "Maior sequência atual", value: `${habits.reduce((a, h) => Math.max(a, h.streak), 0)}` },
    { label: "Recorde", value: `${best}` },
  ];
  return (
    <Card className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[13px] leading-none text-mut">{s.label}</div>
            <div className="num mt-2 text-[26px] leading-none font-semibold tracking-[-.02em]">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-[15px] leading-none font-semibold">Consistência por semana</div>
        <BarChart
          caption="Porcentagem de hábitos cumpridos por semana, últimas 12 semanas"
          data={weeks.map((w, i) => ({
            label: i % 2 === 1 || i === weeks.length - 1 ? formatDM(w.week) : "",
            title: `Semana de ${formatDM(w.week)} · ${w.done} de ${w.total} dias`,
            values: [w.pct ?? 0],
          }))}
          series={[{ name: "Cumpridos", color: "var(--gd)" }]}
          format={(v) => `${Math.round(v)}%`}
          max={100}
          height={150}
        />
      </div>
    </Card>
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
      <HabitStats habit={habit} />
      <HabitHeatmap habit={habit} />
    </Card>
  );
}

/** Hábitos: rotinas da semana, marcação diária, sequência, recorde e consistência. */
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
        <div className="flex flex-col gap-4">
          <ConsistencyPanel habits={list} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {list.map((h) => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </div>
        </div>
      </QueryState>
    </div>
  );
}
