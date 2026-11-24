"use client";

import { useState } from "react";

import { Icon } from "@/components/orbita/icon";
import { FieldLabel, PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { SegmentedControl } from "@/components/orbita/segmented-control";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { LifeEventKind, TimelineEvent } from "@/lib/api/schemas";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { LIFE_ICONS, LIFE_KINDS } from "./catalog";
import { useSaveLifeEvent } from "./hooks";

const PLACEHOLDER: Record<LifeEventKind, string> = {
  achievement: "Ex.: passei na prova de inglês",
  project: "Ex.: lancei meu app",
  milestone: "Ex.: mudei para meu apartamento",
};

/** Registrar conquista, projeto concluído ou marco da vida na linha do tempo. */
export function LifeEventDialog({ open, onOpenChange, event }: { open: boolean; onOpenChange: (o: boolean) => void; event?: TimelineEvent }) {
  const initialKind = (event && event.manual ? event.kind : "achievement") as LifeEventKind;
  const [kind, setKind] = useState<LifeEventKind>(initialKind);
  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(event?.date ?? todayISO());
  const [description, setDescription] = useState(event?.description ?? "");
  const [icon, setIcon] = useState<string>(event?.icon ?? LIFE_KINDS[0].icon);
  const save = useSaveLifeEvent(() => onOpenChange(false));
  const label = event ? "Editar marco" : "Novo marco";

  const submit = () => {
    const t = title.trim();
    if (!t || !date) return;
    save.mutate({ id: event?.id, input: { kind, title: t, date, description: description.trim() || null, icon } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={label}>
      <PanelHeader title={label} onClose={() => onOpenChange(false)} />
      <PanelBody className="gap-4">
        <SegmentedControl
          ariaLabel="Tipo"
          value={kind}
          onChange={(k) => {
            setKind(k);
            if (!event) setIcon(LIFE_KINDS.find((x) => x.value === k)?.icon ?? icon);
          }}
          options={LIFE_KINDS.map((k) => ({ value: k.value, label: k.label }))}
        />
        <Input
          size="hero"
          tone="raised"
          autoFocus={!event}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={PLACEHOLDER[kind]}
          aria-label="O que aconteceu"
          maxLength={100}
          className="text-base font-medium"
        />
        <div>
          <FieldLabel>Quando</FieldLabel>
          <Input type="date" tone="raised" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} aria-label="Data" />
        </div>
        <div>
          <FieldLabel>Detalhes (opcional)</FieldLabel>
          <Input tone="raised" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Como foi, o que aprendeu…" aria-label="Detalhes" maxLength={500} />
        </div>
        <div>
          <FieldLabel>Ícone</FieldLabel>
          <div className="grid grid-cols-5 gap-2">
            {LIFE_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                aria-label={i}
                aria-pressed={icon === i}
                onClick={() => setIcon(i)}
                className={cn("flex aspect-square items-center justify-center rounded-full transition-colors", icon === i ? "bg-g text-white" : "bg-sf2 text-mut hover:text-ink")}
              >
                <Icon name={i} size={22} />
              </button>
            ))}
          </div>
        </div>
      </PanelBody>
      <PanelFooter>
        <Button size="lg" block disabled={!title.trim() || !date || save.isPending} onClick={submit}>
          {event ? "Salvar" : "Adicionar à linha do tempo"}
        </Button>
      </PanelFooter>
    </Dialog>
  );
}
