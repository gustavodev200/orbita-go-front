"use client";

import { useState } from "react";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { IconTile } from "@/components/orbita/icon-tile";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Goal } from "@/lib/api/schemas";
import { monthYearShort } from "@/lib/dates";
import { formatBRL, maskBRLInput, parseBRLToCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreateGoal, useDepositGoal, useGoals } from "@/features/finance/hooks";
import { GoalTrail } from "./goal-trail";

export const GOAL_ICONS = ["landscape", "shield", "laptop_mac", "directions_car", "home", "school"];
const ICON_COLORS: Record<string, string> = {
  landscape: "#2E8BEF",
  shield: "#20B878",
  laptop_mac: "#8B5CF6",
  directions_car: "#FF8A1E",
  home: "#EC4E9C",
  school: "#D39500",
};
export const goalColor = (icon: string) => ICON_COLORS[icon] ?? "#20B878";

function goalSubtitle(g: Goal): string {
  if (g.completed) return "concluída!";
  if (g.deadline) return `até ${monthYearShort(g.deadline)}`;
  return `passo ${Math.min(g.currentStep + 1, g.steps)} de ${g.steps}`;
}

/** Grade 6 col de ícones da meta (onboarding e nova meta). */
export function GoalIconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {GOAL_ICONS.map((i) => {
        const on = i === value;
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            aria-label={i}
            onClick={() => onChange(i)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-2xl border-2 border-b-[5px]",
              on ? "border-g bg-gs text-g" : "border-bd bg-sf text-mut",
            )}
          >
            <Icon name={i} size={28} />
          </button>
        );
      })}
    </div>
  );
}

function NewGoalDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (g: Goal) => void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [icon, setIcon] = useState("landscape");
  const [deadline, setDeadline] = useState("");
  const create = useCreateGoal((g) => {
    onCreated(g);
    onOpenChange(false);
  });
  const cents = parseBRLToCents(value);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Nova meta">
      <PanelHeader title="Nova meta" onClose={() => onOpenChange(false)} />
      <PanelBody>
        <Input size="hero" tone="raised" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da meta" className="font-display text-lg font-extrabold" />
        <Input
          size="hero"
          tone="raised"
          inputMode="numeric"
          icon={<span className="num text-xl font-extrabold text-mut">R$</span>}
          value={value}
          onChange={(e) => setValue(maskBRLInput(e.target.value))}
          placeholder="0,00"
          className="num text-2xl font-extrabold text-g"
        />
        <div>
          <FieldLabel>Ícone</FieldLabel>
          <GoalIconPicker value={icon} onChange={setIcon} />
        </div>
        <div>
          <FieldLabel>Prazo (opcional)</FieldLabel>
          <Input
            type="month"
            tone="raised"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            aria-label="Prazo da meta"
            className="font-display text-[15px] font-extrabold"
          />
        </div>
      </PanelBody>
      <PanelFooter>
        <Button
          size="lg"
          block
          disabled={!name.trim() || cents <= 0 || create.isPending}
          onClick={() => create.mutate({ name: name.trim(), targetCents: cents, icon, deadline: deadline || null })}
        >
          Criar meta
        </Button>
      </PanelFooter>
    </Dialog>
  );
}

/** Metas: chips + resumo (sticky no desktop) + trilha em zig-zag. */
export function GoalsTab({ startCreating }: { startCreating?: boolean }) {
  const goals = useGoals();
  const deposit = useDepositGoal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(!!startCreating);
  const list = goals.data ?? [];
  const g = list.find((x) => x.id === selectedId) ?? list.find((x) => !x.completed) ?? list[0];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {list.map((x) => {
          const on = x.id === g?.id;
          return (
            <button
              key={x.id}
              type="button"
              aria-pressed={on}
              onClick={() => setSelectedId(x.id)}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-[14px] border-2 border-b-4 px-3.5 font-display text-sm leading-none font-extrabold text-ink",
                on ? "border-bd bg-sf" : "border-transparent bg-sf2",
              )}
            >
              <Icon name={x.icon} size={20} style={{ color: goalColor(x.icon) }} />
              {x.name}
            </button>
          );
        })}
        <ChoiceChip variant="dashed" className="h-11 rounded-[14px] px-3.5" onClick={() => setCreating(true)}>
          <Icon name="add" size={20} />
          Nova meta
        </ChoiceChip>
      </div>
      <QueryState
        query={goals}
        rows={3}
        isEmpty={!g}
        frame={(node) => (
          <Card radius="lg" padding="lg">
            {node}
          </Card>
        )}
        empty={
          <EmptyState
            mood="comemorando"
            title="Qual é o seu sonho?"
            text="Crie uma meta e eu desenho a trilha até ela, com baús de recompensa no caminho."
            ctaLabel="Criar meta"
            onCta={() => setCreating(true)}
          />
        }
      >
        {g ? (
          <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <Card radius="lg" className="flex flex-col gap-3 lg:sticky lg:top-[96px]">
              <div className="flex items-center gap-3">
                <IconTile icon={g.icon} color={goalColor(g.icon)} size={52} radius={16} iconSize={30} />
                <div>
                  <div className="font-display text-xl leading-[1.15] font-black">{g.name}</div>
                  <div className="text-[13px] leading-[1.3] font-semibold text-mut">{goalSubtitle(g)}</div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="num text-[32px] leading-none font-extrabold tracking-[-.02em]">{formatBRL(g.savedCents)}</div>
                <div className="text-sm leading-none font-bold text-mut">de {formatBRL(g.targetCents)}</div>
              </div>
              <Progress value={g.targetCents ? (g.savedCents / g.targetCents) * 100 : 0} size="md" />
              <div className="flex justify-between font-display text-sm leading-none font-extrabold">
                <span className="text-g">{g.targetCents ? Math.round((g.savedCents / g.targetCents) * 100) : 0}%</span>
                <span className="text-mut">faltam {formatBRL(Math.max(0, g.targetCents - g.savedCents))}</span>
              </div>
            </Card>
            <GoalTrail goal={g} saving={deposit.isPending} onSave={(amountCents) => deposit.mutate({ goal: g, amountCents })} />
          </div>
        ) : null}
      </QueryState>
      {creating ? <NewGoalDialog open={creating} onOpenChange={setCreating} onCreated={(x) => setSelectedId(x.id)} /> : null}
    </>
  );
}
