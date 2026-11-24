"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ConfirmDialog } from "@/components/orbita/confirm-dialog";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { Challenge } from "@/lib/api/schemas";
import { diffDays, formatDM, formatDMY, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { challengeDays, currentDayIndex } from "./catalog";
import { ChallengeDialog } from "./challenge-dialog";
import { useAbandonChallenge, useChallenges, useDeleteChallenge, useToggleChallengeDay } from "./hooks";

const STATE_LABEL = { done: "cumprido", missed: "não cumprido", today: "hoje", future: "ainda não chegou" } as const;

function ChallengeMenu({ c, onDelete }: { c: Challenge; onDelete: () => void }) {
  const abandon = useAbandonChallenge();
  const canAbandon = c.status === "active" || c.status === "upcoming";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Opções de ${c.title}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 data-[state=open]:bg-sf2"
      >
        <Icon name="more_horiz" size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        {canAbandon ? (
          <DropdownMenuItem tone="info" onSelect={() => abandon.mutate({ id: c.id, abandoned: true })}>
            <Icon name="flag" />
            Desistir
          </DropdownMenuItem>
        ) : null}
        {c.status === "abandoned" ? (
          <DropdownMenuItem tone="info" onSelect={() => abandon.mutate({ id: c.id, abandoned: false })}>
            <Icon name="undo" />
            Retomar
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem tone="danger" onSelect={onDelete}>
          <Icon name="delete" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChallengeHeader({ c, subtitle, onDelete }: { c: Challenge; subtitle: string; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full text-white" style={{ background: c.color }}>
        <Icon name={c.status === "completed" ? "check" : c.icon} size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] leading-[1.25] font-semibold">{c.title}</div>
        <div className="mt-1 text-xs leading-none text-mut">{subtitle}</div>
      </div>
      <ChallengeMenu c={c} onDelete={onDelete} />
    </div>
  );
}

/** Desafio em andamento: grade de N dias, "Cumpri hoje" e dias perdidos à vista. */
function ActiveChallenge({ c, onDelete }: { c: Challenge; onDelete: () => void }) {
  const toggle = useToggleChallengeDay();
  const today = todayISO();
  const days = challengeDays(c);
  const upcoming = c.status === "upcoming";
  const doneToday = c.checks.includes(today);
  const pct = Math.round((c.checks.length / c.durationDays) * 100);
  const subtitle = upcoming
    ? `Começa em ${formatDMY(c.startDate)} · ${c.durationDays} dias`
    : `Dia ${currentDayIndex(c)} de ${c.durationDays} · termina ${formatDM(c.endDate)}`;
  return (
    <Card className="flex flex-col gap-4">
      <ChallengeHeader c={c} subtitle={subtitle} onDelete={onDelete} />
      {c.why ? <div className="rounded-2xl bg-sf2 px-3 py-2.5 text-[13px] leading-[1.4] text-mut">“{c.why}”</div> : null}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-[13px] leading-none">
          <span className="text-mut">
            <span className="num font-semibold text-ink">{c.checks.length}</span> de {c.durationDays} dias cumpridos
            {c.missedDays ? ` · ${c.missedDays} ${c.missedDays === 1 ? "falta" : "faltas"}` : ""}
          </span>
          <span className="num font-semibold">{pct}%</span>
        </div>
        <Progress value={pct} color={c.color} size="sm" aria-label={`${pct}% do desafio`} />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const clickable = d.state !== "future";
          return (
            <button
              key={d.day}
              type="button"
              role="checkbox"
              aria-checked={d.state === "done"}
              aria-label={`Dia ${d.index} (${formatDM(d.day)}): ${STATE_LABEL[d.state]}`}
              disabled={!clickable}
              onClick={() => toggle(c, d.day)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full text-[12px] leading-none font-medium transition-colors",
                d.state === "missed" && "bg-rs text-rd",
                d.state === "today" && "bg-sf2 text-ink ring-2 ring-ink",
                d.state === "future" && "bg-sf2 text-mut opacity-60",
              )}
              style={d.state === "done" ? { background: c.color, color: "#fff" } : undefined}
            >
              {d.state === "done" ? <Icon name="check" size={16} /> : d.state === "missed" ? <Icon name="close" size={14} /> : d.index}
            </button>
          );
        })}
      </div>
      {!upcoming ? (
        <Button size="lg" block variant={doneToday ? "secondary" : "primary"} onClick={() => toggle(c, today)}>
          <Icon name={doneToday ? "check_circle" : "radio_button_unchecked"} size={20} />
          {doneToday ? "Cumprido hoje" : "Cumpri hoje"}
        </Button>
      ) : null}
    </Card>
  );
}

function FinishedChallenge({ c, onDelete }: { c: Challenge; onDelete: () => void }) {
  const pct = Math.round((c.checks.length / c.durationDays) * 100);
  const label =
    c.status === "completed"
      ? `Concluído · ${c.durationDays} de ${c.durationDays} dias`
      : c.status === "abandoned"
        ? `Encerrado no dia ${Math.min(c.durationDays, Math.max(1, diffDays(c.startDate, (c.abandonedAt ?? "").slice(0, 10)) + 1))} · ${c.checks.length} dias cumpridos`
        : `Terminou em ${formatDM(c.endDate)} · ${c.checks.length} de ${c.durationDays} dias (${pct}%)`;
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <ChallengeHeader c={c} subtitle={label} onDelete={onDelete} />
      <Progress value={pct} color={c.status === "completed" ? c.color : "var(--mut)"} size="xs" aria-label={`${pct}% cumprido`} />
    </Card>
  );
}

/** Desafios de 7, 21 ou 30 dias com check-in diário (prestação de contas). */
export function ChallengesScreen() {
  const challenges = useChallenges();
  const del = useDeleteChallenge();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Challenge | null>(null);

  // "+ Desafio" no menu rápido chega com ?novo=1 (abre o formulário; fechar limpa a URL).
  const fromUrl = params.get("novo") === "1";
  const closeCreate = (open: boolean) => {
    if (open) return;
    setCreating(false);
    if (fromUrl) router.replace(pathname, { scroll: false });
  };

  const list = challenges.data ?? [];
  const running = list.filter((c) => c.status === "active" || c.status === "upcoming");
  const finished = list.filter((c) => !running.includes(c));
  const completed = list.filter((c) => c.status === "completed").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-sm text-mut">Compromissos curtos para criar ritmo. Marque cada dia cumprido.</p>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Icon name="add" size={18} />
          Novo desafio
        </Button>
      </div>
      <QueryState
        query={challenges}
        rows={3}
        isEmpty={list.length === 0}
        frame={(node) => <Card>{node}</Card>}
        empty={
          <EmptyState
            icon="sports_score"
            title="Nenhum desafio ainda"
            text="Que tal 21 dias lendo 10 páginas? Escolha 7, 21 ou 30 dias e marque cada dia cumprido."
            ctaLabel="Criar desafio"
            onCta={() => setCreating(true)}
          />
        }
      >
        {running.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {running.map((c) => (
              <ActiveChallenge key={c.id} c={c} onDelete={() => setDeleting(c)} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState compact icon="sports_score" title="Nenhum desafio em andamento" text="Comece um novo para manter o ritmo." ctaLabel="Novo desafio" onCta={() => setCreating(true)} />
          </Card>
        )}
        {finished.length ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <CardTitle>Histórico</CardTitle>
              <span className="text-[13px] text-mut">
                {completed} {completed === 1 ? "concluído" : "concluídos"} de {finished.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {finished.map((c) => (
                <FinishedChallenge key={c.id} c={c} onDelete={() => setDeleting(c)} />
              ))}
            </div>
          </div>
        ) : null}
      </QueryState>
      {creating || fromUrl ? <ChallengeDialog open onOpenChange={closeCreate} /> : null}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Excluir desafio?"
        text="O histórico de dias marcados some junto. Para só parar, use “Desistir”."
        confirmLabel="Excluir"
        busy={del.isPending}
        onConfirm={() => deleting && del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
