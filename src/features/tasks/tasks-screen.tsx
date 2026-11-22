"use client";

import { useState } from "react";

import { CheckCircle } from "@/components/orbita/check-circle";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Task } from "@/lib/api/schemas";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/colors";
import { addDaysISO, dayGroupLabel, formatDM, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { useCreateTask, useDeleteTask, useTasks, useToggleTask } from "./hooks";

type Group = "atrasadas" | "hoje" | "amanha" | "prox" | "sem";
const GROUPS: { value: Group; label: string }[] = [
  { value: "atrasadas", label: "Atrasadas" },
  { value: "hoje", label: "Hoje" },
  { value: "amanha", label: "Amanhã" },
  { value: "prox", label: "Próximas" },
  { value: "sem", label: "Sem data" },
];

export function groupOf(t: Task, today: string): Group {
  if (!t.dueDate) return "sem";
  const d = t.dueDate.slice(0, 10);
  if (d < today) return t.done ? "hoje" : "atrasadas";
  if (d === today) return "hoje";
  if (d === addDaysISO(today, 1)) return "amanha";
  return "prox";
}

function metaLine(task: Task, group: Group, today: string): string[] {
  const parts: string[] = [];
  if (task.dueDate && (group === "prox" || group === "atrasadas")) parts.push(dayGroupLabel(task.dueDate.slice(0, 10), today));
  if (task.reminderAt) {
    const date = task.reminderAt.slice(0, 10);
    const time = task.reminderAt.length >= 16 ? task.reminderAt.slice(11, 16) : "";
    parts.push(date === (task.dueDate?.slice(0, 10) ?? today) ? `⏰ ${time}` : `⏰ ${formatDM(date)} ${time}`);
  }
  return parts;
}

export function TaskRow({ task, group, onToggle }: { task: Task; group: Group; onToggle: (t: Task) => void }) {
  const today = todayISO();
  const del = useDeleteTask();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const meta = metaLine(task, group, today);
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <CheckCircle checked={task.done} label={`Concluir ${task.title}`} onCheckedChange={() => onToggle(task)} />
      <button
        type="button"
        onClick={() => openQuickAdd({ kind: "task", editing: task })}
        className="min-w-0 flex-1 bg-transparent p-0 text-left"
      >
        <div className={cn("text-[15px] leading-[1.3] font-medium", task.done ? "text-mut line-through" : "text-ink")}>{task.title}</div>
        {meta.length ? (
          <div className={cn("mt-1 text-xs leading-none", group === "atrasadas" ? "text-r" : "text-mut")}>{meta.join(" · ")}</div>
        ) : null}
      </button>
      <span
        title={`Prioridade ${PRIORITY_LABEL[task.priority].toLowerCase()}`}
        className={cn("size-2 shrink-0 rounded-full", task.done && "opacity-30")}
        style={{ background: PRIORITY_COLOR[task.priority] }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Opções"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 data-[state=open]:bg-sf2"
        >
          <Icon name="more_horiz" size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start">
          <DropdownMenuItem tone="info" onSelect={() => openQuickAdd({ kind: "task", editing: task })}>
            <Icon name="edit" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem tone="danger" disabled={del.isPending} onSelect={() => del.mutate(task.id)}>
            <Icon name="delete" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function QuickCreate() {
  const [draft, setDraft] = useState("");
  const create = useCreateTask(() => setDraft(""));
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const today = todayISO();

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    create.mutate({ title, dueDate: today, priority: "medium", reminderAt: null });
  };

  return (
    <div className="flex gap-2">
      <Input
        containerClassName="flex-1"
        icon={<Icon name="add" size={22} className="text-mut" />}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder="Adicionar tarefa para hoje…"
        aria-label="Nova tarefa"
        trailing={
          <button
            type="button"
            aria-label="Mais opções"
            onClick={() => openQuickAdd({ kind: "task", date: today })}
            className="flex size-8 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
          >
            <Icon name="tune" size={20} />
          </button>
        }
      />
      <Button size="icon" aria-label="Adicionar tarefa" onClick={add} disabled={create.isPending || !draft.trim()}>
        <Icon name="arrow_upward" />
      </Button>
    </div>
  );
}

/** Tarefas: criar rápido, grupos por data, concluídas recolhidas no fim. */
export function TasksScreen() {
  const tasks = useTasks();
  const toggle = useToggleTask();
  const [showDone, setShowDone] = useState(false);
  const today = todayISO();
  const list = tasks.data ?? [];
  const pending = list.filter((t) => !t.done);
  const done = list.filter((t) => t.done);
  const groups = GROUPS.map((g) => ({ ...g, items: pending.filter((t) => groupOf(t, today) === g.value) })).filter((g) => g.items.length);
  const todays = list.filter((t) => t.dueDate && t.dueDate.slice(0, 10) === today);
  const doneToday = todays.filter((t) => t.done).length;

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-5">
        <QuickCreate />
        <QueryState
          query={tasks}
          rows={5}
          isEmpty={list.length === 0}
          frame={(node) => <Card>{node}</Card>}
          empty={<EmptyState icon="task_alt" title="Nenhuma tarefa por aqui" text="Escreva uma tarefa no campo acima e organize seu dia." />}
        >
          {groups.length === 0 ? (
            <Card>
              <EmptyState compact icon="celebration" title="Tudo feito!" text="Nenhuma tarefa pendente. Aproveite o dia." />
            </Card>
          ) : null}
          {groups.map((g) => (
            <section key={g.value} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <h2 className={cn("m-0 text-base leading-none font-semibold", g.value === "atrasadas" && "text-r")}>{g.label}</h2>
                <span className="text-sm leading-none text-mut">{g.items.length}</span>
              </div>
              <Card padding="none" className="[&>*+*]:border-t [&>*+*]:border-sf2 overflow-hidden">
                {g.items.map((t) => (
                  <TaskRow key={t.id} task={t} group={g.value} onToggle={toggle} />
                ))}
              </Card>
            </section>
          ))}
          {done.length ? (
            <section className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowDone((v) => !v)}
                className="flex items-center gap-1.5 self-start bg-transparent px-1 text-sm leading-none font-medium text-mut hover:text-ink"
              >
                <Icon name={showDone ? "expand_less" : "expand_more"} size={20} />
                Concluídas ({done.length})
              </button>
              {showDone ? (
                <Card padding="none" className="[&>*+*]:border-t [&>*+*]:border-sf2 overflow-hidden">
                  {done.map((t) => (
                    <TaskRow key={t.id} task={t} group={groupOf(t, today)} onToggle={toggle} />
                  ))}
                </Card>
              ) : null}
            </section>
          ) : null}
        </QueryState>
      </div>

      <div className="hidden flex-col gap-4 lg:flex">
        <Card className="flex flex-col gap-3">
          <div className="text-sm text-mut">Hoje</div>
          <div className="text-[32px] leading-none font-semibold tracking-[-.02em]">
            {doneToday}
            <span className="text-mut">/{todays.length}</span>
          </div>
          <Progress value={todays.length ? (doneToday / todays.length) * 100 : 0} size="md" />
          <div className="text-[13px] leading-[1.4] text-mut">
            {todays.length === 0
              ? "Nenhuma tarefa marcada para hoje."
              : doneToday === todays.length
                ? "Tudo concluído hoje."
                : `Faltam ${todays.length - doneToday} para fechar o dia.`}
          </div>
        </Card>
        <Card className="flex flex-col gap-2.5">
          <div className="text-sm font-semibold">Prioridades</div>
          {(["high", "medium", "low"] as const).map((p) => (
            <div key={p} className="flex items-center gap-2.5 text-sm leading-none">
              <span className="size-2 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
              {PRIORITY_LABEL[p]}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
