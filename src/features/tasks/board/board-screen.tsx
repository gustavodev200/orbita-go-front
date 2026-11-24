"use client";

import * as React from "react";
import { toast } from "sonner";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Objective, Priority, Task, TaskStatus } from "@/lib/api/schemas";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/colors";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useMusicStore } from "@/features/focus/music-store";
import { useObjectives } from "@/features/objectives/hooks";
import { useAppStore } from "@/stores/app-store";
import { useCreateTask, useMoveTask, useTasks, useToggleTask } from "../hooks";
import { TaskViewSwitch } from "../view-switch";
import { BoardCard, type CardActions } from "./board-card";
import {
  BOARD_COLUMNS,
  NO_FILTERS,
  STATUS_LABEL,
  dropPosition,
  groupByStatus,
  isFiltering,
  matchesFilters,
  type BoardColumn,
  type BoardFilters,
  type DueFilter,
} from "./board-model";
import { TaskDetail } from "./task-detail";

/** "Feito" cresce sem parar — mostra as mais recentes e expande sob demanda. */
const DONE_PREVIEW = 12;

const DUE_FILTERS: { value: DueFilter; label: string }[] = [
  { value: "all", label: "Qualquer prazo" },
  { value: "overdue", label: "Atrasadas" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Próximos 7 dias" },
  { value: "none", label: "Sem data" },
];
const PRIORITIES: Priority[] = ["high", "medium", "low"];

/* ───────────────────────── filtros ───────────────────────── */

function FilterChips({ filters, onChange }: { filters: BoardFilters; onChange: (f: BoardFilters) => void }) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
      <ChoiceChip variant="ink" size="xs" selected={filters.priority === "all"} onClick={() => onChange({ ...filters, priority: "all" })}>
        Todas
      </ChoiceChip>
      {PRIORITIES.map((p) => (
        <ChoiceChip
          key={p}
          variant="ink"
          size="xs"
          selected={filters.priority === p}
          onClick={() => onChange({ ...filters, priority: filters.priority === p ? "all" : p })}
        >
          <span aria-hidden className="size-1.5 rounded-full" style={{ background: PRIORITY_COLOR[p] }} />
          {PRIORITY_LABEL[p]}
        </ChoiceChip>
      ))}
      <span aria-hidden className="mx-1 w-px shrink-0 self-stretch bg-bd" />
      {DUE_FILTERS.map((d) => (
        <ChoiceChip
          key={d.value}
          variant="ink"
          size="xs"
          selected={filters.due === d.value}
          onClick={() => onChange({ ...filters, due: d.value })}
        >
          {d.label}
        </ChoiceChip>
      ))}
    </div>
  );
}

function Toolbar({
  filters,
  onChange,
  desktop,
  onNew,
}: {
  filters: BoardFilters;
  onChange: (f: BoardFilters) => void;
  desktop: boolean;
  onNew: () => void;
}) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const active = filters.priority !== "all" || filters.due !== "all";
  const chipsVisible = desktop || showFilters || active;
  const searchVisible = desktop || showSearch || filters.query !== "";

  const search = (
    <Input
      containerClassName="h-11 min-w-0 flex-1 lg:max-w-[360px]"
      size="md"
      autoFocus={!desktop}
      icon={<Icon name="search" size={20} className="text-mut" />}
      value={filters.query}
      onChange={(e) => onChange({ ...filters, query: e.target.value })}
      onKeyDown={(e) => e.key === "Escape" && onChange({ ...filters, query: "" })}
      placeholder="Buscar tarefa"
      aria-label="Buscar tarefa"
      trailing={
        filters.query ? (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => onChange({ ...filters, query: "" })}
            className="flex size-7 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        ) : undefined
      }
    />
  );
  const toggleBtn = (icon: string, label: string, on: boolean, dot: boolean, onClick: () => void) => (
    <button
      type="button"
      aria-label={label}
      aria-expanded={on}
      onClick={onClick}
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center rounded-full transition-colors",
        on ? "bg-ink text-bg" : "bg-sf2 text-ink",
      )}
    >
      <Icon name={icon} size={22} />
      {dot ? <span className="absolute top-2 right-2 size-2 rounded-full bg-g ring-2 ring-bg" /> : null}
    </button>
  );

  if (desktop) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TaskViewSwitch view="quadro" />
          {search}
          <Button size="sm" className="ml-auto" onClick={onNew}>
            <Icon name="add" />
            Nova tarefa
          </Button>
        </div>
        <FilterChips filters={filters} onChange={onChange} />
      </div>
    );
  }

  // Celular: linha enxuta (Lista|Quadro · buscar · filtros); busca e chips abrem embaixo.
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <TaskViewSwitch view="quadro" />
        <div className="flex-1" />
        {toggleBtn("search", "Buscar", searchVisible, false, () => {
          if (searchVisible) onChange({ ...filters, query: "" });
          setShowSearch(!searchVisible);
        })}
        {toggleBtn("tune", "Filtros", chipsVisible, active, () => setShowFilters((v) => !v))}
      </div>
      {searchVisible ? search : null}
      {chipsVisible ? <FilterChips filters={filters} onChange={onChange} /> : null}
    </div>
  );
}

/* ───────────────────────── colunas ───────────────────────── */

type BoardProps = {
  columns: Record<TaskStatus, Task[]>;
  today: string;
  objectives: Map<string, Objective>;
  actions: CardActions;
  filtering: boolean;
};

function ColumnEmpty({ column, filtering, dropping }: { column: BoardColumn; filtering: boolean; dropping?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition-colors",
        dropping ? "border-2 border-[color:var(--g)]/60 bg-gs/40" : "border-bd",
      )}
    >
      <Icon name={filtering ? "filter_alt_off" : column.icon} size={26} className="text-mut" />
      <p className="m-0 max-w-[220px] text-[13px] leading-[1.4] text-mut">
        {filtering ? "Nenhuma tarefa desta coluna bate com o filtro." : column.empty}
      </p>
    </div>
  );
}

function DoneToggle({ hidden, onShow }: { hidden: number; onShow: () => void }) {
  if (hidden <= 0) return null;
  return (
    <button
      type="button"
      onClick={onShow}
      className="flex h-9 items-center justify-center gap-1 rounded-full bg-transparent text-[13px] leading-none font-medium text-mut hover:text-ink"
    >
      <Icon name="expand_more" size={18} />
      Mostrar mais {hidden}
    </button>
  );
}

/** Mobile: abas com contagem + colunas em carrossel (swipe com scroll-snap nativo). */
function MobileBoard({ columns, today, objectives, actions, filtering, active, onActive }: BoardProps & { active: number; onActive: (i: number) => void }) {
  const scroller = React.useRef<HTMLDivElement>(null);
  // Coluna-alvo de um toque na aba: enquanto a rolagem suave não chega, o onScroll não mexe na aba ativa.
  const target = React.useRef<number | null>(null);
  const [showAllDone, setShowAllDone] = React.useState(false);

  // Abre já em "A fazer" sem animação (o carrossel nasce na 1ª coluna).
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.clientWidth * active;
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    target.current = i;
    el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
    onActive(i);
  };
  const onScroll = () => {
    const el = scroller.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (target.current !== null) {
      if (Math.abs(el.scrollLeft - el.clientWidth * target.current) < 2) target.current = null;
      return;
    }
    if (i !== active) onActive(i);
  };

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Colunas do quadro" className="sticky top-0 z-10 -mx-4 bg-bg px-4 py-1">
        <div className="flex gap-1 rounded-full bg-sf2 p-1">
          {BOARD_COLUMNS.map((c, i) => {
            const selected = i === active;
            return (
              <button
                key={c.status}
                type="button"
                role="tab"
                id={`tab-${c.status}`}
                aria-selected={selected}
                aria-controls={`col-${c.status}`}
                onClick={() => goTo(i)}
                className={cn(
                  "flex h-10 min-w-0 flex-auto items-center justify-center gap-1 rounded-full px-1.5 text-[13px] leading-none font-medium transition-colors",
                  selected ? "bg-sf text-ink shadow-card" : "text-mut",
                )}
              >
                <span className="truncate">{c.status === "backlog" ? "Depois" : c.label}</span>
                <span
                  className={cn(
                    "num flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                    selected ? "text-white" : "bg-bd/70 text-mut",
                  )}
                  style={selected ? { background: c.status === "backlog" ? "var(--ink)" : c.color } : undefined}
                >
                  {columns[c.status].length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={onScroll}
        onTouchStart={() => (target.current = null)}
        className="-mx-4 flex snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {BOARD_COLUMNS.map((c, i) => {
          const all = columns[c.status];
          const list = c.status === "done" && !showAllDone ? all.slice(0, DONE_PREVIEW) : all;
          return (
            <section
              key={c.status}
              id={`col-${c.status}`}
              role="tabpanel"
              aria-labelledby={`tab-${c.status}`}
              aria-hidden={i !== active}
              className="flex w-full shrink-0 snap-start snap-always flex-col gap-2.5 px-4 pb-24"
            >
              {list.length === 0 ? <ColumnEmpty column={c} filtering={filtering} /> : null}
              {list.map((t) => (
                <BoardCard key={t.id} task={t} today={today} objective={t.objectiveId ? objectives.get(t.objectiveId) : undefined} actions={actions} />
              ))}
              {c.status === "done" ? <DoneToggle hidden={all.length - list.length} onShow={() => setShowAllDone(true)} /> : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** Campo para criar direto na coluna (desktop): Enter cria e continua aberto. */
function InlineAdd({ status }: { status: TaskStatus }) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const create = useCreateTask(() => setDraft(""));
  const add = () => {
    const title = draft.trim();
    if (!title || create.isPending) return;
    create.mutate({ title, priority: "medium", dueDate: null, reminderAt: null, status });
  };
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-1.5 rounded-2xl bg-transparent px-2.5 text-sm leading-none font-medium text-mut transition-colors hover:bg-sf hover:text-ink"
      >
        <Icon name="add" size={20} />
        Adicionar tarefa
      </button>
    );
  }
  return (
    <div className="rounded-2xl bg-sf p-2 shadow-card">
      <textarea
        autoFocus
        rows={2}
        value={draft}
        maxLength={140}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            add();
          }
          if (e.key === "Escape") {
            setOpen(false);
            setDraft("");
          }
        }}
        placeholder={`Nova tarefa em “${STATUS_LABEL[status]}”`}
        aria-label={`Nova tarefa em ${STATUS_LABEL[status]}`}
        className="block w-full resize-none bg-transparent px-1.5 py-1 text-[15px] leading-[1.3] text-ink outline-none placeholder:text-mut"
      />
      <div className="mt-1 flex items-center gap-1.5">
        <Button size="xs" onClick={add} disabled={!draft.trim() || create.isPending}>
          Adicionar
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setDraft("");
          }}
        >
          Cancelar
        </Button>
        <span className="ml-auto pr-1 text-[11px] leading-none text-mut">Enter para salvar</span>
      </div>
    </div>
  );
}

/** Desktop: 4 colunas lado a lado, arrastar e soltar (entre colunas e para reordenar). */
function DesktopBoard({ columns, today, objectives, actions, filtering, onDrop }: BoardProps & { onDrop: (task: Task, status: TaskStatus, position: number) => void }) {
  // Ref síncrono para os handlers (dragover chega antes do re-render); estado só para o visual.
  const dragged = React.useRef<Task | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<{ status: TaskStatus; index: number } | null>(null);
  const [showAllDone, setShowAllDone] = React.useState(false);

  const onDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    dragged.current = task;
    // Deixa o navegador capturar a "foto" do card antes de esmaecer o original.
    requestAnimationFrame(() => setDraggingId(task.id));
  };
  const endDrag = () => {
    dragged.current = null;
    setDraggingId(null);
    setOver(null);
  };

  const indexAt = (list: HTMLElement, y: number, draggedId: string) => {
    const cards = [...list.querySelectorAll<HTMLElement>("[data-card]")].filter((el) => el.dataset.card !== draggedId);
    return cards.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2 < y;
    }).length;
  };

  return (
    <div className="grid grid-cols-4 items-start gap-3">
      {BOARD_COLUMNS.map((c) => {
        const all = columns[c.status];
        const list = c.status === "done" && !showAllDone ? all.slice(0, DONE_PREVIEW) : all;
        const here = over?.status === c.status ? over : null;
        const rest = list.filter((t) => t.id !== draggingId);
        // Coluna vazia não troca o estado vazio pelo placeholder: desmontar o elemento sob o cursor perde o drop.
        const placeholderBefore = here && list.length ? (rest[here.index]?.id ?? "end") : null;
        const placeholder = (
          <div key="placeholder" aria-hidden className="h-14 shrink-0 rounded-2xl border-2 border-dashed border-[color:var(--g)]/50 bg-gs/40" />
        );
        return (
          <section
            key={c.status}
            aria-label={c.label}
            onDragOver={(e) => {
              const task = dragged.current;
              if (!task) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              const index = indexAt(e.currentTarget, e.clientY, task.id);
              if (here?.index !== index) setOver({ status: c.status, index });
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
              setOver((o) => (o?.status === c.status ? null : o));
            }}
            onDrop={(e) => {
              e.preventDefault();
              const task = dragged.current;
              if (!task) return;
              const index = indexAt(e.currentTarget, e.clientY, task.id);
              onDrop(task, c.status, dropPosition(list, task.id, index));
              endDrag();
            }}
            className={cn(
              "flex min-h-[280px] min-w-0 flex-col gap-2 rounded-[24px] bg-sf2/70 p-2 transition-[background-color,box-shadow] duration-150",
              here && "bg-sf2 shadow-[inset_0_0_0_2px_var(--g)]",
            )}
          >
            <header className="flex items-center gap-2 px-2 pt-1.5 pb-1">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />
              <h2 className="m-0 text-[15px] leading-none font-semibold">{c.label}</h2>
              <span className="num text-sm leading-none text-mut">{all.length}</span>
            </header>
            {list.length === 0 ? <ColumnEmpty column={c} filtering={filtering} dropping={!!here} /> : null}
            {list.map((t) => (
              <React.Fragment key={t.id}>
                {placeholderBefore === t.id ? placeholder : null}
                <BoardCard
                  task={t}
                  today={today}
                  objective={t.objectiveId ? objectives.get(t.objectiveId) : undefined}
                  actions={actions}
                  draggable
                  dragging={draggingId === t.id}
                  onDragStart={onDragStart}
                  onDragEnd={endDrag}
                />
              </React.Fragment>
            ))}
            {placeholderBefore === "end" ? placeholder : null}
            {c.status === "done" ? <DoneToggle hidden={all.length - list.length} onShow={() => setShowAllDone(true)} /> : null}
            <InlineAdd status={c.status} />
          </section>
        );
      })}
    </div>
  );
}

/* ───────────────────────── tela ───────────────────────── */

/** Botão flutuante (mobile): cria na coluna aberta; sobe quando o mini-player de música está aberto. */
function Fab({ column }: { column: BoardColumn }) {
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const playerHeight = useMusicStore((s) => (s.track && s.playing ? (s.minimized ? 56 : 56 + 135) : 0));
  const bottom = 84 + (playerHeight ? playerHeight + 12 : 0);
  return (
    <Button
      size="fab"
      aria-label={`Nova tarefa em ${column.label}`}
      onClick={() => openQuickAdd({ kind: "task", status: column.status, date: column.status === "backlog" ? null : undefined })}
      className="fixed right-4 z-20 shadow-[0_10px_28px_rgba(226,85,12,.35)] lg:hidden"
      style={{ bottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }}
    >
      <Icon name="add" />
    </Button>
  );
}

/** Quadro Kanban das tarefas: Para depois → A fazer → Fazendo → Feito. */
export function BoardScreen() {
  const tasks = useTasks();
  const objectivesQuery = useObjectives();
  const desktop = useIsDesktop();
  const move = useMoveTask();
  const toggle = useToggleTask();
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);
  const [filters, setFilters] = React.useState<BoardFilters>(NO_FILTERS);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [active, setActive] = React.useState(1);
  const today = todayISO();

  const all = tasks.data ?? [];
  const filtering = isFiltering(filters);
  const columns = groupByStatus(filtering ? all.filter((t) => matchesFilters(t, filters, today)) : all);
  const objectives = new Map((objectivesQuery.data ?? []).map((o) => [o.id, o]));
  const openTask = openId ? (all.find((t) => t.id === openId) ?? null) : null;

  const moveTo = (task: Task, status: TaskStatus) => {
    if (task.status === status) return;
    move({ task, status });
    // No celular o card some da coluna aberta — confirma para onde foi.
    if (!desktop) toast.success(`Movida para “${STATUS_LABEL[status]}”`);
  };
  const actions: CardActions = { open: (t) => setOpenId(t.id), move: moveTo, toggle };
  const boardProps: BoardProps = { columns, today, objectives, actions, filtering };

  return (
    <div className="flex flex-col gap-4">
      <Toolbar filters={filters} onChange={setFilters} desktop={desktop} onNew={() => openQuickAdd({ kind: "task" })} />
      <QueryState
        query={tasks}
        rows={4}
        frame={(node) => <Card>{node}</Card>}
        isEmpty={all.length === 0}
        empty={
          <EmptyState
            icon="view_kanban"
            title="Seu quadro está vazio"
            text="Crie uma tarefa e mova entre as colunas conforme ela avança."
            ctaLabel="Nova tarefa"
            onCta={() => openQuickAdd({ kind: "task" })}
          />
        }
      >
        {desktop ? (
          <DesktopBoard {...boardProps} onDrop={(task, status, position) => move({ task, status, position })} />
        ) : (
          <MobileBoard {...boardProps} active={active} onActive={setActive} />
        )}
      </QueryState>
      {!desktop ? <Fab column={BOARD_COLUMNS[active]} /> : null}
      <TaskDetail
        task={openTask}
        desktop={desktop}
        today={today}
        objective={openTask?.objectiveId ? objectives.get(openTask.objectiveId) : undefined}
        onMove={moveTo}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
