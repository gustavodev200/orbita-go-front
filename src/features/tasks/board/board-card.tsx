"use client";

import { CheckCircle } from "@/components/orbita/check-circle";
import { Icon } from "@/components/orbita/icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Objective, Task, TaskStatus } from "@/lib/api/schemas";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { BOARD_COLUMNS, dueInfo } from "./board-model";

const DUE_TONE = {
  late: "bg-rs text-rd",
  today: "bg-gs text-gd",
  soon: "bg-sf2 text-ink",
  normal: "bg-sf2 text-mut",
} as const;

export type CardActions = {
  open: (task: Task) => void;
  move: (task: Task, status: TaskStatus) => void;
  toggle: (task: Task) => void;
};

/** Menu do card: "Mover para" as outras colunas + abrir detalhes (alternativa ao arrastar). */
function CardMenu({ task, actions }: { task: Task; actions: CardActions }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Mover ${task.title}`}
        onPointerDown={(e) => e.stopPropagation()}
        className="-mt-1 -mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 hover:text-ink data-[state=open]:bg-sf2 data-[state=open]:text-ink"
      >
        <Icon name="more_horiz" size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 flex-col gap-1">
        <div className="px-2 pt-1 pb-1.5 text-xs leading-none font-medium text-mut">Mover para</div>
        {BOARD_COLUMNS.filter((c) => c.status !== task.status).map((c) => (
          <DropdownMenuItem key={c.status} onSelect={() => actions.move(task, c.status)}>
            <span aria-hidden className="mr-1 size-2 rounded-full" style={{ background: c.color }} />
            {c.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem tone="info" onSelect={() => actions.open(task)}>
          <Icon name="open_in_full" />
          Detalhes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Card resumido: concluir, título (até 3 linhas), menu de mover e uma linha de
 * selos — prioridade, prazo, lembrete e meta vinculada.
 */
export function BoardCard({
  task,
  today,
  objective,
  actions,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  today: string;
  objective?: Objective;
  actions: CardActions;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
}) {
  const due = dueInfo(task, today);
  return (
    <article
      data-card={task.id}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task)}
      onDragEnd={onDragEnd}
      aria-label={task.title}
      className={cn(
        "group relative rounded-2xl bg-sf p-3 shadow-card transition-[opacity,box-shadow,transform] duration-150",
        draggable && "cursor-grab hover:shadow-[0_6px_18px_rgba(0,0,0,.08)] active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2.5">
        <CheckCircle
          size={22}
          checked={task.done}
          label={task.done ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
          onCheckedChange={() => actions.toggle(task)}
          className="mt-px"
        />
        <button
          type="button"
          onClick={() => actions.open(task)}
          className="min-w-0 flex-1 bg-transparent p-0 text-left outline-none"
        >
          <span
            className={cn(
              "line-clamp-3 text-[15px] leading-[1.3] font-medium break-words",
              task.done ? "text-mut line-through" : "text-ink",
            )}
          >
            {task.title}
          </span>
        </button>
        <CardMenu task={task} actions={actions} />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-[32px]">
        <span
          title={`Prioridade ${PRIORITY_LABEL[task.priority].toLowerCase()}`}
          className="flex h-6 items-center gap-1.5 rounded-full bg-sf2 px-2 text-xs leading-none text-mut"
        >
          <span aria-hidden className="size-1.5 rounded-full" style={{ background: PRIORITY_COLOR[task.priority] }} />
          {PRIORITY_LABEL[task.priority]}
        </span>
        {due ? (
          <span className={cn("flex h-6 items-center gap-1 rounded-full px-2 text-xs leading-none font-medium", DUE_TONE[due.tone])}>
            <Icon name="event" size={14} />
            {due.label}
          </span>
        ) : null}
        {task.reminderAt && !task.done ? (
          <span title="Com lembrete" className="flex size-6 items-center justify-center rounded-full bg-sf2 text-mut">
            <Icon name="alarm" size={14} />
            <span className="sr-only">Com lembrete</span>
          </span>
        ) : null}
        {objective ? (
          <span className="flex h-6 max-w-[160px] items-center gap-1 rounded-full bg-sf2 px-2 text-xs leading-none text-mut">
            <Icon name={objective.icon} size={14} style={{ color: objective.color }} />
            <span className="truncate">{objective.title}</span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
