"use client";

import Link from "next/link";

import { EmptyState, QueryState } from "@/components/orbita/states";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskRow, groupOf } from "@/features/tasks/tasks-screen";
import { useTasks, useToggleTask } from "@/features/tasks/hooks";
import { todayISO } from "@/lib/dates";
import { useAppStore } from "@/stores/app-store";

/** Tarefas de hoje (inclui atrasadas pendentes) + progresso do dia. */
export function TodayTasksCard({ className }: { className?: string }) {
  const tasks = useTasks();
  const toggle = useToggleTask();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const today = todayISO();
  const all = tasks.data ?? [];
  const list = all.filter((t) => {
    const g = groupOf(t, today);
    return g === "atrasadas" || g === "hoje";
  });
  const visible = [...list.filter((t) => !t.done), ...list.filter((t) => t.done)].slice(0, 6);
  const done = list.filter((t) => t.done).length;

  return (
    <Card className={className} padding="none">
      <div className="flex flex-col gap-3 px-5 pt-5">
        <CardHeader>
          <CardTitle>Tarefas de hoje</CardTitle>
          <Link href="/tarefas" className="text-sm leading-none text-g no-underline hover:text-gd">
            Ver todas
          </Link>
        </CardHeader>
        {list.length ? (
          <div className="flex items-center gap-3">
            <Progress value={(done / list.length) * 100} size="sm" className="flex-1" />
            <span className="num text-xs leading-none text-mut">
              {done}/{list.length}
            </span>
          </div>
        ) : null}
      </div>
      <QueryState
        query={tasks}
        compact
        isEmpty={list.length === 0}
        frame={(node) => <div className="px-5 pb-5">{node}</div>}
        empty={
          <EmptyState
            compact
            icon="task_alt"
            title="Nada pra hoje"
            text="Que tal planejar o dia?"
            ctaLabel="Nova tarefa"
            onCta={() => openQuickAdd({ kind: "task", date: today })}
          />
        }
      >
        <div className="flex flex-col [&>*+*]:border-t [&>*+*]:border-sf2 px-1 pb-2">
          {visible.map((t) => (
            <TaskRow key={t.id} task={t} group={groupOf(t, today)} onToggle={toggle} />
          ))}
        </div>
      </QueryState>
    </Card>
  );
}
