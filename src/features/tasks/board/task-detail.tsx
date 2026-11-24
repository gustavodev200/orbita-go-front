"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog as DialogPrimitive } from "radix-ui";

import { ConfirmDialog } from "@/components/orbita/confirm-dialog";
import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { Objective, Task, TaskStatus } from "@/lib/api/schemas";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/colors";
import { formatDM, formatDMY } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useFocusStore } from "@/features/focus/focus-store";
import { useAppStore } from "@/stores/app-store";
import { useDeleteTask } from "../hooks";
import { BOARD_COLUMNS, columnOf, dueInfo } from "./board-model";

/** Painel lateral (desktop): desliza da direita, Esc/clique fora fecham. */
function SidePanel({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-black/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.aside
                className="fixed inset-y-3 right-3 z-40 flex w-[420px] flex-col overflow-hidden rounded-[28px] bg-bg shadow-[0_20px_60px_rgba(0,0,0,.22)] outline-none"
                initial={{ x: "105%" }}
                animate={{ x: 0 }}
                exit={{ x: "105%" }}
                transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
              >
                <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">Detalhes da tarefa</DialogPrimitive.Description>
                {children}
              </motion.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sf2 text-mut">
        <Icon name={icon} size={20} />
      </span>
      <span className="flex-1 text-sm leading-none text-mut">{label}</span>
      <span className="min-w-0 text-right text-[15px] leading-[1.3] font-medium text-ink">{children}</span>
    </div>
  );
}

function reminderLabel(task: Task): string {
  if (!task.reminderAt) return "Desligado";
  if (task.reminderAt.length < 16) return task.reminderAt;
  return `${formatDM(task.reminderAt.slice(0, 10))} às ${task.reminderAt.slice(11, 16)}`;
}

function DetailBody({
  task,
  today,
  objective,
  onMove,
  onClose,
}: {
  task: Task;
  today: string;
  objective?: Objective;
  onMove: (task: Task, status: TaskStatus) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const del = useDeleteTask();
  const [confirming, setConfirming] = React.useState(false);
  const due = dueInfo(task, today);
  const col = columnOf(task.status);

  const focus = () => {
    const f = useFocusStore.getState();
    f.reset();
    f.start({ taskId: task.id });
    onClose();
    router.push("/foco");
  };
  const edit = () => {
    onClose();
    openQuickAdd({ kind: "task", editing: task });
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-2.5 px-4 pt-5 pb-2 lg:pt-4">
        <span className="flex h-8 items-center gap-1.5 rounded-full bg-sf2 px-3 text-[13px] leading-none font-medium">
          <span aria-hidden className="size-2 rounded-full" style={{ background: col.color }} />
          {col.label}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="flex size-10 items-center justify-center rounded-full bg-sf2 text-ink hover:bg-bd"
        >
          <Icon name="close" size={22} />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-4 pt-2 pb-4">
        <h2 className={cn("m-0 text-[22px] leading-[1.25] font-semibold tracking-[-.01em] break-words", task.done && "text-mut line-through")}>
          {task.title}
        </h2>

        <section aria-label="Coluna">
          <div className="mb-2 text-[13px] leading-none font-medium text-mut">Coluna</div>
          <div role="radiogroup" aria-label="Mover para a coluna" className="grid grid-cols-2 gap-1.5">
            {BOARD_COLUMNS.map((c) => {
              const active = c.status === task.status;
              return (
                <button
                  key={c.status}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onMove(task, c.status)}
                  className={cn(
                    "flex h-11 items-center gap-2 rounded-2xl px-3 text-sm leading-none font-medium transition-colors",
                    active ? "bg-ink text-bg" : "bg-sf2 text-ink hover:bg-bd",
                  )}
                >
                  <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="overflow-hidden rounded-3xl bg-sf shadow-card [&>*+*]:border-t [&>*+*]:border-sf2">
          <InfoRow icon="event" label="Prazo">
            <span className={cn(due?.tone === "late" && "text-r")}>{due ? due.label : "Sem data"}</span>
          </InfoRow>
          <InfoRow icon="flag" label="Prioridade">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full" style={{ background: PRIORITY_COLOR[task.priority] }} />
              {PRIORITY_LABEL[task.priority]}
            </span>
          </InfoRow>
          <InfoRow icon="alarm" label="Lembrete">
            {reminderLabel(task)}
          </InfoRow>
          <InfoRow icon="track_changes" label="Meta">
            {objective ? (
              <Link href="/metas" className="inline-flex max-w-[200px] items-center gap-1.5 text-ink no-underline hover:underline">
                <Icon name={objective.icon} size={16} style={{ color: objective.color }} />
                <span className="truncate">{objective.title}</span>
              </Link>
            ) : (
              <span className="text-mut">Nenhuma</span>
            )}
          </InfoRow>
          {task.doneAt ? (
            <InfoRow icon="task_alt" label="Concluída em">
              {formatDMY(task.doneAt.slice(0, 10))}
            </InfoRow>
          ) : null}
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-[1fr_auto] gap-2 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {task.done ? (
          <Button size="md" variant="secondary" onClick={edit}>
            <Icon name="edit" />
            Editar
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button size="md" onClick={focus}>
              <Icon name="timer" />
              Focar
            </Button>
            <Button size="md" variant="secondary" onClick={edit}>
              <Icon name="edit" />
              Editar
            </Button>
          </div>
        )}
        <Button size="icon" variant="secondary-danger" aria-label="Excluir tarefa" onClick={() => setConfirming(true)}>
          <Icon name="delete" />
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Excluir tarefa?"
        text="Essa ação não pode ser desfeita. O lembrete ligado a ela também será removido."
        confirmLabel="Excluir"
        busy={del.isPending}
        onConfirm={() =>
          del.mutate(task.id, {
            onSuccess: () => {
              setConfirming(false);
              onClose();
            },
          })
        }
      />
    </>
  );
}

/** Detalhes da tarefa: bottom sheet no celular, painel lateral no desktop. */
export function TaskDetail({
  task,
  desktop,
  today,
  objective,
  onMove,
  onClose,
}: {
  task: Task | null;
  desktop: boolean;
  today: string;
  objective?: Objective;
  onMove: (task: Task, status: TaskStatus) => void;
  onClose: () => void;
}) {
  const onOpenChange = (o: boolean) => !o && onClose();
  const body = task ? <DetailBody task={task} today={today} objective={objective} onMove={onMove} onClose={onClose} /> : null;
  if (desktop) {
    return (
      <SidePanel open={!!task} onOpenChange={onOpenChange} title="Detalhes da tarefa">
        {body}
      </SidePanel>
    );
  }
  return (
    <Sheet open={!!task} onOpenChange={onOpenChange} title="Detalhes da tarefa" className="h-auto max-h-[92dvh]">
      {body}
    </Sheet>
  );
}
