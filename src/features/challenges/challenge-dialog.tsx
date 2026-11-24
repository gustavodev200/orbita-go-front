"use client";

import { useState } from "react";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { SegmentedControl } from "@/components/orbita/segmented-control";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addDaysISO, formatDMY, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { CHALLENGE_COLORS, CHALLENGE_DURATIONS, CHALLENGE_ICONS, CHALLENGE_IDEAS, type ChallengeDuration } from "./catalog";
import { useCreateChallenge } from "./hooks";

/** Novo desafio: ideia pronta ou próprio, 7/21/30 dias, começa hoje ou amanhã. */
export function ChallengeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const today = todayISO();
  const [title, setTitle] = useState("");
  const [days, setDays] = useState<ChallengeDuration>(21);
  const [start, setStart] = useState(today);
  const [why, setWhy] = useState("");
  const [icon, setIcon] = useState<string>(CHALLENGE_ICONS[0]);
  const [color, setColor] = useState<string>(CHALLENGE_COLORS[0]);
  const create = useCreateChallenge(() => onOpenChange(false));

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    create.mutate({ title: t, why: why.trim() || null, icon, color, durationDays: days, startDate: start });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Novo desafio">
      <PanelHeader title="Novo desafio" onClose={() => onOpenChange(false)} />
      <PanelBody className="gap-4">
        <div>
          <FieldLabel>Ideias</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {CHALLENGE_IDEAS.map((i) => (
              <ChoiceChip
                key={i.title}
                variant="ink"
                selected={title === i.title}
                onClick={() => {
                  setTitle(i.title);
                  setIcon(i.icon);
                  setDays(i.days);
                }}
              >
                {i.title}
              </ChoiceChip>
            ))}
          </div>
        </div>
        <Input
          size="hero"
          tone="raised"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ou escreva o seu desafio"
          aria-label="Nome do desafio"
          maxLength={80}
          className="text-base font-medium"
        />
        <div>
          <FieldLabel>Duração</FieldLabel>
          <SegmentedControl
            ariaLabel="Duração"
            value={String(days)}
            onChange={(v) => setDays(Number(v) as ChallengeDuration)}
            options={CHALLENGE_DURATIONS.map((d) => ({ value: String(d), label: `${d} dias` }))}
          />
        </div>
        <div>
          <FieldLabel>Começa · termina em {formatDMY(addDaysISO(start, days - 1))}</FieldLabel>
          <SegmentedControl
            ariaLabel="Início"
            value={start === today ? "hoje" : "amanha"}
            onChange={(v) => setStart(v === "hoje" ? today : addDaysISO(today, 1))}
            options={[
              { value: "hoje", label: "Hoje" },
              { value: "amanha", label: "Amanhã" },
            ]}
          />
        </div>
        <div>
          <FieldLabel>Por que você está fazendo isso? (opcional)</FieldLabel>
          <Input tone="raised" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Ex.: ter mais energia de manhã" aria-label="Motivo" maxLength={300} />
        </div>
        <div>
          <FieldLabel>Ícone</FieldLabel>
          <div className="grid grid-cols-5 gap-2">
            {CHALLENGE_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                aria-label={i}
                aria-pressed={icon === i}
                onClick={() => setIcon(i)}
                className={cn("flex aspect-square items-center justify-center rounded-full transition-colors", icon === i ? "text-white" : "bg-sf2 text-mut hover:text-ink")}
                style={icon === i ? { background: color } : undefined}
              >
                <Icon name={i} size={22} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Cor</FieldLabel>
          <div className="flex gap-2">
            {CHALLENGE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Cor ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className="size-8 rounded-full transition-shadow"
                style={{ background: c, boxShadow: color === c ? `0 0 0 3px var(--sf), 0 0 0 5px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>
      </PanelBody>
      <PanelFooter>
        <Button size="lg" block disabled={!title.trim() || create.isPending} onClick={submit}>
          Começar desafio de {days} dias
        </Button>
      </PanelFooter>
    </Dialog>
  );
}
