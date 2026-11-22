"use client";

import { CheckCircle } from "@/components/orbita/check-circle";
import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { usePayRecurring } from "@/features/finance/hooks";
import { useToggleTask } from "@/features/tasks/hooks";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { AGENDA_COLOR, AGENDA_LABEL, type AgendaItem } from "./agenda-items";

const ICON = { reminder: "notifications", task: "task_alt", bill: "receipt_long" } as const;

/** Uma linha da agenda: horário · título · tipo · ação rápida (concluir / paguei). */
export function AgendaItemRow({ item }: { item: AgendaItem }) {
  const toggle = useToggleTask();
  const pay = usePayRecurring();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const color = AGENDA_COLOR[item.kind];
  const paid = item.done || pay.isSuccess;

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-11 shrink-0 text-right">
        <div className="num text-[13px] leading-none font-medium text-ink">{item.time ?? "—"}</div>
      </div>
      <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: color }} />
      <button
        type="button"
        disabled={item.kind !== "task"}
        onClick={() => item.task && openQuickAdd({ kind: "task", editing: item.task })}
        className="min-w-0 flex-1 bg-transparent p-0 text-left disabled:cursor-default"
      >
        <div className={cn("truncate text-[15px] leading-[1.25] font-medium", item.done ? "text-mut line-through" : "text-ink")}>
          {item.title}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs leading-none text-mut">
          <Icon name={ICON[item.kind]} size={14} />
          {AGENDA_LABEL[item.kind]}
          {item.recurring ? ` · ${formatBRL(item.recurring.amountCents)}` : ""}
        </div>
      </button>
      {item.task ? (
        <CheckCircle checked={item.task.done} label={`Concluir ${item.title}`} onCheckedChange={() => toggle(item.task!)} />
      ) : null}
      {item.recurring && item.recurring.type === "expense" ? (
        paid ? (
          <span className="flex h-8 items-center gap-1 rounded-full bg-oks px-3 text-xs leading-none font-medium text-okd">
            <Icon name="check" size={16} />
            Pago
          </span>
        ) : (
          <Button
            size="xs"
            variant="secondary"
            disabled={pay.isPending}
            onClick={() => pay.mutate({ id: item.recurring!.id, month: item.date.slice(0, 7), name: item.title })}
          >
            Paguei
          </Button>
        )
      ) : null}
    </div>
  );
}
