"use client";

import { AmountDisplay } from "@/components/orbita/amount-display";
import { IconTile } from "@/components/orbita/icon-tile";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardGroupHeader, CardRow } from "@/components/ui/card";
import type { Recurring, RecurringStatus } from "@/lib/api/schemas";
import { findCategory } from "@/lib/categories";
import { softOf } from "@/lib/colors";
import { currentMonth, formatDM, monthName } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import { useCategories } from "@/features/me/hooks";
import { useRecurrings } from "@/features/finance/hooks";
import { useAppStore } from "@/stores/app-store";

const FREQ_LABEL = { monthly: "Mensal", weekly: "Semanal", yearly: "Anual" } as const;
const STATUS: Record<RecurringStatus, { label: string; tone: "paid" | "pending" | "overdue" }> = {
  paid: { label: "Pago", tone: "paid" },
  pending: { label: "Pendente", tone: "pending" },
  overdue: { label: "Atrasado", tone: "overdue" },
};

function RecurringRow({ r }: { r: Recurring }) {
  const categories = useCategories();
  const cat = findCategory(categories, r.categoryKey);
  const status = STATUS[r.status ?? "pending"];
  return (
    <CardRow>
      <IconTile icon={cat.icon} color={cat.color} soft={softOf(cat.color)} variant="soft" size={42} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] leading-[1.25] font-medium">{r.description}</div>
        <div className="mt-1 text-xs leading-none text-mut">
          {FREQ_LABEL[r.frequency]}
          {r.dueDate ? ` · próximo ${formatDM(r.dueDate)}` : ""}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <AmountDisplay cents={r.amountCents} type={r.type} size="sm" className={r.type === "expense" ? "text-ink" : undefined} />
        <Badge tone={status.tone} size="sm">
          {status.label}
        </Badge>
      </div>
    </CardRow>
  );
}

/** Recorrentes: card "Comprometido" (barra empilhada) + listas com status. */
export function RecurringsTab() {
  const month = currentMonth();
  const recurrings = useRecurrings(month);
  const income = useAppStore((s) => s.me?.monthlyIncomeCents);
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const list = recurrings.data ?? [];
  const expenses = list.filter((r) => r.type === "expense");
  const incomes = list.filter((r) => r.type === "income");

  const sum = (s: RecurringStatus) =>
    expenses.filter((r) => (r.status ?? "pending") === s).reduce((a, r) => a + r.amountCents, 0);
  const paid = sum("paid");
  const pending = sum("pending");
  const overdue = sum("overdue");
  const total = paid + pending + overdue;
  const base = income && income > 0 ? income : Math.max(total, 1);
  const pct = (v: number) => `${Math.min(100, (v / base) * 100)}%`;

  const groups = [
    { title: "Contas fixas", items: expenses },
    { title: "Receitas fixas", items: incomes },
  ].filter((g) => g.items.length);

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <Card radius="lg" className="flex flex-col gap-3">
        <div className="text-[13px] leading-none font-medium text-mut">Comprometido em {monthName(month).toLowerCase()}</div>
        <AmountDisplay cents={total} size="stat" />
        <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-sf2" aria-hidden>
          <div className="rounded-full bg-ok transition-[width] duration-700" style={{ width: pct(paid) }} />
          <div className="rounded-full bg-y transition-[width] duration-700" style={{ width: pct(pending) }} />
          <div className="rounded-full bg-r transition-[width] duration-700" style={{ width: pct(overdue) }} />
        </div>
        {income ? (
          <div className="text-[13px] leading-[1.4] font-semibold text-mut">
            {Math.round((total / income) * 100)}% da renda de {formatBRL(income)}
          </div>
        ) : null}
        <div className="mt-1 flex flex-col gap-2">
          {[
            { label: "Pago", v: paid, c: "var(--ok)" },
            { label: "Pendente", v: pending, c: "var(--y)" },
            { label: "Atrasado", v: overdue, c: "var(--r)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-[13px] leading-none font-medium">
              <span className="size-2.5 rounded-full" style={{ background: l.c }} />
              {l.label}
              <span className="num ml-auto">{formatBRL(l.v)}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="flex flex-col gap-3.5">
        <QueryState
          query={recurrings}
          rows={4}
          isEmpty={list.length === 0}
          frame={(node) => (
            <Card radius="lg" padding="lg">
              {node}
            </Card>
          )}
          empty={
            <EmptyState
              icon="event_repeat"
              title="Nenhuma conta fixa ainda"
              text="Aluguel, internet, salário… cadastre uma vez e acompanhe o vencimento todo mês."
              ctaLabel="Adicionar recorrente"
              onCta={() => openTxSheet({ recurring: true })}
            />
          }
        >
          {groups.map((g) => (
            <Card key={g.title} radius="lg" padding="none" className="overflow-hidden">
              <CardGroupHeader>{g.title}</CardGroupHeader>
              {g.items.map((r) => (
                <RecurringRow key={r.id} r={r} />
              ))}
            </Card>
          ))}
        </QueryState>
      </div>
    </div>
  );
}
