"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Objective, ObjectiveHorizon } from "@/lib/api/schemas";
import { HORIZONS, deadlineLabel, horizonLabel, objectiveProgress } from "./catalog";
import { useObjectives } from "./hooks";
import { ObjectiveDetail } from "./objective-detail";
import { ObjectiveDialog } from "./objective-dialog";

type Filter = "all" | ObjectiveHorizon | "done";

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

function ObjectiveCard({ o, onOpen }: { o: Objective; onOpen: () => void }) {
  const progress = objectiveProgress(o);
  const parts = [
    o.milestones.length ? `${o.milestones.filter((m) => m.done).length}/${o.milestones.length} etapas` : null,
    o.tasks.length ? plural(o.tasks.length, "tarefa", "tarefas") : null,
    o.habits.length ? plural(o.habits.length, "hábito", "hábitos") : null,
  ].filter(Boolean);
  return (
    <Card className="flex cursor-pointer flex-col gap-4 transition-transform hover:-translate-y-0.5" onClick={onOpen}>
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: o.color }}>
          <Icon name={o.completed ? "check" : o.icon} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="block w-full truncate text-left text-[15px] leading-[1.25] font-semibold">
            {o.title}
          </button>
          <div className="mt-1.5 text-xs leading-[1.35] text-mut">
            {o.completed ? "Alcançada" : horizonLabel(o.horizon)}
            {!o.completed && o.deadline ? ` · ${deadlineLabel(o.deadline)}` : ""}
          </div>
        </div>
        <span className="num text-lg leading-none font-semibold">{progress}%</span>
      </div>
      {o.expectedResult ? (
        <div className="flex items-start gap-2 rounded-2xl bg-sf2 px-3 py-2.5 text-[13px] leading-[1.4]">
          <Icon name="target" size={18} className="mt-px shrink-0 text-mut" />
          <span>{o.expectedResult}</span>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <Progress value={progress} color={o.color} size="sm" aria-label={`${progress}% concluído`} />
        <div className="text-xs leading-none text-mut">{parts.length ? parts.join(" · ") : "Divida em etapas para acompanhar o progresso"}</div>
      </div>
    </Card>
  );
}

/** Metas (Goals & OKRs): horizonte, prazo, resultado esperado, etapas e vínculos com tarefas/hábitos. */
export function ObjectivesScreen() {
  const objectives = useObjectives();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<{ open: boolean; editing?: Objective }>({ open: false });

  // "+ Meta" no menu rápido chega com ?nova=1 (abre o formulário; fechar limpa a URL).
  const fromUrl = params.get("nova") === "1";
  const formOpen = form.open || fromUrl;
  const closeForm = () => {
    setForm({ open: false });
    if (fromUrl) router.replace(pathname, { scroll: false });
  };

  const list = objectives.data ?? [];
  const active = list.filter((o) => !o.completed);
  const shown =
    filter === "all" ? active : filter === "done" ? list.filter((o) => o.completed) : active.filter((o) => o.horizon === filter);
  const opened = list.find((o) => o.id === openId);

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "Em andamento", count: active.length },
    ...HORIZONS.map((h) => ({ value: h.value as Filter, label: h.label, count: active.filter((o) => o.horizon === h.value).length })),
    { value: "done", label: "Alcançadas", count: list.length - active.length },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm text-mut">Transforme objetivos grandes em pequenas entregas.</p>
        <Button size="sm" onClick={() => setForm({ open: true })}>
          <Icon name="add" size={18} />
          Nova meta
        </Button>
      </div>
      <QueryState
        query={objectives}
        rows={3}
        isEmpty={list.length === 0}
        frame={(node) => <Card>{node}</Card>}
        empty={
          <EmptyState
            icon="flag"
            title="Nenhuma meta ainda"
            text="Ex.: alcançar inglês B1 em 6 meses. Defina o prazo, o resultado esperado e divida em etapas."
            ctaLabel="Criar meta"
            onCta={() => setForm({ open: true })}
          />
        }
      >
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          {filters.map((f) => (
            <ChoiceChip key={f.value} variant="ink" selected={filter === f.value} onClick={() => setFilter(f.value)} className="shrink-0">
              {f.label}
              <span className="num opacity-60">{f.count}</span>
            </ChoiceChip>
          ))}
        </div>
        {shown.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {shown.map((o) => (
              <ObjectiveCard key={o.id} o={o} onOpen={() => setOpenId(o.id)} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              compact
              icon={filter === "done" ? "emoji_events" : "flag"}
              title={filter === "done" ? "Nenhuma meta alcançada ainda" : "Nada por aqui"}
              text={filter === "done" ? "Quando concluir uma meta, ela aparece aqui e na sua linha do tempo." : "Nenhuma meta em andamento com esse horizonte."}
            />
          </Card>
        )}
      </QueryState>
      {opened ? (
        <ObjectiveDetail
          objective={opened}
          onOpenChange={(o) => !o && setOpenId(null)}
          onEdit={() => {
            setForm({ open: true, editing: opened });
            setOpenId(null);
          }}
        />
      ) : null}
      {formOpen ? (
        <ObjectiveDialog
          key={form.editing?.id ?? "new"}
          open
          onOpenChange={(o) => !o && closeForm()}
          objective={form.editing}
        />
      ) : null}
    </div>
  );
}
