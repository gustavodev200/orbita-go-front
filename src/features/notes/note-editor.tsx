"use client";

import { useRef, useState } from "react";

import { CheckCircle } from "@/components/orbita/check-circle";
import { ConfirmDialog } from "@/components/orbita/confirm-dialog";
import { Icon } from "@/components/orbita/icon";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useEnsurePush } from "@/features/push/use-push-status";
import { NOTE_COLORS, type Note, type NoteColor, type NoteItem } from "@/lib/api/schemas";
import { addDaysISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { NoteInput } from "./api";
import { useCreateNote, useDeleteNote, useUpdateNote } from "./hooks";
import {
  bodyToItems,
  isEmptyNote,
  itemsToBody,
  newItem,
  NOTE_COLOR_HEX,
  NOTE_COLOR_LABEL,
  noteBackground,
  reminderAtFrom,
  reminderLabel,
} from "./note-utils";

export type NoteDraft = Pick<Note, "title" | "body" | "color" | "labels" | "checklist" | "items" | "pinned" | "reminderAt">;

const DRAFT_KEYS = ["title", "body", "color", "labels", "checklist", "items", "pinned", "reminderAt"] as const satisfies readonly (keyof NoteDraft)[];

function toDraft(n: Note): NoteDraft {
  return Object.fromEntries(DRAFT_KEYS.map((k) => [k, n[k]])) as NoteDraft;
}

export const EMPTY_DRAFT: NoteDraft = {
  title: "",
  body: "",
  color: "default",
  labels: [],
  checklist: false,
  items: [],
  pinned: false,
  reminderAt: null,
};

function ToolButton({ icon, label, active, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-ink/10",
        active ? "text-ink" : "text-mut hover:text-ink",
      )}
    >
      <Icon name={icon} size={22} className={active ? "icon-fill" : undefined} />
    </button>
  );
}

function ColorPicker({ value, onChange }: { value: NoteColor; onChange: (c: NoteColor) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Cor da nota"
          title="Cor da nota"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-mut transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <Icon name="palette" size={22} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="grid grid-cols-5 gap-2 p-3">
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={NOTE_COLOR_LABEL[c]}
            title={NOTE_COLOR_LABEL[c]}
            aria-pressed={c === value}
            onClick={() => onChange(c)}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105",
              c === value ? "border-ink" : "border-bd",
            )}
            style={{ background: noteBackground(c) }}
          >
            {c === "default" ? <Icon name="format_color_reset" size={18} className="text-mut" /> : null}
            {c === value && c !== "default" ? <Icon name="check" size={18} style={{ color: NOTE_COLOR_HEX[c] ?? undefined }} /> : null}
          </button>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Etiquetas: chips removíveis + campo que cria com Enter; sugere as que já existem. */
function LabelsField({ value, onChange, suggestions }: { value: string[]; onChange: (labels: string[]) => void; suggestions: string[] }) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const l = raw.trim().toLowerCase().slice(0, 30);
    if (!l || value.includes(l) || value.length >= 10) return;
    onChange([...value, l]);
    setText("");
  };
  const pending = suggestions.filter((s) => !value.includes(s) && (!text || s.includes(text.trim().toLowerCase()))).slice(0, 6);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((l) => (
          <span key={l} className="inline-flex h-7 items-center gap-1 rounded-full bg-ink/8 pr-1 pl-2.5 text-[13px] font-medium">
            {l}
            <button type="button" aria-label={`Remover etiqueta ${l}`} onClick={() => onChange(value.filter((x) => x !== l))} className="flex size-5 items-center justify-center rounded-full hover:bg-ink/10">
              <Icon name="close" size={14} />
            </button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(text);
            }
          }}
          placeholder={value.length ? "+ etiqueta" : "Adicionar etiqueta…"}
          aria-label="Nova etiqueta"
          className="h-7 min-w-[120px] flex-1 bg-transparent text-[13px] outline-none placeholder:text-mut"
        />
      </div>
      {pending.length ? (
        <div className="flex flex-wrap gap-1.5">
          {pending.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="h-7 rounded-full border border-dashed border-mut/50 px-2.5 text-[13px] text-mut hover:text-ink">
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Checklist editável: Enter cria o próximo item, Backspace num item vazio apaga; marcados descem. */
function ChecklistEditor({ items, onChange }: { items: NoteItem[]; onChange: (items: NoteItem[]) => void }) {
  const refs = useRef(new Map<string, HTMLInputElement>());
  const focus = (id: string) => requestAnimationFrame(() => refs.current.get(id)?.focus());
  const patch = (id: string, p: Partial<NoteItem>) => onChange(items.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const insertAfter = (id: string) => {
    const item = newItem();
    const at = items.findIndex((i) => i.id === id);
    onChange([...items.slice(0, at + 1), item, ...items.slice(at + 1)]);
    focus(item.id);
  };
  const remove = (id: string) => {
    const open = items.filter((i) => !i.done);
    const prev = open[open.findIndex((i) => i.id === id) - 1];
    onChange(items.filter((i) => i.id !== id));
    if (prev) focus(prev.id);
  };
  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  const row = (i: NoteItem) => (
    <div key={i.id} className="group flex items-center gap-2.5">
      <CheckCircle checked={i.done} onCheckedChange={(c) => patch(i.id, { done: c })} size={22} label={i.text || "Item"} />
      <input
        ref={(el) => {
          if (el) refs.current.set(i.id, el);
          else refs.current.delete(i.id);
        }}
        value={i.text}
        onChange={(e) => patch(i.id, { text: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            insertAfter(i.id);
          } else if (e.key === "Backspace" && !i.text) {
            e.preventDefault();
            remove(i.id);
          }
        }}
        placeholder="Item"
        aria-label="Texto do item"
        className={cn("h-9 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mut", i.done && "text-mut line-through")}
      />
      <button
        type="button"
        aria-label={`Remover ${i.text || "item"}`}
        onClick={() => remove(i.id)}
        className="flex size-8 items-center justify-center rounded-full text-mut hover:bg-ink/10 hover:text-ink [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col">
      {open.map(row)}
      <button
        type="button"
        onClick={() => {
          const item = newItem();
          onChange([...open, item, ...done]);
          focus(item.id);
        }}
        className="flex h-9 items-center gap-2.5 text-[15px] text-mut hover:text-ink"
      >
        <Icon name="add" size={22} />
        Item
      </button>
      {done.length ? (
        <>
          <div className="mt-2 mb-1 border-t border-ink/10 pt-3 text-[13px] font-medium text-mut">
            {done.length === 1 ? "1 item marcado" : `${done.length} itens marcados`}
          </div>
          {done.map(row)}
        </>
      ) : null}
    </div>
  );
}

function ReminderField({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);
  const day = value?.slice(0, 10) ?? today;
  const time = value?.slice(11, 16) ?? "09:00";
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-ink/5 px-3 py-2.5">
      <Icon name="alarm" size={22} className="text-g" />
      <div className="min-w-[90px] flex-1 text-[15px] font-medium">{value ? reminderLabel(value, today, tomorrow) : "Lembrar"}</div>
      {value ? (
        <>
          <input
            type="date"
            value={day}
            min={today}
            onChange={(e) => e.target.value && onChange(reminderAtFrom(e.target.value, time))}
            aria-label="Dia do lembrete"
            className="num h-9 rounded-full bg-sf px-3 text-sm text-ink outline-none"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => e.target.value && onChange(reminderAtFrom(day, e.target.value))}
            aria-label="Horário do lembrete"
            className="num h-9 rounded-full bg-sf px-3 text-sm text-ink outline-none"
          />
        </>
      ) : null}
      <Switch checked={!!value} onCheckedChange={(on) => onChange(on ? reminderAtFrom(day, time) : null)} aria-label="Lembrar" />
    </div>
  );
}

/**
 * Editor estilo Keep: abre por cima da grade, salva ao fechar (nada de botão
 * "salvar" pra esquecer). Nota nova vazia é descartada.
 */
export function NoteEditor({
  note,
  initial,
  open,
  onOpenChange,
  labelSuggestions,
}: {
  /** Nota existente; sem ela, cria uma nova a partir de `initial`. */
  note?: Note;
  initial?: Partial<NoteDraft>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelSuggestions: string[];
}) {
  const [draft, setDraft] = useState<NoteDraft>(() => (note ? toDraft(note) : { ...EMPTY_DRAFT, ...initial }));
  const [showLabels, setShowLabels] = useState(draft.labels.length > 0);
  const [showReminder, setShowReminder] = useState(!!draft.reminderAt);
  const [confirming, setConfirming] = useState(false);
  const create = useCreateNote();
  const update = useUpdateNote();
  const del = useDeleteNote(() => {
    setConfirming(false);
    onOpenChange(false);
  });
  const ensurePush = useEnsurePush();
  const patch = (p: Partial<NoteDraft>) => setDraft((d) => ({ ...d, ...p }));

  const close = () => {
    const items = draft.items.filter((i) => i.text.trim());
    const input: NoteInput = { ...draft, items };
    const empty = isEmptyNote({ title: draft.title, body: draft.body, items });
    if (note) {
      const changed = DRAFT_KEYS.some((k) => JSON.stringify(input[k]) !== JSON.stringify(note[k]));
      // Apagou todo o conteúdo de uma nota existente: pergunta se é pra excluir.
      if (changed && empty) {
        setConfirming(true);
        return;
      }
      if (changed) {
        update.mutate({ id: note.id, input });
        if (input.reminderAt && input.reminderAt !== note.reminderAt) void ensurePush();
      }
    } else if (!empty) {
      create.mutate(input);
      if (input.reminderAt) void ensurePush();
    }
    onOpenChange(false);
  };

  const toggleChecklist = () =>
    draft.checklist
      ? patch({ checklist: false, body: itemsToBody(draft.items), items: [] })
      : patch({ checklist: true, items: draft.body.trim() ? bodyToItems(draft.body) : [newItem()], body: "" });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => (o ? onOpenChange(true) : close())}
        title={note ? "Editar nota" : "Nova nota"}
        className="max-w-[620px]"
      >
        <div className="flex min-h-0 flex-1 flex-col" style={{ background: noteBackground(draft.color) }}>
          <div className="flex shrink-0 items-start gap-2 px-5 pt-4">
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value.slice(0, 140) })}
              placeholder="Título"
              aria-label="Título da nota"
              className="h-10 min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none placeholder:text-mut"
            />
            <ToolButton icon="push_pin" label={draft.pinned ? "Desafixar" : "Fixar"} active={draft.pinned} onClick={() => patch({ pinned: !draft.pinned })} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-5 pt-1 pb-4">
            {draft.checklist ? (
              <ChecklistEditor items={draft.items} onChange={(items) => patch({ items })} />
            ) : (
              <textarea
                autoFocus={!note}
                value={draft.body}
                onChange={(e) => patch({ body: e.target.value.slice(0, 5000) })}
                placeholder="Criar uma nota…"
                aria-label="Texto da nota"
                rows={6}
                className="field-sizing-content min-h-[140px] w-full resize-none bg-transparent text-[15px] leading-[1.5] outline-none placeholder:text-mut"
              />
            )}
            {showReminder ? (
              <ReminderField
                value={draft.reminderAt}
                onChange={(reminderAt) => {
                  patch({ reminderAt });
                  if (!reminderAt) setShowReminder(false);
                }}
              />
            ) : null}
            {showLabels ? <LabelsField value={draft.labels} onChange={(labels) => patch({ labels })} suggestions={labelSuggestions} /> : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 border-t border-ink/10 px-3 py-2">
            <ToolButton
              icon={draft.checklist ? "notes" : "check_box"}
              label={draft.checklist ? "Virar texto" : "Virar checklist"}
              onClick={toggleChecklist}
            />
            <ColorPicker value={draft.color} onChange={(color) => patch({ color })} />
            <ToolButton
              icon="add_alert"
              label="Lembrete"
              active={showReminder}
              onClick={() => {
                if (showReminder) patch({ reminderAt: null });
                else patch({ reminderAt: draft.reminderAt ?? reminderAtFrom(addDaysISO(todayISO(), 1), "09:00") });
                setShowReminder(!showReminder);
              }}
            />
            <ToolButton icon="label" label="Etiquetas" active={showLabels} onClick={() => setShowLabels(!showLabels)} />
            {note ? <ToolButton icon="delete" label="Excluir nota" onClick={() => setConfirming(true)} /> : null}
            <div className="flex-1" />
            <button type="button" onClick={close} className="h-10 rounded-full px-4 text-sm font-semibold hover:bg-ink/10">
              Fechar
            </button>
          </div>
        </div>
      </Dialog>
      {note ? (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title="Excluir nota?"
          text={note.reminderAt ? "O lembrete dela também é cancelado. Essa ação não pode ser desfeita." : "Essa ação não pode ser desfeita."}
          confirmLabel="Excluir"
          busy={del.isPending}
          onConfirm={() => del.mutate(note.id)}
        />
      ) : null}
    </>
  );
}
