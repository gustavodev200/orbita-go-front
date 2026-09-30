"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Checkbox3D } from "@/components/orbita/checkbox-3d";
import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { ProgressRing } from "@/components/orbita/medal";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUpdateMe } from "@/features/me/hooks";
import { usePushSubscription } from "@/features/push/use-push-subscription";
import type { Priority, Task } from "@/lib/api/schemas";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/colors";
import { addDaysISO, formatDM, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useCreateTask, useDeleteTask, useTasks, useToggleTask, useUpdateTask } from "./hooks";

type When = "hoje" | "amanha" | "prox" | "sem";
const WHEN: { value: When; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "amanha", label: "Amanhã" },
  { value: "prox", label: "Próximos" },
  { value: "sem", label: "Sem data" },
];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

function groupOf(t: Task, today: string): When {
  if (!t.dueDate) return "sem";
  const d = t.dueDate.slice(0, 10);
  if (d <= today) return "hoje";
  if (d === addDaysISO(today, 1)) return "amanha";
  return "prox";
}

function dueFor(when: When, today: string): string | null {
  if (when === "hoje") return today;
  if (when === "amanha") return addDaysISO(today, 1);
  if (when === "prox") return addDaysISO(today, 3);
  return null;
}

function reminderLabel(reminderAt: string, today: string) {
  const date = reminderAt.slice(0, 10);
  const time = reminderAt.length >= 16 ? reminderAt.slice(11, 16) : "";
  if (!time) return formatDM(date);
  return date === today ? time : `${formatDM(date)} ${time}`;
}

function TaskRow({ task, first, onToggle }: { task: Task; first: boolean; onToggle: (t: Task) => void }) {
  const [just, setJust] = useState(0);
  const [editing, setEditing] = useState(false);
  const today = todayISO();
  const del = useDeleteTask();
  return (
    <motion.div
      className={cn("relative flex items-center gap-3.5 px-4 py-3.5", !first && "border-t-2 border-sf2")}
      animate={{ backgroundColor: just ? ["rgba(32,184,120,0.16)", "rgba(32,184,120,0)"] : "rgba(32,184,120,0)" }}
      transition={{ duration: 0.9 }}
    >
      <div className="absolute top-3 bottom-3 left-0 w-[5px] rounded-r" style={{ background: PRIORITY_COLOR[task.priority] }} />
      <Checkbox3D
        checked={task.done}
        label={`Concluir ${task.title}`}
        onCheckedChange={() => {
          if (!task.done) setJust((n) => n + 1);
          onToggle(task);
        }}
      />
      <div className="min-w-0 flex-1">
        <div className={cn("text-base leading-[1.3] font-bold", task.done ? "text-mut line-through" : "text-ink")}>{task.title}</div>
        {task.reminderAt ? (
          <div className="mt-1 flex flex-wrap gap-2.5 text-xs leading-none font-bold text-mut">
            <span className="flex items-center gap-[3px] text-b">
              <Icon name="alarm" size={15} />
              {reminderLabel(task.reminderAt, today)}
            </span>
          </div>
        ) : null}
      </div>
      <div className={cn("rounded-[7px] bg-ys px-[7px] py-1 font-display text-xs leading-none font-black text-yd", task.done && "opacity-35")}>
        +5 XP
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Opções"
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-transparent text-mut outline-none data-[state=open]:bg-sf2"
        >
          <Icon name="more_vert" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start">
          <DropdownMenuItem tone="info" onSelect={() => setEditing(true)}>
            <Icon name="edit" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem tone="danger" disabled={del.isPending} onSelect={() => del.mutate(task.id)}>
            <Icon name="delete" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AnimatePresence>
        {just ? (
          <motion.div
            key={just}
            className="pointer-events-none absolute top-1 left-[34px] font-display text-base leading-none font-black text-yd"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -34 }}
            transition={{ duration: 0.9, ease: "easeOut", times: [0, 0.2, 1] }}
            onAnimationComplete={() => setJust(0)}
          >
            +5 XP
          </motion.div>
        ) : null}
      </AnimatePresence>
      {editing ? <EditTaskDialog task={task} open={editing} onOpenChange={setEditing} /> : null}
    </motion.div>
  );
}

/** Campos comuns a "Nova tarefa" e "Editar tarefa" (quando, prioridade, lembrete + horário). */
type TaskChipsState = { when: When; priority: Priority; reminder: boolean; reminderTime: string };
const EMPTY_TASK_CHIPS: TaskChipsState = { when: "hoje", priority: "medium", reminder: false, reminderTime: "09:00" };

function taskToChipsState(task: Task, today: string): TaskChipsState {
  const time = task.reminderAt && task.reminderAt.length >= 16 ? task.reminderAt.slice(11, 16) : "09:00";
  return { when: groupOf(task, today), priority: task.priority, reminder: !!task.reminderAt, reminderTime: time };
}

function TaskChipsFields({ state, onChange }: { state: TaskChipsState; onChange: (p: Partial<TaskChipsState>) => void }) {
  const push = usePushSubscription();
  const updateMe = useUpdateMe();

  // Ativar o lembrete sem nunca ter passado pelo Perfil deixava a notificação
  // "muda": a task salvava o horário mas nenhuma subscription existia pra
  // receber o push. Pede permissão/assina aqui também, no momento em que o
  // lembrete nasce.
  const toggleReminder = () => {
    const next = !state.reminder;
    onChange({ reminder: next });
    if (next) {
      void push.subscribe().then((ok) => {
        if (ok) updateMe.mutate({ notificationsEnabled: true });
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {WHEN.map((w) => (
        <ChoiceChip key={w.value} variant="greenMuted" size="xs" selected={state.when === w.value} onClick={() => onChange({ when: w.value })}>
          {w.label}
        </ChoiceChip>
      ))}
      <div className="mx-1 w-0.5 bg-bd" />
      {PRIORITIES.map((p) => (
        <button
          key={p}
          type="button"
          title={PRIORITY_LABEL[p]}
          aria-pressed={state.priority === p}
          onClick={() => onChange({ priority: p })}
          className="flex h-[34px] items-center gap-1 rounded-[10px] border-2 px-2.5 font-display text-[13px] leading-none font-extrabold"
          style={{
            borderColor: state.priority === p ? PRIORITY_COLOR[p] : "var(--bd)",
            background: state.priority === p ? "var(--sf2)" : "var(--sf)",
            color: PRIORITY_COLOR[p],
          }}
        >
          <Icon name="flag" size={18} />
          {PRIORITY_LABEL[p]}
        </button>
      ))}
      <button
        type="button"
        aria-pressed={state.reminder}
        onClick={toggleReminder}
        className={cn(
          "flex h-[34px] items-center gap-1 rounded-[10px] border-2 px-2.5 font-display text-[13px] leading-none font-extrabold",
          state.reminder ? "bg-bs text-bdk" : "border-bd bg-sf text-mut",
        )}
        style={state.reminder ? { borderColor: "var(--b)" } : undefined}
      >
        <Icon name="alarm" size={18} />
        Lembrete
      </button>
      {state.reminder ? (
        <Input
          type="time"
          tone="muted"
          size="md"
          containerClassName="h-[34px] w-[110px] rounded-[10px] px-2"
          value={state.reminderTime}
          onChange={(e) => onChange({ reminderTime: e.target.value })}
          aria-label="Horário do lembrete"
          className="text-[13px]"
        />
      ) : null}
    </div>
  );
}

function reminderAtFrom(dueDate: string | null, today: string, state: TaskChipsState): string | null {
  return state.reminder ? `${dueDate ?? today}T${state.reminderTime}:00-03:00` : null;
}

function QuickCreate() {
  const [draft, setDraft] = useState("");
  const [chips, setChips] = useState<TaskChipsState>(EMPTY_TASK_CHIPS);
  const create = useCreateTask();
  const today = todayISO();
  const patchChips = (p: Partial<TaskChipsState>) => setChips((s) => ({ ...s, ...p }));

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    const dueDate = dueFor(chips.when, today);
    create.mutate(
      { title, dueDate, priority: chips.priority, reminderAt: reminderAtFrom(dueDate, today, chips) },
      { onSuccess: () => setDraft("") },
    );
  };

  return (
    <Card radius="lg" padding="sm" className="flex flex-col gap-3">
      <div className="flex gap-2.5">
        <Input
          tone="muted"
          size="lg"
          containerClassName="flex-1"
          icon={<Icon name="add_task" className="text-mut" />}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nova tarefa… ex.: ligar pro dentista"
          aria-label="Nova tarefa"
          className="text-base"
        />
        <Button size="icon" aria-label="Adicionar tarefa" onClick={add} disabled={create.isPending}>
          <Icon name="arrow_upward" />
        </Button>
      </div>
      <TaskChipsFields state={chips} onChange={patchChips} />
    </Card>
  );
}

function EditTaskDialog({ task, open, onOpenChange }: { task: Task; open: boolean; onOpenChange: (open: boolean) => void }) {
  const today = todayISO();
  const [title, setTitle] = useState(task.title);
  const [chips, setChips] = useState<TaskChipsState>(() => taskToChipsState(task, today));
  const patchChips = (p: Partial<TaskChipsState>) => setChips((s) => ({ ...s, ...p }));
  const update = useUpdateTask(() => onOpenChange(false));

  const save = () => {
    const t = title.trim();
    if (!t) return;
    const dueDate = dueFor(chips.when, today);
    update.mutate({
      id: task.id,
      input: { title: t, dueDate, priority: chips.priority, reminderAt: reminderAtFrom(dueDate, today, chips) },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Editar tarefa">
      <PanelHeader title="Editar tarefa" onClose={() => onOpenChange(false)} />
      <PanelBody>
        <Input
          size="hero"
          tone="raised"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da tarefa"
          aria-label="Nome da tarefa"
          className="font-display text-lg font-extrabold"
        />
        <div>
          <FieldLabel>Quando, prioridade e lembrete</FieldLabel>
          <TaskChipsFields state={chips} onChange={patchChips} />
        </div>
      </PanelBody>
      <PanelFooter>
        <Button size="lg" block disabled={!title.trim() || update.isPending} onClick={save}>
          Salvar
        </Button>
      </PanelFooter>
    </Dialog>
  );
}

/** Tarefas: criar rápido, grupos Hoje/Amanhã/Próximos/Sem data, painel do dia (desktop). */
export function TasksScreen() {
  const tasks = useTasks();
  const toggle = useToggleTask();
  const today = todayISO();
  const list = tasks.data ?? [];
  const groups = WHEN.map((w) => ({ ...w, items: list.filter((t) => groupOf(t, today) === w.value) })).filter((g) => g.items.length);
  const todays = list.filter((t) => groupOf(t, today) === "hoje");
  const doneToday = todays.filter((t) => t.done).length;

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-[18px]">
        <QuickCreate />
        <QueryState
          query={tasks}
          rows={5}
          isEmpty={list.length === 0}
          frame={(node) => (
            <Card radius="lg" padding="lg">
              {node}
            </Card>
          )}
          empty={<EmptyState title="Lista zerada. Que paz!" text="Escreva uma tarefa no campo acima. Cada uma concluída vale 5 XP." />}
        >
          {groups.map((g) => (
            <div key={g.value} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1.5">
                <div className="font-display text-lg leading-[1.2] font-black">{g.label}</div>
                <div className="rounded-lg bg-sf2 px-2 py-[3px] font-display text-xs leading-none font-extrabold text-mut">
                  {g.items.filter((t) => !t.done).length}
                </div>
              </div>
              <Card radius="lg" padding="none" className="overflow-hidden">
                {g.items.map((t, i) => (
                  <TaskRow key={t.id} task={t} first={i === 0} onToggle={toggle} />
                ))}
              </Card>
            </div>
          ))}
        </QueryState>
      </div>

      <div className="hidden flex-col gap-[18px] lg:flex">
        <Card radius="lg" className="flex flex-col items-center gap-3 text-center">
          <ProgressRing value={todays.length ? (doneToday / todays.length) * 100 : 0}>
            <div className="font-display text-[32px] leading-none font-black">
              {doneToday}/{todays.length}
            </div>
            <div className="mt-1 text-xs leading-none font-bold text-mut">hoje</div>
          </ProgressRing>
          <div className="font-display text-lg leading-[1.2] font-black">
            {doneToday === todays.length ? "Dia limpo! Bônus liberado" : `Faltam ${todays.length - doneToday} pra zerar o dia`}
          </div>
          <div className="text-[13px] leading-[1.4] font-semibold text-mut">Cada tarefa concluída vale 5 XP e conta nas missões do dia.</div>
        </Card>
        <Card radius="lg" padding="none" className="flex flex-col gap-2.5 p-[18px]">
          <div className="font-display text-base leading-[1.2] font-black">Prioridades</div>
          {[
            { p: "high" as const, hint: "urgente e importante" },
            { p: "medium" as const, hint: "essa semana" },
            { p: "low" as const, hint: "quando der" },
          ].map(({ p, hint }) => (
            <div key={p} className="flex items-center gap-2.5 text-sm leading-none font-bold">
              <span className="size-3 rounded" style={{ background: PRIORITY_COLOR[p] }} />
              {PRIORITY_LABEL[p]}
              <span className="ml-auto text-mut">{hint}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
