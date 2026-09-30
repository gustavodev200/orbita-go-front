"use client";

import Link from "next/link";

import { Checkbox3D } from "@/components/orbita/checkbox-3d";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_COLOR } from "@/lib/colors";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useTasks, useToggleTask } from "@/features/tasks/hooks";
import { useRouter } from "next/navigation";

/** 3 tarefas de hoje + "Ver todas". */
export function TodayTasksCard({ className }: { className?: string }) {
  const router = useRouter();
  const tasks = useTasks();
  const toggle = useToggleTask();
  const today = todayISO();
  const list = (tasks.data ?? []).filter((t) => t.dueDate && t.dueDate.slice(0, 10) <= today).slice(0, 3);

  return (
    <Card className={className}>
      <div className="flex flex-col gap-2.5">
        <CardHeader>
          <CardTitle>Tarefas de hoje</CardTitle>
          <Button asChild variant="link">
            <Link href="/tarefas">Ver todas</Link>
          </Button>
        </CardHeader>
        <QueryState
          query={tasks}
          compact
          isEmpty={list.length === 0}
          empty={
            <EmptyState
              compact
              title="Dia livre!"
              text="Nenhuma tarefa pra hoje. Que tal planejar amanhã?"
              ctaLabel="Criar tarefa"
              onCta={() => router.push("/tarefas")}
            />
          }
        >
          {list.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2">
              <Checkbox3D size={30} checked={t.done} onCheckedChange={() => toggle(t)} label={`Concluir ${t.title}`} />
              <button
                type="button"
                onClick={() => toggle(t)}
                className={cn(
                  "flex-1 bg-transparent text-left text-[15px] leading-[1.3] font-bold text-ink",
                  t.done && "line-through opacity-50",
                )}
              >
                {t.title}
              </button>
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: PRIORITY_COLOR[t.priority] }} />
            </div>
          ))}
        </QueryState>
      </div>
    </Card>
  );
}
