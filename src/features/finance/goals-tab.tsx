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
import { installmentByDeadline } from "./goal-trail-math";
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
  if (g.deadline) return `até ${formatDeadline(g.deadline)}`;
  return `passo ${Math.min(g.currentStep + 1, g.steps)} de ${g.steps}`;
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
        className="font-display text-lg font-extrabold"
      />
      <Input
        size="hero"
        tone="raised"
        inputMode="numeric"
        icon={<span className="num text-xl font-extrabold text-mut">R$</span>}
        value={state.value}
        onChange={(e) => onChange({ value: maskBRLInput(e.target.value) })}
        placeholder="0,00"
        className="num text-2xl font-extrabold text-g"
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
          className="font-display text-[15px] font-extrabold"
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
              ? `A trilha vai mostrar 1 marco pra cada aporte, com a data, até ${formatDeadline(state.deadline)}.`
              : "Escolha uma cadência pra trilha mostrar a data de cada aporte. Sem escolher, a trilha continua dividida em 10 partes iguais."}
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
            icon={<span className="num text-lg font-extrabold text-mut">R$</span>}
            value={state.installmentValue}
            onChange={(e) => onChange({ installmentValue: maskBRLInput(e.target.value) })}
            placeholder="0,00"
            aria-label="Valor da parcela"
            className="num mt-2 text-xl font-extrabold"
          />
        ) : (
          <div className="mt-2 text-[13px] leading-[1.4] font-semibold text-mut">
            {generated != null
              ? `Sugestão: ${formatBRL(generated, { compact: true })} por mês até ${formatDeadline(state.deadline)}.`
              : "A trilha calcula o valor sugerido pra você (meta dividida em 10 passos)."}
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
            icon={<span className="num text-xl font-extrabold text-mut">R$</span>}
            value={savedValue}
            onChange={(e) => setSavedValue(maskBRLInput(e.target.value))}
            placeholder="0,00"
            aria-label="Valor já guardado"
            className="num text-2xl font-extrabold"
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

/** Metas: chips + resumo (sticky no desktop) + trilha em zig-zag. */
export function GoalsTab({ startCreating }: { startCreating?: boolean }) {
  const goals = useGoals();
  const deposit = useDepositGoal();
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
                <div className="flex-1">
                  <div className="font-display text-xl leading-[1.15] font-black">{g.name}</div>
                  <div className="text-[13px] leading-[1.3] font-semibold text-mut">{goalSubtitle(g)}</div>
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
      {editing && g ? <EditGoalDialog goal={g} open={editing} onOpenChange={setEditing} onSaved={() => {}} /> : null}
    </>
  );
}
