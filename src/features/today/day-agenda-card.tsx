"use client";

import { useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AGENDA_COLOR } from "@/features/agenda/agenda-items";
import { AgendaItemRow } from "@/features/agenda/agenda-item-row";
import { useAgenda } from "@/features/agenda/use-agenda";
import { MONTHS, addDaysISO, parseISODate, todayISO, weekdayShort } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

/** Domingo da semana do dia. */
function weekStart(iso: string): string {
  return addDaysISO(iso, -parseISODate(iso).getUTCDay());
}

/** Faixa da semana (Dom 12 · Seg 13 …) + o que tem no dia escolhido. */
export function DayAgendaCard({ className }: { className?: string }) {
  const today = todayISO();
  const [selected, setSelected] = useState(today);
  const [start, setStart] = useState(weekStart(today));
  const end = addDaysISO(start, 7);
  const agenda = useAgenda(start, end);
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(start, i));
  const dayItems = agenda.items.filter((i) => i.date === selected);
  const month = MONTHS[parseISODate(addDaysISO(start, 3)).getUTCMonth()];

  const shift = (weeks: number) => {
    const next = addDaysISO(start, weeks * 7);
    setStart(next);
    setSelected(next <= today && today < addDaysISO(next, 7) ? today : next);
  };

  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-[17px] leading-none font-semibold">
          {month} {start.slice(0, 4)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Semana anterior"
            onClick={() => shift(-1)}
            className="flex size-8 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
          >
            <Icon name="chevron_left" size={20} />
          </button>
          <button
            type="button"
            aria-label="Próxima semana"
            onClick={() => shift(1)}
            className="flex size-8 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
          >
            <Icon name="chevron_right" size={20} />
          </button>
          <Link href={`/agenda?dia=${selected}`} className="ml-1 text-sm leading-none text-g no-underline hover:text-gd">
            Agenda
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const on = d === selected;
          const kinds = [...new Set(agenda.items.filter((i) => i.date === d).map((i) => i.kind))];
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              aria-label={d}
              onClick={() => setSelected(d)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-full py-2.5 transition-colors",
                on ? "bg-g text-white" : "bg-sf2 text-ink hover:bg-bd",
              )}
            >
              <span className={cn("text-[11px] leading-none", on ? "text-white/80" : "text-mut")}>{weekdayShort(d)}</span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-[15px] leading-none font-semibold",
                  on && "bg-white text-g",
                  !on && d === today && "text-g",
                )}
              >
                {Number(d.slice(8, 10))}
              </span>
              <span className="flex h-1.5 gap-0.5">
                {kinds.map((k) => (
                  <span key={k} className="size-1.5 rounded-full" style={{ background: on ? "#fff" : AGENDA_COLOR[k] }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col">
        <QueryState
          query={agenda}
          rows={2}
          compact
          isEmpty={dayItems.length === 0}
          empty={<EmptyState compact icon="event_available" title="Dia livre" text="Nada marcado para esse dia." />}
        >
          {dayItems.map((i) => (
            <AgendaItemRow key={i.key} item={i} />
          ))}
        </QueryState>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1" onClick={() => openQuickAdd({ kind: "task", date: selected })}>
          <Icon name="add" size={18} />
          Tarefa
        </Button>
        <Button size="sm" variant="secondary" className="flex-1" onClick={() => openQuickAdd({ kind: "reminder", date: selected })}>
          <Icon name="notifications" size={18} />
          Lembrete
        </Button>
      </div>
    </Card>
  );
}
