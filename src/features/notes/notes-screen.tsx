"use client";

import { useState } from "react";

import { CheckCircle } from "@/components/orbita/check-circle";
import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Note } from "@/lib/api/schemas";
import { addDaysISO, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { useCreateNote, useNotes, useUpdateNote } from "./hooks";
import { NoteEditor, type NoteDraft } from "./note-editor";
import { allLabels, filterNotes, newItem, noteBackground, reminderLabel } from "./note-utils";

const PREVIEW_ITEMS = 8;

/** Barra de captura: digita e Enter salva na hora; ícones abrem o editor completo. */
function QuickNote({ onExpand }: { onExpand: (initial: Partial<NoteDraft>) => void }) {
  const [text, setText] = useState("");
  const create = useCreateNote(() => setText(""));
  const save = () => {
    const t = text.trim();
    if (t && !create.isPending) create.mutate({ body: t });
  };
  return (
    <div className="flex items-center gap-1 rounded-full bg-sf py-1 pr-1.5 pl-5 shadow-card">
      <input
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 5000))}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="Anotar algo… (Enter salva)"
        aria-label="Nota rápida"
        className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mut"
      />
      <button
        type="button"
        aria-label="Nova checklist"
        title="Nova checklist"
        onClick={() => {
          onExpand({ checklist: true, items: [newItem(text.trim())] });
          setText("");
        }}
        className="flex size-11 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
      >
        <Icon name="check_box" size={22} />
      </button>
      <button
        type="button"
        aria-label="Nota completa"
        title="Nota completa (cor, etiquetas, lembrete)"
        onClick={() => {
          onExpand({ body: text });
          setText("");
        }}
        className="flex size-11 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
      >
        <Icon name="open_in_full" size={20} />
      </button>
    </div>
  );
}

function NoteCard({ note, onOpen }: { note: Note; onOpen: () => void }) {
  const update = useUpdateNote();
  const today = todayISO();
  const open = note.items.filter((i) => !i.done);
  const doneCount = note.items.length - open.length;
  const toggleItem = (id: string, done: boolean) =>
    update.mutate({ id: note.id, input: { items: note.items.map((i) => (i.id === id ? { ...i, done } : i)) } });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group mb-3 flex cursor-pointer break-inside-avoid flex-col gap-2 rounded-[20px] p-4 shadow-card transition-shadow outline-none hover:shadow-[0_4px_16px_rgba(0,0,0,.08)] focus-visible:ring-2 focus-visible:ring-[color:var(--g)]"
      style={{ background: noteBackground(note.color) }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 text-[15px] leading-[1.3] font-semibold break-words">{note.title}</div>
        <button
          type="button"
          aria-label={note.pinned ? "Desafixar" : "Fixar"}
          aria-pressed={note.pinned}
          onClick={(e) => {
            e.stopPropagation();
            update.mutate({ id: note.id, input: { pinned: !note.pinned } });
          }}
          className={cn(
            "-mt-1.5 -mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-opacity hover:bg-ink/10",
            note.pinned ? "text-ink" : "text-mut [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100",
          )}
        >
          <Icon name="push_pin" size={18} className={note.pinned ? "icon-fill" : undefined} />
        </button>
      </div>
      {note.checklist ? (
        <div className="flex flex-col gap-1">
          {open.slice(0, PREVIEW_ITEMS).map((i) => (
            <div key={i.id} className="flex items-start gap-2" onClick={(e) => e.stopPropagation()}>
              <CheckCircle checked={false} onCheckedChange={(c) => toggleItem(i.id, c)} size={20} label={i.text} className="mt-px" />
              <span className="min-w-0 flex-1 text-sm leading-[1.4] break-words">{i.text}</span>
            </div>
          ))}
          {open.length > PREVIEW_ITEMS ? <div className="text-[13px] text-mut">+ {open.length - PREVIEW_ITEMS} itens</div> : null}
          {doneCount ? <div className="text-[13px] text-mut">{doneCount === 1 ? "+ 1 item marcado" : `+ ${doneCount} itens marcados`}</div> : null}
        </div>
      ) : note.body ? (
        <p className="line-clamp-[12] text-sm leading-[1.5] break-words whitespace-pre-wrap">{note.body}</p>
      ) : null}
      {note.reminderAt || note.labels.length ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {note.reminderAt ? (
            <span
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-full bg-ink/8 px-2 text-xs font-medium",
                note.reminderAt.slice(0, 10) < today && "text-mut line-through",
              )}
            >
              <Icon name="alarm" size={14} />
              {reminderLabel(note.reminderAt, today, addDaysISO(today, 1))}
            </span>
          ) : null}
          {note.labels.map((l) => (
            <span key={l} className="inline-flex h-6 items-center rounded-full bg-ink/8 px-2 text-xs font-medium">
              {l}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NoteGrid({ notes, onOpen }: { notes: Note[]; onOpen: (n: Note) => void }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 xl:columns-4">
      {notes.map((n) => (
        <NoteCard key={n.id} note={n} onOpen={() => onOpen(n)} />
      ))}
    </div>
  );
}

type Editing = { note: Note } | { initial: Partial<NoteDraft> } | null;

/** Notas rápidas (estilo Keep): captura em 1 linha, grade colorida, fixadas no topo, busca e etiquetas. */
export function NotesScreen() {
  const notes = useNotes();
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const list = notes.data ?? [];
  const labels = allLabels(list);
  const activeLabel = label && labels.includes(label) ? label : null;
  const shown = filterNotes(list, query, activeLabel);
  const pinned = shown.filter((n) => n.pinned);
  const others = shown.filter((n) => !n.pinned);
  // Reabre sempre a versão mais nova da nota (a lista muda com updates otimistas).
  const editingNote = editing && "note" in editing ? (list.find((n) => n.id === editing.note.id) ?? editing.note) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <QuickNote onExpand={(initial) => setEditing({ initial })} />
      {list.length ? (
        <div className="flex flex-col gap-2.5">
          <Input
            tone="muted"
            icon={<Icon name="search" size={20} className="text-mut" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nas notas"
            aria-label="Buscar nas notas"
          />
          {labels.length ? (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <ChoiceChip size="xs" variant="ink" selected={!activeLabel} onClick={() => setLabel(null)}>
                Todas
              </ChoiceChip>
              {labels.map((l) => (
                <ChoiceChip key={l} size="xs" variant="ink" selected={activeLabel === l} onClick={() => setLabel(activeLabel === l ? null : l)}>
                  <Icon name="label" size={16} />
                  {l}
                </ChoiceChip>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <QueryState
        query={notes}
        rows={3}
        isEmpty={list.length === 0}
        frame={(node) => <Card>{node}</Card>}
        empty={
          <EmptyState
            icon="sticky_note_2"
            title="Nenhuma nota ainda"
            text="Ideias, listas de compras, recados: escreva na barra acima e aperte Enter."
            ctaLabel="Nova nota"
            onCta={() => setEditing({ initial: {} })}
          />
        }
      >
        {shown.length === 0 ? (
          <div className="py-10 text-center text-sm text-mut">Nenhuma nota encontrada.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {pinned.length ? (
              <section className="flex flex-col gap-2">
                <h2 className="px-1 text-xs font-semibold tracking-wide text-mut uppercase">Fixadas</h2>
                <NoteGrid notes={pinned} onOpen={(note) => setEditing({ note })} />
              </section>
            ) : null}
            {others.length ? (
              <section className="flex flex-col gap-2">
                {pinned.length ? <h2 className="px-1 text-xs font-semibold tracking-wide text-mut uppercase">Outras</h2> : null}
                <NoteGrid notes={others} onOpen={(note) => setEditing({ note })} />
              </section>
            ) : null}
          </div>
        )}
      </QueryState>
      {editing ? (
        <NoteEditor
          key={editingNote?.id ?? "new"}
          note={editingNote}
          initial={"initial" in editing ? editing.initial : undefined}
          open
          onOpenChange={(o) => !o && setEditing(null)}
          labelSuggestions={labels}
        />
      ) : null}
    </div>
  );
}
