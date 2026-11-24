"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CheckCircle } from "@/components/orbita/check-circle";
import { ConfirmDialog } from "@/components/orbita/confirm-dialog";
import { Icon } from "@/components/orbita/icon";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Objective } from "@/lib/api/schemas";
import { formatDM } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { createTask } from "@/features/tasks/api";
import { useTasks, useToggleTask } from "@/features/tasks/hooks";
import { useHabits } from "@/features/habits/hooks";
import { habitRate } from "@/features/habits/consistency";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { taskKeys } from "@/features/tasks/api";
import { linkTask, objectiveKeys } from "./api";
import { deadlineLabel, horizonLabel, objectiveProgress } from "./catalog";
import { useCompleteObjective, useDeleteObjective, useLinkActions, useMilestoneActions } from "./hooks";

const PICK = "__pick";

function SectionTitle({ icon, children, count }: { icon: string; children: React.ReactNode; count?: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Icon name={icon} size={20} className="text-mut" />
      <div className="flex-1 text-[15px] leading-none font-semibold">{children}</div>
      {count ? <span className="num text-[13px] leading-none text-mut">{count}</span> : null}
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-mut opacity-70 hover:bg-sf2 hover:text-ink hover:opacity-100"
    >
      <Icon name="close" size={18} />
    </button>
  );
}

/** Detalhe da meta: progresso, etapas, tarefas e hábitos vinculados; concluir/editar/excluir. */
export function ObjectiveDetail({
  objective: o,
  onOpenChange,
  onEdit,
}: {
  objective: Objective;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  const qc = useQueryClient();
  const tasks = useTasks();
  const habits = useHabits();
  const toggleTask = useToggleTask();
  const milestones = useMilestoneActions();
  const links = useLinkActions();
  const complete = useCompleteObjective();
  const del = useDeleteObjective();
  const [step, setStep] = useState("");
  const [newTask, setNewTask] = useState("");
  const [confirming, setConfirming] = useState(false);

  const createLinkedTask = useApiMutation({
    mutationFn: async (title: string) => {
      const t = await createTask({ title, priority: "medium", dueDate: null });
      return linkTask(o.id, t.id, true);
    },
    invalidate: [taskKeys.all],
    onSuccess: (updated) => {
      qc.setQueryData<Objective[]>(objectiveKeys.all, (old) => old?.map((x) => (x.id === updated.id ? updated : x)));
      setNewTask("");
    },
  });

  const allTasks = tasks.data ?? [];
  const linkableTasks = allTasks.filter((t) => !t.done && !o.tasks.some((x) => x.id === t.id));
  const linkableHabits = (habits.data ?? []).filter((h) => !o.habits.some((x) => x.id === h.id));
  const doneSteps = o.milestones.filter((m) => m.done).length;
  const doneTasks = o.tasks.filter((t) => t.done).length;
  const progress = objectiveProgress(o);
  const all100 = progress === 100 && !o.completed;

  const addStep = () => {
    const t = step.trim();
    if (!t) return;
    milestones.add.mutate({ id: o.id, title: t }, { onSuccess: () => setStep("") });
  };

  return (
    <>
      <Dialog open onOpenChange={onOpenChange} title={o.title}>
        <PanelHeader title="Meta" onClose={() => onOpenChange(false)} />
        <PanelBody className="gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-white" style={{ background: o.color }}>
              <Icon name={o.icon} size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg leading-[1.25] font-semibold">{o.title}</div>
              <div className="mt-1.5 text-[13px] leading-[1.4] text-mut">
                {horizonLabel(o.horizon)}
                {o.deadline ? ` · ${deadlineLabel(o.deadline)}` : ""}
              </div>
            </div>
          </div>

          {o.expectedResult || o.why ? (
            <div className="flex flex-col gap-3 rounded-2xl bg-sf2 px-4 py-3.5">
              {o.expectedResult ? (
                <div>
                  <FieldLabel className="mb-1.5">Resultado esperado</FieldLabel>
                  <div className="text-[15px] leading-[1.4]">{o.expectedResult}</div>
                </div>
              ) : null}
              {o.why ? (
                <div>
                  <FieldLabel className="mb-1.5">Por que importa</FieldLabel>
                  <div className="text-sm leading-[1.45] text-mut">{o.why}</div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-mut">{o.completed ? "Meta concluída" : "Conclusão"}</span>
              <span className="num text-xl leading-none font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} color={o.color} size="md" aria-label={`${progress}% concluído`} />
            {all100 ? (
              <div className="text-[13px] leading-[1.4] text-mut">Tudo feito por aqui. Marque a meta como alcançada para ela entrar na sua linha do tempo.</div>
            ) : null}
          </div>

          <SectionTitle icon="checklist" count={o.milestones.length ? `${doneSteps}/${o.milestones.length}` : undefined}>
            Etapas
          </SectionTitle>
          <div className="flex flex-col gap-1">
            {o.milestones.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl py-1 pl-1">
                <CheckCircle
                  checked={m.done}
                  onCheckedChange={(done) => milestones.toggle.mutate({ id: o.id, milestoneId: m.id, done })}
                  label={m.title}
                />
                <span className={cn("min-w-0 flex-1 text-[15px] leading-[1.3]", m.done && "text-mut line-through")}>{m.title}</span>
                <RemoveButton label={`Remover etapa ${m.title}`} onClick={() => milestones.remove.mutate({ id: o.id, milestoneId: m.id })} />
              </div>
            ))}
            <form
              className="mt-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addStep();
              }}
            >
              <Input
                tone="raised"
                containerClassName="flex-1"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                placeholder="Nova etapa"
                aria-label="Nova etapa"
                maxLength={120}
              />
              <Button type="submit" variant="secondary" disabled={!step.trim() || milestones.add.isPending} aria-label="Adicionar etapa">
                <Icon name="add" size={20} />
              </Button>
            </form>
          </div>

          <SectionTitle icon="task_alt" count={o.tasks.length ? `${doneTasks}/${o.tasks.length}` : undefined}>
            Tarefas vinculadas
          </SectionTitle>
          <div className="flex flex-col gap-1">
            {o.tasks.map((t) => {
              const full = allTasks.find((x) => x.id === t.id);
              const done = full?.done ?? t.done;
              return (
                <div key={t.id} className="flex items-center gap-3 py-1 pl-1">
                  <CheckCircle
                    checked={done}
                    disabled={!full}
                    onCheckedChange={() => {
                      if (!full) return;
                      toggleTask(full);
                      qc.setQueryData<Objective[]>(objectiveKeys.all, (old) =>
                        old?.map((x) => (x.id === o.id ? { ...x, tasks: x.tasks.map((y) => (y.id === t.id ? { ...y, done: !done } : y)) } : x)),
                      );
                    }}
                    label={t.title}
                  />
                  <span className={cn("min-w-0 flex-1 text-[15px] leading-[1.3]", done && "text-mut line-through")}>
                    {t.title}
                    {t.dueDate ? <span className="ml-1.5 text-xs text-mut">{formatDM(t.dueDate)}</span> : null}
                  </span>
                  <RemoveButton label={`Desvincular ${t.title}`} onClick={() => links.task.mutate({ id: o.id, taskId: t.id, linked: false })} />
                </div>
              );
            })}
            <form
              className="mt-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newTask.trim()) createLinkedTask.mutate(newTask.trim());
              }}
            >
              <Input
                tone="raised"
                containerClassName="flex-1"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Nova tarefa para esta meta"
                aria-label="Nova tarefa para esta meta"
                maxLength={140}
              />
              <Button type="submit" variant="secondary" disabled={!newTask.trim() || createLinkedTask.isPending} aria-label="Criar tarefa">
                <Icon name="add" size={20} />
              </Button>
            </form>
            {linkableTasks.length ? (
              <Select value={PICK} onValueChange={(taskId) => taskId !== PICK && links.task.mutate({ id: o.id, taskId, linked: true })}>
                <SelectTrigger icon="link" aria-label="Vincular tarefa existente" className="mt-1 w-full justify-start">
                  <SelectValue>Vincular tarefa existente</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PICK} disabled>
                    Escolha uma tarefa
                  </SelectItem>
                  {linkableTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          <SectionTitle icon="self_improvement">Hábitos que sustentam a meta</SectionTitle>
          <div className="flex flex-col gap-2">
            {o.habits.map((h) => {
              const full = habits.data?.find((x) => x.id === h.id);
              const rate = full ? habitRate(full) : null;
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full text-white" style={{ background: h.color }}>
                    <Icon name={h.icon} size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] leading-none font-medium">{h.name}</div>
                    <div className="mt-1 text-xs leading-none text-mut">
                      {rate === null ? "Sem dados ainda" : `${rate}% nos últimos 30 dias`}
                      {full?.streak ? ` · ${full.streak} seguidos` : ""}
                    </div>
                  </div>
                  <RemoveButton label={`Desvincular ${h.name}`} onClick={() => links.habit.mutate({ id: o.id, habitId: h.id, linked: false })} />
                </div>
              );
            })}
            {linkableHabits.length ? (
              <Select value={PICK} onValueChange={(habitId) => habitId !== PICK && links.habit.mutate({ id: o.id, habitId, linked: true })}>
                <SelectTrigger icon="link" aria-label="Vincular hábito" className="w-full justify-start">
                  <SelectValue>Vincular hábito</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PICK} disabled>
                    Escolha um hábito
                  </SelectItem>
                  {linkableHabits.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : o.habits.length === 0 ? (
              <div className="text-[13px] leading-[1.4] text-mut">Crie hábitos em Hábitos e vincule aqui (ex.: estudar inglês 20 min por dia).</div>
            ) : null}
          </div>
        </PanelBody>
        <PanelFooter className="flex flex-wrap gap-2">
          <Button
            size="lg"
            className="flex-1"
            variant={o.completed ? "secondary" : "primary"}
            disabled={complete.isPending}
            onClick={() => complete.mutate({ id: o.id, completed: !o.completed })}
          >
            <Icon name={o.completed ? "undo" : "flag"} size={20} />
            {o.completed ? "Reabrir meta" : "Marcar como alcançada"}
          </Button>
          <Button size="lg" variant="secondary" onClick={onEdit} aria-label="Editar meta">
            <Icon name="edit" size={20} />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setConfirming(true)} aria-label="Excluir meta">
            <Icon name="delete" size={20} />
          </Button>
        </PanelFooter>
      </Dialog>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Excluir meta?"
        text="As etapas somem junto. Tarefas e hábitos vinculados continuam existindo, só perdem o vínculo."
        confirmLabel="Excluir"
        busy={del.isPending}
        onConfirm={() =>
          del.mutate(o.id, {
            onSuccess: () => {
              setConfirming(false);
              onOpenChange(false);
            },
          })
        }
      />
    </>
  );
}
