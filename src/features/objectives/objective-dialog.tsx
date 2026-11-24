"use client";

import { useState } from "react";

import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Objective, ObjectiveHorizon } from "@/lib/api/schemas";
import { addMonthsISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { HORIZONS, OBJECTIVE_COLORS, OBJECTIVE_ICONS, horizonForDeadline } from "./catalog";
import { useSaveObjective } from "./hooks";

const textareaClass =
  "min-h-[76px] w-full resize-none rounded-2xl bg-sf2 px-4 py-3 text-[15px] leading-[1.45] text-ink outline-none placeholder:text-mut focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--g)_45%,transparent)]";

/** Criar/editar meta: título, horizonte + prazo, resultado esperado, motivo, ícone/cor e etapas iniciais. */
export function ObjectiveDialog({
  open,
  onOpenChange,
  objective,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  objective?: Objective;
}) {
  const [title, setTitle] = useState(objective?.title ?? "");
  const [horizon, setHorizon] = useState<ObjectiveHorizon>(objective?.horizon ?? "medium");
  const [deadline, setDeadline] = useState(objective?.deadline ?? "");
  const [expectedResult, setExpectedResult] = useState(objective?.expectedResult ?? "");
  const [why, setWhy] = useState(objective?.why ?? "");
  const [icon, setIcon] = useState<string>(objective?.icon ?? OBJECTIVE_ICONS[0]);
  const [color, setColor] = useState<string>(objective?.color ?? OBJECTIVE_COLORS[0]);
  const [steps, setSteps] = useState("");
  const save = useSaveObjective(() => onOpenChange(false));
  const label = objective ? "Editar meta" : "Nova meta";

  const pickDeadline = (d: string) => {
    setDeadline(d);
    if (d) setHorizon(horizonForDeadline(d));
  };

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    save.mutate({
      id: objective?.id,
      input: {
        title: t,
        horizon,
        deadline: deadline || null,
        expectedResult: expectedResult.trim() || null,
        why: why.trim() || null,
        icon,
        color,
      },
      milestones: steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 30),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={label}>
      <PanelHeader title={label} onClose={() => onOpenChange(false)} />
      <PanelBody className="gap-4">
        <Input
          size="hero"
          tone="raised"
          autoFocus={!objective}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex.: alcançar inglês B1"
          aria-label="Nome da meta"
          maxLength={100}
          className="text-base font-medium"
        />
        <div>
          <FieldLabel>Prazo</FieldLabel>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {[
              { label: "3 meses", months: 3 },
              { label: "6 meses", months: 6 },
              { label: "1 ano", months: 12 },
              { label: "2 anos", months: 24 },
            ].map((q) => {
              const d = addMonthsISO(todayISO(), q.months);
              return (
                <ChoiceChip key={q.months} variant="ink" selected={deadline === d} onClick={() => pickDeadline(d)}>
                  {q.label}
                </ChoiceChip>
              );
            })}
            {deadline ? (
              <ChoiceChip variant="ink" selected={false} onClick={() => setDeadline("")}>
                Sem prazo
              </ChoiceChip>
            ) : null}
          </div>
          <Input
            type="date"
            tone="raised"
            value={deadline}
            min={todayISO()}
            onChange={(e) => pickDeadline(e.target.value)}
            aria-label="Prazo da meta"
            className="text-[15px] font-medium"
          />
        </div>
        <div>
          <FieldLabel>Horizonte</FieldLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {HORIZONS.map((h) => (
              <button
                key={h.value}
                type="button"
                aria-pressed={horizon === h.value}
                onClick={() => setHorizon(h.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition-colors",
                  horizon === h.value ? "bg-ink text-bg" : "bg-sf2 text-ink hover:bg-bd",
                )}
              >
                <span className="text-[13px] leading-none font-medium">{h.label}</span>
                <span className={cn("text-[11px] leading-none", horizon === h.value ? "text-bg/70" : "text-mut")}>{h.hint}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Resultado esperado</FieldLabel>
          <Input
            tone="raised"
            value={expectedResult}
            onChange={(e) => setExpectedResult(e.target.value)}
            placeholder="Ex.: conversar 30 min em inglês sem travar"
            aria-label="Resultado esperado"
            maxLength={200}
          />
        </div>
        <div>
          <FieldLabel>Por que isso importa? (opcional)</FieldLabel>
          <textarea
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Ex.: crescer na carreira e viajar sem medo"
            aria-label="Motivo"
            maxLength={300}
            className={textareaClass}
          />
        </div>
        {!objective ? (
          <div>
            <FieldLabel>Etapas (uma por linha, opcional)</FieldLabel>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder={"Terminar o livro A2\nFazer 20 aulas de conversação\nPassar no simulado B1"}
              aria-label="Etapas iniciais"
              className={cn(textareaClass, "min-h-[96px]")}
            />
          </div>
        ) : null}
        <div>
          <FieldLabel>Ícone</FieldLabel>
          <div className="grid grid-cols-5 gap-2">
            {OBJECTIVE_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                aria-label={i}
                aria-pressed={icon === i}
                onClick={() => setIcon(i)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full transition-colors",
                  icon === i ? "text-white" : "bg-sf2 text-mut hover:text-ink",
                )}
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
            {OBJECTIVE_COLORS.map((c) => (
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
        <Button size="lg" block disabled={!title.trim() || save.isPending} onClick={submit}>
          {objective ? "Salvar" : "Criar meta"}
        </Button>
      </PanelFooter>
    </Dialog>
  );
}
