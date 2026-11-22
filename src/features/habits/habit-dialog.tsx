"use client";

import { useState } from "react";

import { Icon } from "@/components/orbita/icon";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEnsurePush } from "@/features/push/use-push-status";
import type { Habit } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { ALL_WEEKDAYS, HABIT_COLORS, HABIT_ICONS, WEEKDAY_SHORT, WEEK_ORDER, weekdaysLabel } from "./catalog";
import { useSaveHabit } from "./hooks";

/** Criar/editar hábito: nome, ícone, cor, dias da semana e lembrete opcional. */
export function HabitDialog({ open, onOpenChange, habit }: { open: boolean; onOpenChange: (o: boolean) => void; habit?: Habit }) {
  const [name, setName] = useState(habit?.name ?? "");
  const [icon, setIcon] = useState<string>(habit?.icon ?? HABIT_ICONS[0]);
  const [color, setColor] = useState<string>(habit?.color ?? HABIT_COLORS[0]);
  const [weekdays, setWeekdays] = useState<number[]>(habit?.weekdays ?? ALL_WEEKDAYS);
  const [remind, setRemind] = useState(!!habit?.reminderTime);
  const [time, setTime] = useState(habit?.reminderTime ?? "08:00");
  const ensurePush = useEnsurePush();
  const save = useSaveHabit(() => {
    onOpenChange(false);
    if (remind) void ensurePush();
  });
  const label = habit ? "Editar hábito" : "Novo hábito";

  const toggleDay = (d: number) =>
    setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d].sort((a, b) => a - b)));

  const submit = () => {
    const n = name.trim();
    if (!n || weekdays.length === 0) return;
    save.mutate({ id: habit?.id, input: { name: n, icon, color, weekdays, reminderTime: remind ? time : null } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={label}>
      <PanelHeader title={label} onClose={() => onOpenChange(false)} />
      <PanelBody className="gap-4">
        <Input
          size="hero"
          tone="raised"
          autoFocus={!habit}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ex.: beber 2L de água"
          aria-label="Nome do hábito"
          maxLength={60}
          className="text-base font-medium"
        />
        <div>
          <FieldLabel>Ícone</FieldLabel>
          <div className="grid grid-cols-5 gap-2">
            {HABIT_ICONS.map((i) => (
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
            {HABIT_COLORS.map((c) => (
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
        <div>
          <FieldLabel>Dias · {weekdays.length ? weekdaysLabel(weekdays) : "escolha pelo menos um"}</FieldLabel>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEK_ORDER.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={weekdays.includes(d)}
                onClick={() => toggleDay(d)}
                className={cn(
                  "h-10 rounded-full text-[13px] leading-none font-medium transition-colors",
                  weekdays.includes(d) ? "bg-g text-white" : "bg-sf2 text-mut hover:text-ink",
                )}
              >
                {WEEKDAY_SHORT[d]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-sf2 px-4 py-3">
          <Icon name="alarm" size={22} className="text-g" />
          <div className="flex-1">
            <div className="text-[15px] leading-none font-medium">Lembrar</div>
            <div className="mt-1 text-xs leading-none text-mut">Avisa só se ainda não marcou no dia</div>
          </div>
          {remind ? (
            <input
              type="time"
              value={time}
              onChange={(e) => e.target.value && setTime(e.target.value)}
              aria-label="Horário do lembrete"
              className="num h-9 rounded-full bg-sf px-3 text-sm text-ink outline-none"
            />
          ) : null}
          <Switch checked={remind} onCheckedChange={setRemind} aria-label="Lembrar" />
        </div>
      </PanelBody>
      <PanelFooter>
        <Button size="lg" block disabled={!name.trim() || weekdays.length === 0 || save.isPending} onClick={submit}>
          {habit ? "Salvar" : "Criar hábito"}
        </Button>
      </PanelFooter>
    </Dialog>
  );
}
