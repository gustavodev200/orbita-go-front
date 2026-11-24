"use client";

import { useMemo, useState } from "react";

import { ChartLegend } from "@/components/orbita/charts";
import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { TimelineEvent, YearStats } from "@/lib/api/schemas";
import { MONTHS } from "@/lib/dates";
import { formatBRL, formatNumber, MINUS } from "@/lib/format";
import { KIND_META, groupByYear } from "./catalog";
import { useDeleteLifeEvent, useTimeline } from "./hooks";
import { LifeEventDialog } from "./life-event-dialog";

type Filter = "all" | TimelineEvent["kind"];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "achievement", label: "Conquistas" },
  { value: "objective", label: "Metas" },
  { value: "project", label: "Projetos" },
  { value: "milestone", label: "Marcos" },
  { value: "challenge", label: "Desafios" },
  { value: "savings", label: "Economia" },
];

type Metric = { key: string; label: string; get: (y: YearStats) => number; format: (v: number) => string };

const METRICS: Metric[] = [
  { key: "obj", label: "Metas alcançadas", get: (y) => y.objectivesDone, format: formatNumber },
  { key: "sav", label: "Metas de economia", get: (y) => y.savingsGoalsDone, format: formatNumber },
  { key: "chl", label: "Desafios concluídos", get: (y) => y.challengesDone, format: formatNumber },
  { key: "life", label: "Conquistas e marcos", get: (y) => y.lifeEvents, format: formatNumber },
  { key: "tsk", label: "Tarefas concluídas", get: (y) => y.tasksDone, format: formatNumber },
  { key: "hab", label: "Dias de hábito cumpridos", get: (y) => y.habitChecks, format: formatNumber },
  {
    key: "net",
    label: "Sobrou (entradas − saídas)",
    get: (y) => y.incomeCents - y.expenseCents,
    format: (v) => `${v < 0 ? MINUS : ""}${formatBRL(Math.abs(v), { compact: true })}`,
  },
];

/** Comparação entre dois anos: uma linha por métrica, barras normalizadas por linha (escalas diferentes não dividem eixo). */
function YearComparison({ years }: { years: YearStats[] }) {
  const options = [...years].reverse();
  const [current, setCurrent] = useState(options[0]?.year);
  const cur = years.find((y) => y.year === current) ?? options[0];
  const prev = years.find((y) => y.year === cur.year - 1);
  const series = [
    { name: String(cur.year - 1), color: "var(--mut)" },
    { name: String(cur.year), color: "var(--gd)" },
  ];

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Comparação entre anos</CardTitle>
        {options.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {options.map((y) => (
              <ChoiceChip key={y.year} variant="ink" selected={y.year === cur.year} onClick={() => setCurrent(y.year)}>
                {y.year}
              </ChoiceChip>
            ))}
          </div>
        ) : null}
      </div>
      <ChartLegend series={series} />
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Comparação de {cur.year - 1} com {cur.year}
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Métrica</th>
            <th scope="col">{cur.year - 1}</th>
            <th scope="col">{cur.year}</th>
          </tr>
        </thead>
        <tbody>
          {METRICS.map((m) => {
            const a = prev ? m.get(prev) : 0;
            const b = m.get(cur);
            const max = Math.max(1, Math.abs(a), Math.abs(b));
            const up = b > a;
            const same = a === b;
            return (
              <tr key={m.key} className="border-t border-bd first:border-t-0">
                <th scope="row" className="w-[42%] py-3 pr-3 text-left align-middle text-[13px] leading-[1.3] font-medium">
                  {m.label}
                  {prev && !same ? (
                    <span className={up ? "ml-1.5 text-okd" : "ml-1.5 text-mut"}>
                      <Icon name={up ? "trending_up" : "trending_down"} size={16} className="align-[-3px]" />
                    </span>
                  ) : null}
                </th>
                <td colSpan={2} className="py-3">
                  <div className="flex flex-col gap-1.5">
                    {[
                      { v: a, color: series[0].color, label: series[0].name, missing: !prev },
                      { v: b, color: series[1].color, label: series[1].name, missing: false },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2">
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-sf2">
                          <div className="h-full rounded-full" style={{ width: `${(Math.max(0, row.v) / max) * 100}%`, background: row.color }} />
                        </div>
                        <span className="num w-[92px] shrink-0 text-right text-[13px] leading-none">
                          <span className="sr-only">{row.label}: </span>
                          {row.missing ? "—" : m.format(row.v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function EventRow({ e, onEdit }: { e: TimelineEvent; onEdit: () => void }) {
  const del = useDeleteLifeEvent();
  const meta = KIND_META[e.kind];
  const [, m, d] = e.date.split("-");
  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      <span aria-hidden className="absolute top-11 bottom-0 left-[21px] w-0.5 bg-bd" />
      <span className="relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-full" style={{ background: meta.soft, color: meta.color }}>
        <Icon name={e.icon} size={22} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs leading-none text-mut">
              {Number(d)} de {MONTHS[Number(m) - 1].toLowerCase()} · {meta.label}
            </div>
            <div className="mt-1.5 text-[15px] leading-[1.3] font-semibold">{e.title}</div>
            {e.description ? <div className="mt-1 text-[13px] leading-[1.45] text-mut">{e.description}</div> : null}
          </div>
          {e.manual ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Opções de ${e.title}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 data-[state=open]:bg-sf2"
              >
                <Icon name="more_horiz" size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="left" align="start">
                <DropdownMenuItem tone="info" onSelect={onEdit}>
                  <Icon name="edit" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem tone="danger" disabled={del.isPending} onSelect={() => del.mutate(e.id)}>
                  <Icon name="delete" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/** Linha do tempo: conquistas, metas alcançadas, projetos, marcos e comparação entre anos. */
export function TimelineScreen() {
  const timeline = useTimeline();
  const [filter, setFilter] = useState<Filter>("all");
  const [dialog, setDialog] = useState<{ open: boolean; event?: TimelineEvent }>({ open: false });
  const events = useMemo(() => timeline.data?.events ?? [], [timeline.data]);
  const shown = filter === "all" ? events : events.filter((e) => e.kind === filter);
  const groups = groupByYear(shown);
  const years = timeline.data?.years ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm text-mut">Sua trajetória: o que você conquistou e construiu ao longo dos anos.</p>
        <Button size="sm" onClick={() => setDialog({ open: true })}>
          <Icon name="add" size={18} />
          Novo marco
        </Button>
      </div>
      <QueryState query={timeline} rows={4} isEmpty={false} empty={null} frame={(node) => <Card>{node}</Card>}>
        {years.length ? <YearComparison years={years} /> : null}
        <Card className="flex flex-col gap-4">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:flex-wrap">
            {FILTERS.map((f) => (
              <ChoiceChip key={f.value} variant="ink" selected={filter === f.value} onClick={() => setFilter(f.value)} className="shrink-0">
                {f.label}
              </ChoiceChip>
            ))}
          </div>
          {groups.length ? (
            groups.map(([year, list]) => (
              <section key={year} className="flex flex-col gap-3">
                <div className="flex items-baseline gap-2">
                  <h2 className="m-0 text-xl leading-none font-semibold tracking-[-.02em]">{year}</h2>
                  <span className="text-[13px] text-mut">
                    {list.length} {list.length === 1 ? "momento" : "momentos"}
                  </span>
                </div>
                <ol className="m-0 list-none p-0 [&>li:last-child>span:first-child]:hidden">
                  {list.map((e) => (
                    <EventRow key={`${e.kind}-${e.id}`} e={e} onEdit={() => setDialog({ open: true, event: e })} />
                  ))}
                </ol>
              </section>
            ))
          ) : (
            <EmptyState
              compact
              icon="timeline"
              title={filter === "all" ? "Sua linha do tempo começa aqui" : "Nada desse tipo ainda"}
              text="Metas alcançadas, desafios e metas de economia concluídos entram sozinhos. Registre também conquistas, projetos e marcos da vida."
              ctaLabel="Novo marco"
              onCta={() => setDialog({ open: true })}
            />
          )}
        </Card>
      </QueryState>
      {dialog.open ? (
        <LifeEventDialog key={dialog.event?.id ?? "new"} open onOpenChange={(o) => !o && setDialog({ open: false })} event={dialog.event} />
      ) : null}
    </div>
  );
}
