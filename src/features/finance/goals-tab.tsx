"use client";

import { useState } from "react";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { IconTile } from "@/components/orbita/icon-tile";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { SegmentedControl, type SegmentOption } from "@/components/orbita/segmented-control";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Goal, GoalFrequency } from "@/lib/api/schemas";
import { deadlineToISODay, formatDeadline, todayISO } from "@/lib/dates";
import { formatBRL, maskBRLInput, parseBRLToCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreateGoal, useDepositGoal, useGoals, useUpdateGoal } from "@/features/finance/hooks";
import { installmentByDeadline, suggestedStepAmountOf } from "./goal-trail-math";

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
  if (g.completed) return "Concluída";
  if (g.deadline) return `Até ${formatDeadline(g.deadline)}`;
  return "Sem prazo";
}

/** Grade 6 col de ícones da meta (onboarding e nova meta). */
export function GoalIconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 min-[400px]:gap-2">
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
              "flex aspect-square items-center justify-center rounded-full transition-colors",
              on ? "bg-g text-white" : "bg-sf2 text-mut hover:text-ink",
            )}
          >
            <Icon name={i} size={28} />
          </button>
        );
      })}
    </div>
  );
}

type InstallmentMode = "gerar" | "manual";
const INSTALLMENT_MODES: SegmentOption<InstallmentMode>[] = [
  { value: "gerar", label: "Gerar" },
  { value: "manual", label: "Manual" },
];

/** "" = usuário ainda não escolheu cadência — não é o mesmo que "mensal" selecionado. */
const FREQUENCY_OPTIONS: SegmentOption<GoalFrequency | "">[] = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
];

/** Campos comuns a "Nova meta" e "Editar meta" (nome, valor, ícone, prazo, parcela, cadência). */
type GoalFormState = {
  name: string;
  value: string;
  icon: string;
  deadline: string;
  installmentMode: InstallmentMode;
  installmentValue: string;
  /** "" = trilha por dinheiro (sem cadência escolhida) — só vira uma trilha por data se o usuário escolher. */
  frequency: GoalFrequency | "";
};

const EMPTY_GOAL_FORM: GoalFormState = {
  name: "",
  value: "",
  icon: "landscape",
  deadline: "",
  installmentMode: "gerar",
  installmentValue: "",
  frequency: "",
};

/** cents → texto editável ("1234,56"), mesmo formato que maskBRLInput produz. */
function centsToInputValue(cents: number): string {
  return formatBRL(cents, { sign: "never" }).replace("R$ ", "");
}

function goalToFormState(g: Goal): GoalFormState {
  return {
    name: g.name,
    value: centsToInputValue(g.targetCents),
    icon: g.icon,
    deadline: g.deadline ? deadlineToISODay(g.deadline) : "",
    installmentMode: g.installmentCents ? "manual" : "gerar",
    installmentValue: g.installmentCents ? centsToInputValue(g.installmentCents) : "",
    frequency: g.frequency ?? "",
  };
}

function useGoalFormState(initial: GoalFormState = EMPTY_GOAL_FORM) {
  const [state, setState] = useState(initial);
  const patch = (p: Partial<GoalFormState>) => setState((s) => ({ ...s, ...p }));
  return [state, patch] as const;
}

function GoalFields({
  state,
  onChange,
  alreadySavedCents = 0,
}: {
  state: GoalFormState;
  onChange: (p: Partial<GoalFormState>) => void;
  /** Quanto já está guardado (goal.savedCents na edição; "já tenho guardado" digitado na criação) — só pra calcular a sugestão do modo "gerar". */
  alreadySavedCents?: number;
}) {
  const cents = parseBRLToCents(state.value);
  const generated = installmentByDeadline(cents, alreadySavedCents, state.deadline || null, todayISO());
  return (
    <>
      <Input
        size="hero"
        tone="raised"
        value={state.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Nome da meta"
        className="font-display text-lg font-semibold"
      />
      <Input
        size="hero"
        tone="raised"
        inputMode="numeric"
        icon={<span className="num text-xl font-semibold text-mut">R$</span>}
        value={state.value}
        onChange={(e) => onChange({ value: maskBRLInput(e.target.value) })}
        placeholder="0,00"
        className="num text-2xl font-semibold text-g"
      />
      <div>
        <FieldLabel>Ícone</FieldLabel>
        <GoalIconPicker value={state.icon} onChange={(icon) => onChange({ icon })} />
      </div>
      <div>
        <FieldLabel>Prazo (opcional)</FieldLabel>
        <Input
          type="date"
          tone="raised"
          value={state.deadline}
          onChange={(e) => onChange({ deadline: e.target.value })}
          aria-label="Prazo da meta"
          className="font-display text-[15px] font-semibold"
        />
      </div>
      {state.deadline ? (
        <div>
          <FieldLabel>Com que frequência você vai guardar? (opcional)</FieldLabel>
          <SegmentedControl
            value={state.frequency}
            onChange={(frequency) => onChange({ frequency })}
            options={FREQUENCY_OPTIONS}
            ariaLabel="Frequência dos aportes"
          />
          <div className="mt-2 text-[13px] leading-[1.4] font-semibold text-mut">
            {state.frequency
              ? `Você vai guardar uma parcela a cada período até ${formatDeadline(state.deadline)}.`
              : "Escolha uma cadência para planejar os aportes até o prazo."}
          </div>
        </div>
      ) : null}
      <div>
        <FieldLabel>Quanto guardar por vez</FieldLabel>
        <SegmentedControl
          value={state.installmentMode}
          onChange={(installmentMode) => onChange({ installmentMode })}
          options={INSTALLMENT_MODES}
          ariaLabel="Quanto guardar por vez"
        />
        {state.installmentMode === "manual" ? (
          <Input
            size="hero"
            tone="raised"
            inputMode="numeric"
            icon={<span className="num text-lg font-semibold text-mut">R$</span>}
            value={state.installmentValue}
            onChange={(e) => onChange({ installmentValue: maskBRLInput(e.target.value) })}
            placeholder="0,00"
            aria-label="Valor da parcela"
            className="num mt-2 text-xl font-semibold"
          />
        ) : (
          <div className="mt-2 text-[13px] leading-[1.4] font-semibold text-mut">
            {generated != null
              ? `Sugestão: ${formatBRL(generated, { compact: true })} por mês até ${formatDeadline(state.deadline)}.`
              : "Sugerimos um valor por vez (a meta dividida em 10 partes)."}
          </div>
        )}
      </div>
    </>
  );
}

function NewGoalDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (g: Goal) => void }) {
  const [form, patch] = useGoalFormState();
  const [savedValue, setSavedValue] = useState("");
  const create = useCreateGoal((g) => {
    onCreated(g);
    onOpenChange(false);
  });
  const cents = parseBRLToCents(form.value);
  const installmentCents = parseBRLToCents(form.installmentValue);
  const installmentInvalid = form.installmentMode === "manual" && (installmentCents <= 0 || installmentCents > cents);
  const savedCents = parseBRLToCents(savedValue);
  const savedInvalid = savedCents > cents;
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Nova meta">
      <PanelHeader title="Nova meta" onClose={() => onOpenChange(false)} />
      <PanelBody>
        <GoalFields state={form} onChange={patch} alreadySavedCents={savedCents} />
        <div>
          <FieldLabel>Já tenho guardado (opcional)</FieldLabel>
          <Input
            size="hero"
            tone="raised"
            inputMode="numeric"
            icon={<span className="num text-xl font-semibold text-mut">R$</span>}
            value={savedValue}
            onChange={(e) => setSavedValue(maskBRLInput(e.target.value))}
            placeholder="0,00"
            aria-label="Valor já guardado"
            className="num text-2xl font-semibold"
          />
          {savedInvalid ? <div className="mt-1.5 text-[13px] leading-[1.3] font-semibold text-r">Não pode passar do valor da meta.</div> : null}
        </div>
      </PanelBody>
      <PanelFooter>
        <Button
          size="lg"
          block
          disabled={!form.name.trim() || cents <= 0 || installmentInvalid || savedInvalid || create.isPending}
          onClick={() =>
            create.mutate({
              name: form.name.trim(),
              targetCents: cents,
              icon: form.icon,
              deadline: form.deadline || null,
              frequency: form.deadline && form.frequency ? form.frequency : null,
              installmentCents: form.installmentMode === "manual" ? installmentCents : null,
              ...(savedCents > 0 ? { savedCents } : {}),
            })
          }
        >
          Criar meta
        </Button>
      </PanelFooter>
    </Dialog>
  );
}

function EditGoalDialog({ goal, open, onOpenChange, onSaved }: { goal: Goal; open: boolean; onOpenChange: (o: boolean) => void; onSaved: (g: Goal) => void }) {
  const [form, patch] = useGoalFormState(goalToFormState(goal));
  const update = useUpdateGoal((g) => {
    onSaved(g);
    onOpenChange(false);
  });
  const cents = parseBRLToCents(form.value);
  const installmentCents = parseBRLToCents(form.installmentValue);
  const installmentInvalid = form.installmentMode === "manual" && (installmentCents <= 0 || installmentCents > cents);
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Editar meta">
      <PanelHeader title="Editar meta" onClose={() => onOpenChange(false)} />
      <PanelBody>
        <GoalFields state={form} onChange={patch} alreadySavedCents={goal.savedCents} />
      </PanelBody>
      <PanelFooter>
        <Button
          size="lg"
          block
          disabled={!form.name.trim() || cents <= 0 || installmentInvalid || update.isPending}
          onClick={() =>
            update.mutate({
              id: goal.id,
              input: {
                name: form.name.trim(),
                targetCents: cents,
                icon: form.icon,
                deadline: form.deadline || null,
                frequency: form.deadline && form.frequency ? form.frequency : null,
                installmentCents: form.installmentMode === "manual" ? installmentCents : null,
              },
            })
          }
        >
          Salvar
        </Button>
      </PanelFooter>
    </Dialog>
  );
}

/** Guardar dinheiro: valor sugerido + atalhos + campo livre. */
function DepositCard({ goal }: { goal: Goal }) {
  const suggested = suggestedStepAmountOf(goal, Math.min(goal.currentStep, Math.max(0, goal.steps - 1)), todayISO());
  const remaining = Math.max(0, goal.targetCents - goal.savedCents);
  const [value, setValue] = useState(() => centsToInputValue(Math.min(suggested, remaining)));
  const deposit = useDepositGoal(() => setValue(""));
  const cents = parseBRLToCents(value);
  const chips = [...new Set([Math.min(suggested, remaining), 5000, 10000, remaining])].filter((c) => c > 0 && c <= remaining);

  if (goal.completed) {
    return (
      <Card className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-oks text-ok">
          <Icon name="check" size={28} />
        </div>
        <div className="text-lg font-semibold">Meta concluída</div>
        <div className="text-sm text-mut">Você juntou {formatBRL(goal.targetCents)}.</div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <div className="text-[17px] leading-none font-semibold">Guardar dinheiro</div>
        <div className="mt-1.5 text-[13px] text-mut">Sugestão: {formatBRL(suggested, { compact: true })} por vez</div>
      </div>
      <Input
        size="hero"
        tone="raised"
        inputMode="numeric"
        icon={<span className="num text-lg font-medium text-mut">R$</span>}
        value={value}
        onChange={(e) => setValue(maskBRLInput(e.target.value))}
        placeholder="0,00"
        aria-label="Valor a guardar"
        className="num text-2xl font-semibold"
      />
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <ChoiceChip key={c} size="xs" selected={cents === c} onClick={() => setValue(centsToInputValue(c))}>
            {c === remaining ? "Tudo que falta" : formatBRL(c, { compact: true })}
          </ChoiceChip>
        ))}
      </div>
      <Button
        size="lg"
        block
        disabled={cents <= 0 || cents > remaining || deposit.isPending}
        onClick={() => deposit.mutate({ goal, amountCents: cents })}
      >
        Guardar {cents > 0 ? formatBRL(cents, { compact: true }) : ""}
      </Button>
      {cents > remaining ? <div className="-mt-2 text-[13px] text-r">Passa do que falta para a meta.</div> : null}
    </Card>
  );
}

/** Metas: chips + resumo + guardar dinheiro. */
export function GoalsTab({ startCreating }: { startCreating?: boolean }) {
  const goals = useGoals();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(!!startCreating);
  const [editing, setEditing] = useState(false);
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
                "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm leading-none font-medium transition-colors",
                on ? "bg-ink text-bg" : "bg-sf text-ink shadow-card hover:bg-sf2",
              )}
            >
              <Icon name={x.icon} size={20} style={{ color: goalColor(x.icon) }} />
              {x.name}
            </button>
          );
        })}
        <ChoiceChip variant="dashed" className="h-10 px-4" onClick={() => setCreating(true)}>
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
            icon="savings"
            title="Crie sua primeira meta"
            text="Viagem, reserva, um notebook novo… defina o valor e acompanhe quanto já guardou."
            ctaLabel="Criar meta"
            onCta={() => setCreating(true)}
          />
        }
      >
        {g ? (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <IconTile icon={g.icon} color={goalColor(g.icon)} size={48} />
                <div className="flex-1">
                  <div className="text-lg leading-[1.2] font-semibold">{g.name}</div>
                  <div className="mt-0.5 text-[13px] leading-[1.3] text-mut">{goalSubtitle(g)}</div>
                </div>
                <button
                  type="button"
                  aria-label="Editar meta"
                  onClick={() => setEditing(true)}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sf2 text-mut"
                >
                  <Icon name="edit" size={18} />
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="num text-[32px] leading-none font-semibold tracking-[-.02em]">{formatBRL(g.savedCents)}</div>
                <div className="text-sm leading-none font-medium text-mut">de {formatBRL(g.targetCents)}</div>
              </div>
              <Progress value={g.targetCents ? (g.savedCents / g.targetCents) * 100 : 0} size="md" />
              <div className="flex justify-between text-sm leading-none font-medium">
                <span className="text-g">{g.targetCents ? Math.round((g.savedCents / g.targetCents) * 100) : 0}%</span>
                <span className="text-mut">faltam {formatBRL(Math.max(0, g.targetCents - g.savedCents))}</span>
              </div>
            </Card>
            <DepositCard key={g.id} goal={g} />
          </div>
        ) : null}
      </QueryState>
      {creating ? <NewGoalDialog open={creating} onOpenChange={setCreating} onCreated={(x) => setSelectedId(x.id)} /> : null}
      {editing && g ? <EditGoalDialog goal={g} open={editing} onOpenChange={setEditing} onSaved={() => {}} /> : null}
    </>
  );
}
