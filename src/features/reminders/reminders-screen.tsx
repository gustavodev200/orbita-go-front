"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Cobre } from "@/components/orbita/cobre";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Reminder, ReminderDraft } from "@/lib/api/schemas";
import { MONTHS, addDaysISO, formatDM, parseISODate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useCreateReminder, useParseReminder, useReminders, useToggleReminder } from "./hooks";

const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const REPEAT_LABEL = { none: "Uma vez", daily: "Todo dia", weekly: "Toda semana", monthly: "Todo mês" } as const;

export function whenLabel(r: ReminderDraft, today: string): string {
  if (r.repeat === "monthly") return r.dayOfMonth ? `Todo dia ${r.dayOfMonth}` : "Todo mês";
  if (r.repeat === "weekly") return r.weekday != null ? `Toda ${WEEKDAYS[r.weekday]}` : "Toda semana";
  if (r.repeat === "daily") return "Todo dia";
  if (!r.date) return "Hoje";
  const d = r.date.slice(0, 10);
  if (d === today) return "Hoje";
  if (d === addDaysISO(today, 1)) return `Amanhã, ${formatDM(d)}`;
  return formatDM(d);
}

/** Próxima data em que o lembrete dispara (para a prévia da tela bloqueada). */
export function nextFireDate(r: ReminderDraft, today: string): string {
  if (r.repeat === "monthly" && r.dayOfMonth) {
    const [y, m, d] = today.split("-").map(Number);
    const target = r.dayOfMonth >= d ? new Date(Date.UTC(y, m - 1, r.dayOfMonth)) : new Date(Date.UTC(y, m, r.dayOfMonth));
    return target.toISOString().slice(0, 10);
  }
  if (r.repeat === "weekly" && r.weekday != null) {
    const wd = parseISODate(today).getUTCDay();
    return addDaysISO(today, (r.weekday - wd + 7) % 7);
  }
  return r.date?.slice(0, 10) ?? today;
}

function longDate(iso: string) {
  const d = parseISODate(iso);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()].toLowerCase()}`;
}

function ReminderRow({ r, first, fresh }: { r: Reminder; first: boolean; fresh: boolean }) {
  const toggle = useToggleReminder();
  const [enabled, setEnabled] = useState(r.enabled);
  const fin = r.kind === "finance";
  const color = fin ? "var(--g)" : "var(--b)";
  return (
    <motion.div
      initial={fresh ? { opacity: 0, y: -10 } : false}
      animate={{ opacity: enabled ? 1 : 0.5, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("flex items-center gap-3 px-4 py-3.5", !first && "border-t-2 border-sf2")}
    >
      <div className="flex size-[46px] shrink-0 items-center justify-center rounded-[15px]" style={{ background: fin ? "var(--gs)" : "var(--bs)" }}>
        <motion.span
          style={{ color, transformOrigin: "50% 10%", display: "inline-flex" }}
          animate={fresh ? { rotate: [0, 18, -16, 10, 0, 0] } : undefined}
          transition={{ duration: 1.2, repeat: 1, times: [0, 0.1, 0.2, 0.3, 0.4, 1] }}
        >
          <Icon name="notifications_active" size={26} />
        </motion.span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[15px] leading-[1.25] font-extrabold">{r.title}</div>
        <div className="mt-[3px] text-xs leading-[1.3] font-semibold text-mut">
          {whenLabel(r, todayISO())} · {r.time}
        </div>
      </div>
      <Badge tone={fin ? "finance" : "task"} size="sm">
        {fin ? "Finanças" : "Tarefa"}
      </Badge>
      <Switch
        checked={enabled}
        aria-label={enabled ? "Desativar lembrete" : "Ativar lembrete"}
        onCheckedChange={(v) => {
          setEnabled(v);
          toggle.mutate({ id: r.id, enabled: v }, { onError: () => setEnabled(!v) });
        }}
      />
    </motion.div>
  );
}

/** Prévia de notificação em tela bloqueada, na voz do Cobre. */
function NotificationPreview({ draft, streak }: { draft: ReminderDraft | null; streak: number }) {
  const today = todayISO();
  const time = draft?.time ?? "09:00";
  const fin = draft?.kind !== "task";
  const what = draft?.title ?? "Pagar o aluguel";
  return (
    <div className="flex flex-col gap-3">
      <div className="px-1.5 font-display text-lg leading-[1.2] font-black">Prévia da notificação</div>
      <div className="flex flex-col items-center gap-3.5 rounded-[28px] bg-[linear-gradient(160deg,#3A2D5E,#1C1733)] px-4 pt-7 pb-[22px]">
        <div className="num text-[64px] leading-none font-semibold tracking-[-.02em] text-white">{time}</div>
        <div className="-mt-1 text-sm leading-none font-semibold text-white/75">{longDate(draft ? nextFireDate(draft, today) : today)}</div>
        <div className="mt-[18px] flex w-full items-start gap-3 rounded-[20px] bg-white/88 px-3.5 py-3">
          <div className="flex size-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#20B878]">
            <Cobre mood="feliz" size={34} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[13px] leading-[1.2] font-bold text-[#2B2520]">
              <span>órbitaGO</span>
              <span className="font-semibold text-[#7D7064]">agora</span>
            </div>
            <div className="mt-[3px] text-sm leading-[1.3] font-extrabold text-[#2B2520]">
              Cobre: {fin ? "dia de derrotar um chefão!" : "psiu, lembrete chegando!"}
            </div>
            <div className="mt-0.5 text-sm leading-[1.35] font-medium text-pretty text-[#2B2520]">
              {fin
                ? `Hoje é dia de ${what.toLowerCase()}. Paga em dia e ganha +10 XP.`
                : `${what} — bora riscar isso da lista? Vale +5 XP.`}
            </div>
          </div>
        </div>
        <div className="-mt-1.5 flex w-full scale-95 items-start gap-3 rounded-[20px] bg-white/55 px-3.5 py-3">
          <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#FF8A1E]">
            <Icon name="local_fire_department" className="text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] leading-[1.2] font-bold text-[#2B2520]">órbitaGO · ontem</div>
            <div className="mt-[3px] text-sm leading-[1.35] font-medium text-[#2B2520]">
              {streak > 0 ? `Ofensiva de ${streak} dias! Não deixa o fogo apagar hoje.` : "Bora acender a ofensiva hoje?"}
            </div>
          </div>
        </div>
      </div>
      <div className="px-1.5 text-[13px] leading-[1.45] font-semibold text-mut">
        As mensagens são escritas na voz do Cobre: curtas, animadas e sempre com o valor da conta.
      </div>
    </div>
  );
}

/** Lembretes: linguagem natural → prévia → criar; lista com switch; prévia de notificação. */
export function RemindersScreen({ streak }: { streak: number }) {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<ReminderDraft | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const reminders = useReminders();
  const parse = useParseReminder();
  const create = useCreateReminder((r) => {
    setFreshId(r.id);
    setDraft(null);
    setText("");
  });
  const list = reminders.data ?? [];
  const today = todayISO();

  const understand = () => {
    const t = text.trim();
    if (!t) return;
    setDraft(null);
    parse.mutate(t, { onSuccess: (d) => setDraft(d) });
  };

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-[18px]">
        <Card radius="lg" padding="none" className="flex flex-col gap-3 p-[18px]">
          <div className="flex items-center gap-2 font-display text-lg leading-[1.2] font-black">
            <Icon name="auto_awesome" className="text-p" />
            Criar lembrete falando
          </div>
          <div className="flex gap-2.5">
            <Input
              tone="ai"
              size="xl"
              containerClassName="flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && understand()}
              placeholder="me lembra de pagar o aluguel todo dia 5 às 9h"
              aria-label="Descreva o lembrete"
              className="text-base"
              trailing={<Icon name="mic" className="text-p" />}
            />
            <Button variant="ai" className="h-14 px-4 text-sm" onClick={understand} disabled={parse.isPending}>
              Entender
            </Button>
          </div>
          <AnimatePresence mode="wait">
            {parse.isPending ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-[14px] bg-sf2 px-3.5 py-3 text-sm leading-none font-bold text-mut"
              >
                <Cobre mood="feliz" size={32} />
                Cobre está lendo
                <span className="animate-dots">.</span>
                <span className="animate-dots [animation-delay:.2s]">.</span>
                <span className="animate-dots [animation-delay:.4s]">.</span>
              </motion.div>
            ) : draft ? (
              <motion.div
                key="preview"
                data-testid="reminder-ai-preview"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-[18px] border-2 border-dashed border-p p-3.5"
              >
                <div className="font-display text-xs leading-none font-black tracking-[.1em] text-p uppercase">Entendi assim</div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
                  {[
                    { k: "O quê", v: draft.title, icon: "edit" },
                    { k: "Quando", v: whenLabel(draft, today), icon: "event" },
                    { k: "Horário", v: draft.time, icon: "schedule" },
                    { k: "Repetir", v: REPEAT_LABEL[draft.repeat], icon: "repeat" },
                  ].map((f) => (
                    <div key={f.k} className="rounded-xl bg-sf2 px-3 py-2.5">
                      <div className="flex items-center gap-1 text-xs leading-none font-bold text-mut">
                        <Icon name={f.icon} size={15} />
                        {f.k}
                      </div>
                      <div className="mt-1.5 font-display text-[15px] leading-[1.25] font-extrabold">{f.v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-12 flex-1 rounded-[14px] text-sm" disabled={create.isPending} onClick={() => create.mutate(draft)}>
                    Criar lembrete
                  </Button>
                  <Button variant="secondary" size="sm" className="h-12 rounded-[14px] border-b-4 px-4 text-sm text-mut" onClick={() => setDraft(null)}>
                    Editar
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Card>

        <div className="flex items-center justify-between px-1.5">
          <div className="font-display text-lg leading-[1.2] font-black">Agendados</div>
          <div className="text-[13px] leading-none font-bold text-mut">{list.filter((r) => r.enabled).length} ativos</div>
        </div>
        <QueryState
          query={reminders}
          rows={4}
          isEmpty={list.length === 0}
          frame={(node) => (
            <Card radius="lg" padding="lg">
              {node}
            </Card>
          )}
          empty={
            <EmptyState
              title="Nenhum lembrete agendado"
              text="Escreva do seu jeito no campo acima. Eu entendo datas, horários e repetições."
            />
          }
        >
          <Card radius="lg" padding="none" className="overflow-hidden">
            {list.map((r, i) => (
              <ReminderRow key={r.id} r={r} first={i === 0} fresh={r.id === freshId} />
            ))}
          </Card>
        </QueryState>
      </div>
      <NotificationPreview draft={draft ?? list.find((r) => r.enabled) ?? null} streak={streak} />
    </div>
  );
}
