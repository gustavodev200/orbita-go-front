"use client";

import { useMemo, useState } from "react";

import { AmountDisplay } from "@/components/orbita/amount-display";
import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Icon } from "@/components/orbita/icon";
import { IconTile } from "@/components/orbita/icon-tile";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Card, CardGroupHeader, CardRow } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction, TxType } from "@/lib/api/schemas";
import { findCategory } from "@/lib/categories";
import { softOf } from "@/lib/colors";
import { currentMonth, dayGroupLabel, monthLabel, monthName, shiftMonth } from "@/lib/dates";
import { formatBRL, MINUS } from "@/lib/format";
import { useAccounts, useCategories } from "@/features/me/hooks";
import { useDeleteTransaction, useTransactions } from "@/features/finance/hooks";
import { useAppStore } from "@/stores/app-store";

const TYPES: { value: "all" | TxType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "expense", label: "Saídas" },
  { value: "income", label: "Entradas" },
];

function signedTotal(items: Transaction[]) {
  return items.reduce((acc, t) => acc + (t.type === "expense" ? -t.amountCents : t.amountCents), 0);
}

/** Seletor de mês "‹ Setembro 2026 ›". */
export function MonthPicker({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  return (
    <div className="flex h-10 items-center gap-1 rounded-full bg-sf px-1 shadow-card">
      <button
        type="button"
        aria-label="Mês anterior"
        onClick={() => onChange(shiftMonth(month, -1))}
        className="flex size-[34px] items-center justify-center text-mut hover:text-ink"
      >
        <Icon name="chevron_left" />
      </button>
      <div className="min-w-[118px] text-center text-sm leading-none font-medium">{monthLabel(month)}</div>
      <button
        type="button"
        aria-label="Próximo mês"
        onClick={() => onChange(shiftMonth(month, 1))}
        className="flex size-[34px] items-center justify-center text-mut hover:text-ink"
      >
        <Icon name="chevron_right" />
      </button>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const categories = useCategories();
  const accounts = useAccounts();
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const del = useDeleteTransaction();
  const cat = findCategory(categories, tx.categoryKey);
  const account = accounts.data?.find((a) => a.id === tx.accountId)?.name;

  return (
    <CardRow className="pr-3">
      <IconTile icon={cat.icon} color={cat.color} soft={softOf(cat.color)} variant="soft" size={42} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] leading-[1.25] font-medium">{tx.description}</div>
        <div className="mt-1 text-xs leading-none text-mut">
          {cat.name}
          {account ? ` · ${account}` : ""}
        </div>
      </div>
      <AmountDisplay cents={tx.amountCents} type={tx.type} />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Opções"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent text-mut outline-none hover:bg-sf2 data-[state=open]:bg-sf2"
        >
          <Icon name="more_vert" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="start">
          <DropdownMenuItem tone="info" onSelect={() => openTxSheet({ editing: tx })}>
            <Icon name="edit" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem tone="danger" disabled={del.isPending} onSelect={() => del.mutate(tx.id)}>
            <Icon name="delete" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardRow>
  );
}

/** Extrato: mês, filtros Todos/Saídas/Entradas + Categoria, grupos por dia. */
export function StatementTab() {
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState<"all" | TxType>("all");
  const [category, setCategory] = useState("all");
  const categories = useCategories();
  const openTxSheet = useAppStore((s) => s.openTxSheet);

  const txs = useTransactions({
    month,
    ...(type !== "all" ? { type } : {}),
    ...(category !== "all" ? { category } : {}),
  });

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of txs.data ?? []) {
      const day = t.date.slice(0, 10);
      map.set(day, [...(map.get(day) ?? []), t]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [txs.data]);

  const filterCats = categories.filter((c) => type === "all" || c.type === type);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <MonthPicker month={month} onChange={setMonth} />
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((t) => (
            <ChoiceChip key={t.value} variant="ink" selected={type === t.value} onClick={() => setType(t.value)}>
              {t.label}
            </ChoiceChip>
          ))}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger icon="category" aria-label="Filtrar por categoria">
              <SelectValue placeholder="Categoria">
                {category === "all" ? "Categoria" : findCategory(categories, category).name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {filterCats.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <QueryState
        query={txs}
        rows={5}
        isEmpty={groups.length === 0}
        frame={(node) => (
          <Card radius="lg" padding="lg">
            {node}
          </Card>
        )}
        empty={
          <EmptyState
            title="Seu extrato está zerado"
            icon="receipt_long"
            text={`Nenhum lançamento em ${monthName(month).toLowerCase()}. Registre gastos e entradas para ver o extrato.`}
            ctaLabel="Novo lançamento"
            onCta={() => openTxSheet()}
          />
        }
      >
        <div className="flex flex-col gap-4">
          {groups.map(([day, items]) => {
            const total = signedTotal(items);
            return (
              <Card key={day} radius="lg" padding="none" className="overflow-hidden">
                <CardGroupHeader>
                  <span>{dayGroupLabel(day)}</span>
                  <span
                    className="num text-sm font-semibold tracking-normal normal-case"
                    style={{ color: total < 0 ? "var(--mut)" : "var(--ok)" }}
                  >
                    {total < 0 ? MINUS : "+"}
                    {formatBRL(Math.abs(total))}
                  </span>
                </CardGroupHeader>
                {items.map((t) => (
                  <TransactionRow key={t.id} tx={t} />
                ))}
              </Card>
            );
          })}
        </div>
      </QueryState>
    </>
  );
}
