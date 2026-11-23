"use client";

import { useState } from "react";

import { Icon } from "@/components/orbita/icon";
import { SegmentedControl } from "@/components/orbita/segmented-control";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Flashcard } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";
import { useCreateFlashcard, useDeleteFlashcard, useFlashcards, useReviewFlashcard, useReviewQueue } from "./hooks";
import { accuracy, summarize, type ReviewResult } from "./review";

type Tab = "review" | "list";
const TABS: { value: Tab; label: string }[] = [
  { value: "review", label: "Revisar" },
  { value: "list", label: "Meus cards" },
];

/** Rodada: mostra o termo em português, a pessoa lembra o inglês, vira e se avalia. */
function ReviewSession() {
  const queue = useReviewQueue();
  const review = useReviewFlashcard();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, ReviewResult>>({});
  const cards = queue.data ?? [];
  const card = cards[index];

  const answer = (result: ReviewResult) => {
    if (!card) return;
    review.mutate({ id: card.id, result });
    setResults((r) => ({ ...r, [card.id]: result }));
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setResults({});
    void queue.refetch();
  };

  return (
    <QueryState
      query={queue}
      rows={2}
      isEmpty={cards.length === 0}
      frame={(node) => <Card>{node}</Card>}
      empty={
        <EmptyState
          icon="translate"
          title="Nenhum card ainda"
          text="Converse em inglês com o Claude e escreva em português o que não souber — os cards chegam aqui sozinhos."
        />
      }
    >
      {card ? (
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-mut">
            <span>
              Card {index + 1} de {cards.length}
            </span>
            <span>{summarize(results, cards).correct} acerto(s)</span>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Mostrar português" : "Mostrar resposta em inglês"}
            className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[28px] bg-sf p-6 text-center shadow-card transition-transform active:scale-[.99]"
          >
            <span className="text-xs tracking-wide text-mut uppercase">{flipped ? "Inglês" : "Como se diz em inglês?"}</span>
            <span className="text-[28px] leading-[1.2] font-semibold text-balance text-ink">{flipped ? card.en : card.pt}</span>
            {flipped && card.example ? <span className="max-w-[380px] text-[15px] text-pretty text-mut italic">“{card.example}”</span> : null}
            {flipped && card.note ? <span className="max-w-[380px] text-[13px] text-pretty text-mut">{card.note}</span> : null}
            {!flipped ? <span className="text-[13px] text-mut">Toque para ver a resposta</span> : null}
          </button>
          {flipped ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary-danger" onClick={() => answer("wrong")}>
                <Icon name="close" size={20} />
                Errei
              </Button>
              <Button onClick={() => answer("correct")}>
                <Icon name="check" size={20} />
                Acertei
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setFlipped(true)}>
              Mostrar resposta
            </Button>
          )}
        </div>
      ) : (
        <RoundSummary results={results} cards={cards} onRestart={restart} />
      )}
    </QueryState>
  );
}

function RoundSummary({ results, cards, onRestart }: { results: Record<string, ReviewResult>; cards: Flashcard[]; onRestart: () => void }) {
  const { correct, total, missed } = summarize(results, cards);
  return (
    <Card className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-3 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-gs text-g">
        <Icon name="emoji_events" size={30} />
      </div>
      <div className="text-lg font-semibold">
        {correct} de {total} certos
      </div>
      {missed.length ? (
        <div className="flex flex-col gap-1 text-sm text-mut">
          <span>Para reforçar:</span>
          {missed.map((c) => (
            <span key={c.id}>
              <b className="text-ink">{c.pt}</b> → {c.en}
            </span>
          ))}
        </div>
      ) : (
        <p className="m-0 text-sm text-mut">Rodada perfeita!</p>
      )}
      <Button size="sm" className="mt-2" onClick={onRestart}>
        Nova rodada
      </Button>
    </Card>
  );
}

function AddCardForm() {
  const [pt, setPt] = useState("");
  const [en, setEn] = useState("");
  const [example, setExample] = useState("");
  const create = useCreateFlashcard(() => {
    setPt("");
    setEn("");
    setExample("");
  });
  const canSave = pt.trim() && en.trim() && !create.isPending;
  return (
    <Card>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) create.mutate({ pt, en, example: example || null });
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input tone="muted" placeholder="Português (ex.: dona de casa)" aria-label="Português" value={pt} onChange={(e) => setPt(e.target.value)} maxLength={120} />
          <Input tone="muted" placeholder="Inglês (ex.: homemaker)" aria-label="Inglês" value={en} onChange={(e) => setEn(e.target.value)} maxLength={120} />
        </div>
        <Input tone="muted" placeholder="Exemplo em inglês (opcional)" aria-label="Exemplo" value={example} onChange={(e) => setExample(e.target.value)} maxLength={300} />
        <Button size="sm" type="submit" disabled={!canSave} className="self-end">
          <Icon name="add" size={18} />
          Adicionar card
        </Button>
      </form>
    </Card>
  );
}

function CardRow({ card }: { card: Flashcard }) {
  const del = useDeleteFlashcard();
  const acc = accuracy(card);
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">
          {card.pt} <span className="font-normal text-mut">→</span> {card.en}
        </div>
        {card.example ? <div className="mt-1 truncate text-[13px] text-mut italic">{card.example}</div> : null}
      </div>
      <span className={cn("shrink-0 text-xs", acc === null ? "text-mut" : acc >= 70 ? "text-g" : "text-r")}>
        {acc === null ? "novo" : `${acc}%`}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Opções de ${card.pt}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 data-[state=open]:bg-sf2"
        >
          <Icon name="more_horiz" size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start">
          <DropdownMenuItem tone="danger" disabled={del.isPending} onSelect={() => del.mutate(card.id)}>
            <Icon name="delete" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CardList() {
  const [q, setQ] = useState("");
  const cards = useFlashcards(q.trim());
  const list = cards.data ?? [];
  return (
    <div className="flex flex-col gap-4">
      <AddCardForm />
      <Input
        placeholder="Buscar em português ou inglês"
        aria-label="Buscar cards"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        icon={<Icon name="search" size={20} className="text-mut" />}
      />
      <QueryState
        query={cards}
        rows={4}
        isEmpty={list.length === 0}
        frame={(node) => <Card>{node}</Card>}
        empty={<EmptyState icon="translate" title={q ? "Nada encontrado" : "Nenhum card ainda"} text={q ? "Tente outra palavra." : "Adicione acima ou deixe o Claude criar durante a conversa."} />}
      >
        <Card padding="none" className="flex flex-col px-5 [&>*+*]:border-t [&>*+*]:border-sf2">
          {list.map((c) => (
            <CardRow key={c.id} card={c} />
          ))}
        </Card>
      </QueryState>
    </div>
  );
}

/** Vocabulário de inglês: rodada de revisão + lista dos cards (criados aqui ou pelo Claude via MCP). */
export function VocabScreen() {
  const [tab, setTab] = useState<Tab>("review");
  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl value={tab} onChange={setTab} options={TABS} ariaLabel="Modo" className="w-full max-w-[320px]" />
      {tab === "review" ? <ReviewSession /> : <CardList />}
    </div>
  );
}
