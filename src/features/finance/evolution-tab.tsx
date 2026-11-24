"use client";

import { useMemo } from "react";

import { BarChart, HBarList, LineChart } from "@/components/orbita/charts";
import { IconTile } from "@/components/orbita/icon-tile";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Card, CardTitle } from "@/components/ui/card";
import { findCategory } from "@/lib/categories";
import { softOf } from "@/lib/colors";
import { MONTHS, monthLabel, monthName } from "@/lib/dates";
import { formatBRL, MINUS } from "@/lib/format";
import { useCategories, useCompare } from "@/features/me/hooks";
import { useEvolution } from "@/features/finance/hooks";
import { useAppStore } from "@/stores/app-store";

/** Entradas azul / saídas laranja-escuro: par validado (CVD e contraste) nos dois temas. */
const SERIES = [
  { name: "Entradas", color: "var(--b)" },
  { name: "Saídas", color: "var(--gd)" },
];

const shortMonth = (m: string) => MONTHS[Number(m.slice(5, 7)) - 1].slice(0, 3);

/** Eixo: "R$ 12 mil" em vez de "R$ 12.000,00". */
function axisBRL(cents: number): string {
  const reais = cents / 100;
  if (Math.abs(reais) >= 1000) return `${reais < 0 ? MINUS : ""}R$ ${(Math.abs(reais) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return formatBRL(cents, { compact: true });
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card padding="none" className="flex flex-col gap-2 p-4">
      <div className="text-[13px] leading-none text-mut">{label}</div>
      <div className="num text-[22px] leading-none font-semibold tracking-[-.02em]">{value}</div>
      {hint ? <div className="text-xs leading-none text-mut">{hint}</div> : null}
    </Card>
  );
}

/** Evolução: entradas × saídas dos últimos 12 meses, saldo acumulado e gastos por categoria. */
export function EvolutionTab() {
  const evolution = useEvolution(12);
  const compare = useCompare();
  const categories = useCategories();
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const months = useMemo(() => evolution.data ?? [], [evolution.data]);

  const totals = useMemo(() => {
    const income = months.reduce((a, m) => a + m.incomeCents, 0);
    const expense = months.reduce((a, m) => a + m.expenseCents, 0);
    const active = months.filter((m) => m.incomeCents || m.expenseCents).length || 1;
    return { income, expense, net: income - expense, avgExpense: Math.round(expense / active) };
  }, [months]);

  const cumulative = useMemo(
    () =>
      months.reduce<{ label: string; title: string; value: number }[]>(
        (out, m) => [
          ...out,
          { label: shortMonth(m.month), title: monthLabel(m.month), value: (out.at(-1)?.value ?? 0) + m.incomeCents - m.expenseCents },
        ],
        [],
      ),
    [months],
  );

  const current = compare.data?.current;
  const byCategory = (current?.byCategory ?? [])
    .filter((c) => c.cents > 0)
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 6);
  const previousTotal = compare.data?.previous.totalCents ?? 0;
  const diffPct = previousTotal > 0 && current ? Math.round(((current.totalCents - previousTotal) / previousTotal) * 100) : null;

  const isEmpty = months.every((m) => !m.incomeCents && !m.expenseCents);

  return (
    <QueryState
      query={evolution}
      rows={4}
      isEmpty={isEmpty}
      frame={(node) => (
        <Card radius="lg" padding="lg">
          {node}
        </Card>
      )}
      empty={
        <EmptyState
          icon="monitoring"
          title="Sem histórico ainda"
          text="Registre entradas e saídas e acompanhe aqui como seu dinheiro evolui mês a mês."
          ctaLabel="Novo lançamento"
          onCta={() => openTxSheet()}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Entradas (12 meses)" value={formatBRL(totals.income, { compact: true })} />
          <Stat label="Saídas (12 meses)" value={formatBRL(totals.expense, { compact: true })} />
          <Stat
            label="Sobrou no período"
            value={`${totals.net < 0 ? MINUS : ""}${formatBRL(Math.abs(totals.net), { compact: true })}`}
            hint={totals.income > 0 ? `${Math.round((totals.net / totals.income) * 100)}% do que entrou` : undefined}
          />
          <Stat label="Gasto médio por mês" value={formatBRL(totals.avgExpense, { compact: true })} />
        </div>

        <Card className="flex flex-col gap-4">
          <CardTitle>Entradas e saídas por mês</CardTitle>
          <BarChart
            caption="Entradas e saídas por mês, últimos 12 meses"
            data={months.map((m) => ({ label: shortMonth(m.month), title: monthLabel(m.month), values: [m.incomeCents, m.expenseCents] }))}
            series={SERIES}
            format={axisBRL}
            height={220}
          />
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <div>
              <CardTitle>Saldo acumulado</CardTitle>
              <p className="m-0 mt-1.5 text-[13px] leading-[1.4] text-mut">Quanto sobrou (ou faltou) somando mês a mês.</p>
            </div>
            <LineChart caption="Saldo acumulado nos últimos 12 meses" data={cumulative} color="var(--ink)" name="Saldo acumulado" format={axisBRL} />
          </Card>

          <Card className="flex flex-col gap-4">
            <div>
              <CardTitle>Gastos de {current ? monthName(current.month).toLowerCase() : "este mês"}</CardTitle>
              {diffPct !== null ? (
                <p className="m-0 mt-1.5 text-[13px] leading-[1.4] text-mut">
                  {diffPct === 0 ? "Igual ao mês passado" : `${Math.abs(diffPct)}% ${diffPct > 0 ? "a mais" : "a menos"} que no mês passado`}
                </p>
              ) : null}
            </div>
            {byCategory.length ? (
              <HBarList
                caption="Gastos por categoria no mês"
                format={(v) => formatBRL(v)}
                items={byCategory.map((c) => {
                  const cat = findCategory(categories, c.key);
                  return {
                    key: c.key,
                    label: cat.name,
                    value: c.cents,
                    icon: <IconTile icon={cat.icon} color={cat.color} soft={softOf(cat.color)} variant="soft" size={36} />,
                  };
                })}
              />
            ) : (
              <EmptyState compact icon="donut_large" title="Nenhum gasto no mês" text="Os gastos por categoria aparecem aqui." />
            )}
          </Card>
        </div>
      </div>
    </QueryState>
  );
}
