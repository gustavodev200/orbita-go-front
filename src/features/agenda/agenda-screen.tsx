"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { EmptyState, LoadingState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { NotificationsCard } from "@/features/push/notifications-card";
import { useDeleteReminder, useReminders, useToggleReminder } from "@/features/reminders/hooks";
import { whenLabel } from "@/features/reminders/recurrence";
import type { Reminder } from "@/lib/api/schemas";
import { addDaysISO, dayGroupLabel, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { AgendaItemRow } from "./agenda-item-row";
import { useAgenda } from "./use-agenda";

// FullCalendar mexe em DOM/medidas: só no client.
const AgendaCalendar = dynamic(() => import("./agenda-calendar"), {
  ssr: false,
  loading: () => <LoadingState rows={5} />,
});

function ReminderRow({ r }: { r: Reminder }) {
  const toggle = useToggleReminder();
  const del = useDeleteReminder();
  const [enabled, setEnabled] = useState(r.enabled);
  return (
    <div className={cn("flex items-center gap-3 py-3 transition-opacity", !enabled && "opacity-50")}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gs text-g">
        <Icon name={r.kind === "finance" ? "payments" : "notifications"} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] leading-[1.25] font-medium">{r.title}</div>
        <div className="mt-1 text-xs leading-none text-mut">
          {whenLabel(r, todayISO())} · {r.time}
        </div>
      </div>
      <Switch
        checked={enabled}
        aria-label={enabled ? "Desativar lembrete" : "Ativar lembrete"}
        onCheckedChange={(v) => {
          setEnabled(v);
          toggle.mutate({ id: r.id, enabled: v }, { onError: () => setEnabled(!v) });
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Opções do lembrete"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 data-[state=open]:bg-sf2"
        >
          <Icon name="more_horiz" size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start">
          <DropdownMenuItem tone="danger" disabled={del.isPending} onSelect={() => del.mutate(r.id)}>
            <Icon name="delete" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function activeLabel(n: number) {
  return n === 1 ? "1 ativo" : `${n} ativos`;
}

/** Agenda: calendário (FullCalendar) + o que tem no dia + lembretes + notificações. */
export function AgendaScreen() {
  const params = useSearchParams();
  const today = todayISO();
  const [selected, setSelected] = useState(params.get("dia") ?? today);
  const [range, setRange] = useState({ start: addDaysISO(today, -7), end: addDaysISO(today, 42) });
  const agenda = useAgenda(range.start, range.end);
  const reminders = useReminders();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const dayItems = agenda.items.filter((i) => i.date === selected);
  const list = (reminders.data ?? []).filter((r) => !r.taskId);

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card padding="md" className="lg:p-5">
        <AgendaCalendar
          items={agenda.items}
          selected={selected}
          onSelectDay={setSelected}
          onRangeChange={(start, end) => setRange((r) => (r.start === start && r.end === end ? r : { start, end }))}
        />
      </Card>

      <div className="flex min-w-0 flex-col gap-5">
        <Card className="flex flex-col gap-2">
          <CardHeader>
            <CardTitle>{dayGroupLabel(selected, today)}</CardTitle>
            <div className="flex gap-1.5">
              <Button size="xs" variant="secondary" onClick={() => openQuickAdd({ kind: "task", date: selected })}>
                <Icon name="add" size={16} />
                Tarefa
              </Button>
              <Button size="xs" onClick={() => openQuickAdd({ kind: "reminder", date: selected })}>
                <Icon name="add" size={16} />
                Lembrete
              </Button>
            </div>
          </CardHeader>
          <QueryState
            query={agenda}
            rows={2}
            compact
            isEmpty={dayItems.length === 0}
            empty={<EmptyState compact icon="event_available" title="Dia livre" text="Nada marcado. Toque em + para adicionar." />}
          >
            <div className="flex flex-col">
              {dayItems.map((i) => (
                <AgendaItemRow key={i.key} item={i} />
              ))}
            </div>
          </QueryState>
        </Card>

        <NotificationsCard />

        <Card className="flex flex-col">
          <CardHeader className="pb-1">
            <CardTitle>Meus lembretes</CardTitle>
            <span className="text-[13px] text-mut">{activeLabel(list.filter((r) => r.enabled).length)}</span>
          </CardHeader>
          <QueryState
            query={reminders}
            rows={3}
            compact
            isEmpty={list.length === 0}
            empty={
              <EmptyState
                compact
                icon="notifications"
                title="Nenhum lembrete"
                text="Crie lembretes para contas, compromissos e hábitos. Eles chegam como notificação."
                ctaLabel="Criar lembrete"
                onCta={() => openQuickAdd({ kind: "reminder", date: selected })}
              />
            }
          >
            <div className="flex flex-col [&>*+*]:border-t [&>*+*]:border-sf2">
              {list.map((r) => (
                <ReminderRow key={r.id} r={r} />
              ))}
            </div>
          </QueryState>
        </Card>
      </div>
    </div>
  );
}
