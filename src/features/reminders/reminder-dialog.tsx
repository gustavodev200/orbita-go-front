"use client";

import { useState } from "react";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { SegmentedControl } from "@/components/orbita/segmented-control";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEnsurePush } from "@/features/push/use-push-status";
import type { ReminderDraft, Repeat } from "@/lib/api/schemas";
import { addDaysISO, todayISO } from "@/lib/dates";
import { useCreateReminder, useParseReminder } from "./hooks";
import { REPEAT_LABEL, nextFireDate, scheduleFromDate } from "./recurrence";

const REPEATS: Repeat[] = ["none", "daily", "weekly", "monthly"];
type Kind = ReminderDraft["kind"];

/** Novo lembrete: escrever do seu jeito (opcional) ou preencher os campos. */
export function ReminderDialog({
  open,
  onOpenChange,
  initialDate,
  initialTime,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  /** "HH:mm" — vem do toque num horário da visão Dia/Semana. */
  initialTime?: string;
}) {
  const today = todayISO();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Kind>("task");
  const [date, setDate] = useState(initialDate && initialDate >= today ? initialDate : today);
  const [time, setTime] = useState(initialTime ?? "09:00");
  const [repeat, setRepeat] = useState<Repeat>("none");
  const parse = useParseReminder();
  const ensurePush = useEnsurePush();
  const create = useCreateReminder(() => {
    onOpenChange(false);
    void ensurePush();
  });

  const understand = () => {
    const t = text.trim();
    if (!t) return;
    parse.mutate(t, {
      onSuccess: (d) => {
        setTitle(d.title);
        setKind(d.kind);
        setTime(d.time);
        setRepeat(d.repeat);
        setDate(nextFireDate(d, today));
      },
    });
  };

  const save = () => {
    const t = title.trim();
    if (!t) return;
    create.mutate({ title: t, kind, time, ...scheduleFromDate(repeat, date) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Novo lembrete">
      <PanelHeader title="Novo lembrete" onClose={() => onOpenChange(false)} />
      <PanelBody className="gap-4">
        <Input
          tone="muted"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && understand()}
          placeholder="Ex.: pagar o aluguel todo dia 5 às 9h"
          aria-label="Descreva o lembrete"
          icon={<Icon name="auto_awesome" size={20} className="text-g" />}
          containerClassName="pr-1.5"
          trailing={
            <Button size="xs" variant="dark" onClick={understand} disabled={parse.isPending || !text.trim()}>
              {parse.isPending ? "…" : "Preencher"}
            </Button>
          }
        />
        <div className="flex items-center gap-3 text-xs text-mut">
          <span className="h-px flex-1 bg-bd" />
          ou preencha
          <span className="h-px flex-1 bg-bd" />
        </div>
        <Input
          size="hero"
          tone="raised"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O que lembrar?"
          aria-label="Título do lembrete"
          className="text-base font-medium"
        />
        <SegmentedControl<Kind>
          value={kind}
          onChange={setKind}
          ariaLabel="Tipo"
          options={[
            { value: "task", label: "Pessoal", icon: "event" },
            { value: "finance", label: "Finanças", icon: "payments" },
          ]}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <FieldLabel>{repeat === "daily" ? "A partir de" : "Data"}</FieldLabel>
            <Input
              type="date"
              tone="raised"
              size="hero"
              value={date}
              min={today}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              aria-label="Data do lembrete"
            />
          </div>
          <div>
            <FieldLabel>Horário</FieldLabel>
            <Input
              type="time"
              tone="raised"
              size="hero"
              value={time}
              onChange={(e) => e.target.value && setTime(e.target.value)}
              aria-label="Horário do lembrete"
            />
          </div>
        </div>
        <div>
          <FieldLabel>Repetir</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {REPEATS.map((r) => (
              <ChoiceChip key={r} size="sm13" selected={repeat === r} onClick={() => setRepeat(r)}>
                {REPEAT_LABEL[r]}
              </ChoiceChip>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5">
          {[0, 1].map((n) => (
            <ChoiceChip key={n} variant="plain" size="xs" onClick={() => setDate(addDaysISO(today, n))}>
              {n === 0 ? "Hoje" : "Amanhã"}
            </ChoiceChip>
          ))}
        </div>
      </PanelBody>
      <PanelFooter>
        <Button size="lg" block disabled={!title.trim() || create.isPending} onClick={save}>
          Criar lembrete
        </Button>
      </PanelFooter>
    </Dialog>
  );
}
