"use client";

import { useState } from "react";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEnsurePush } from "@/features/push/use-push-status";
import type { Priority, Task } from "@/lib/api/schemas";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/colors";
import { addDaysISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useCreateTask, useUpdateTask } from "./hooks";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

/** `reminderAt` no formato do contrato (fuso de negócio fixo -03:00). */
export function reminderAtFrom(dueDate: string | null, today: string, enabled: boolean, time: string): string | null {
  return enabled ? `${dueDate ?? today}T${time}:00-03:00` : null;
}

/** Criar/editar tarefa: título, data (atalhos + calendário), prioridade e lembrete. */
export function TaskDialog({
  open,
  onOpenChange,
  task,
  initialDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  initialDate?: string | null;
}) {
  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);
  const [title, setTitle] = useState(task?.title ?? "");
  const [dueDate, setDueDate] = useState<string | null>(task ? (task.dueDate?.slice(0, 10) ?? null) : (initialDate ?? today));
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [reminder, setReminder] = useState(!!task?.reminderAt);
  const [time, setTime] = useState(task?.reminderAt && task.reminderAt.length >= 16 ? task.reminderAt.slice(11, 16) : "09:00");
  const ensurePush = useEnsurePush();
  const done = () => {
    onOpenChange(false);
    if (reminder) void ensurePush();
  };
  const create = useCreateTask(done);
  const update = useUpdateTask(done);
  const saving = create.isPending || update.isPending;
  const label = task ? "Editar tarefa" : "Nova tarefa";

  const save = () => {
    const t = title.trim();
    if (!t) return;
    const input = { title: t, dueDate, priority, reminderAt: reminderAtFrom(dueDate, today, reminder, time) };
    if (task) update.mutate({ id: task.id, input });
    else create.mutate(input);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={label}>
      <PanelHeader title={label} onClose={() => onOpenChange(false)} />
      <PanelBody className="gap-4">
        <Input
          size="hero"
          tone="raised"
          autoFocus={!task}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="O que precisa fazer?"
          aria-label="Nome da tarefa"
          className="text-base font-medium"
        />
        <div>
          <FieldLabel>Quando</FieldLabel>
          <div className="flex flex-wrap items-center gap-1.5">
            <ChoiceChip size="sm13" selected={dueDate === today} onClick={() => setDueDate(today)}>
              Hoje
            </ChoiceChip>
            <ChoiceChip size="sm13" selected={dueDate === tomorrow} onClick={() => setDueDate(tomorrow)}>
              Amanhã
            </ChoiceChip>
            <ChoiceChip size="sm13" selected={dueDate === null} onClick={() => setDueDate(null)}>
              Sem data
            </ChoiceChip>
            <Input
              type="date"
              tone="muted"
              size="md"
              containerClassName={cn("h-10 w-[150px] px-3", dueDate && dueDate !== today && dueDate !== tomorrow && "ring-2 ring-[color:var(--g)]")}
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value || null)}
              aria-label="Escolher data"
              className="text-[13px]"
            />
          </div>
        </div>
        <div>
          <FieldLabel>Prioridade</FieldLabel>
          <div className="flex gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={priority === p}
                onClick={() => setPriority(p)}
                className={cn(
                  "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] leading-none font-medium transition-colors",
                  priority === p ? "bg-ink text-bg" : "bg-sf2 text-mut hover:text-ink",
                )}
              >
                <span className="size-2 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-sf2 px-4 py-3">
          <Icon name="alarm" size={22} className="text-g" />
          <div className="flex-1">
            <div className="text-[15px] leading-none font-medium">Lembrar</div>
            <div className="mt-1 text-xs leading-none text-mut">Notificação no dia da tarefa</div>
          </div>
          {reminder ? (
            <input
              type="time"
              value={time}
              onChange={(e) => e.target.value && setTime(e.target.value)}
              aria-label="Horário do lembrete"
              className="num h-9 rounded-full bg-sf px-3 text-sm text-ink outline-none"
            />
          ) : null}
          <Switch checked={reminder} onCheckedChange={setReminder} aria-label="Lembrar" />
        </div>
      </PanelBody>
      <PanelFooter>
        <Button size="lg" block disabled={!title.trim() || saving} onClick={save}>
          {task ? "Salvar" : "Criar tarefa"}
        </Button>
      </PanelFooter>
    </Dialog>
  );
}
