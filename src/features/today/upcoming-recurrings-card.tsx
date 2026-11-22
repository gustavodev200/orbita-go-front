"use client";

import { AmountDisplay } from "@/components/orbita/amount-display";
import { Icon } from "@/components/orbita/icon";
import { IconTile } from "@/components/orbita/icon-tile";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recurring } from "@/lib/api/schemas";
import { findCategory } from "@/lib/categories";
import { softOf } from "@/lib/colors";
import { diffDays, formatDM, relativeDays, todayISO } from "@/lib/dates";
import { useCategories } from "@/features/me/hooks";
import { usePayRecurring, useUpcomingRecurrings } from "@/features/finance/hooks";
import { useAppStore } from "@/stores/app-store";

function RecurringRow({ r }: { r: Recurring }) {
  const categories = useCategories();
  const pay = usePayRecurring();
  const today = todayISO();
  const cat = findCategory(categories, r.categoryKey);
  const due = r.dueDate?.slice(0, 10);
  const hot = due ? diffDays(today, due) <= 1 : false;
  const paid = r.status === "paid" || pay.isSuccess;

  return (
    <div className="flex items-center gap-3 py-2.5">
      <IconTile icon={cat.icon} color={cat.color} soft={softOf(cat.color)} variant="soft" size={42} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] leading-[1.25] font-medium">{r.description}</div>
        {due ? (
          <div className="mt-1 text-xs leading-none" style={{ color: hot && !paid ? "var(--r)" : "var(--mut)" }}>
            {formatDM(due)} · {relativeDays(due, today)}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <AmountDisplay cents={r.amountCents} type={r.type} size="sm" className={r.type === "expense" ? "text-ink" : undefined} />
        {r.type === "expense" ? (
          paid ? (
            <span className="flex items-center gap-0.5 text-xs leading-none text-okd">
              <Icon name="check" size={14} />
              Pago
            </span>
          ) : (
            <Button
              variant="link"
              className="text-xs!"
              disabled={pay.isPending}
              onClick={() => pay.mutate({ id: r.id, month: due?.slice(0, 7), name: r.description })}
            >
              Marcar pago
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}

/** Contas fixas dos próximos 7 dias com "Marcar pago". */
export function UpcomingRecurringsCard({ className }: { className?: string }) {
  const upcoming = useUpcomingRecurrings(7);
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const list = upcoming.data ?? [];
  return (
    <Card className={className}>
      <div className="flex flex-col gap-2">
        <CardHeader className="items-baseline">
          <CardTitle>Próximas contas</CardTitle>
          <CardDescription>7 dias</CardDescription>
        </CardHeader>
        <QueryState
          query={upcoming}
          rows={3}
          compact
          isEmpty={list.length === 0}
          empty={
            <EmptyState
              compact
              icon="receipt_long"
              title="Nenhuma conta chegando"
              text="Marque um lançamento como recorrente e ele aparece aqui antes de vencer."
              ctaLabel="Adicionar recorrente"
              onCta={() => openTxSheet({ recurring: true })}
            />
          }
        >
          <div className="flex flex-col [&>*+*]:border-t [&>*+*]:border-sf2">
            {list.map((r) => (
              <RecurringRow key={r.id} r={r} />
            ))}
          </div>
        </QueryState>
      </div>
    </Card>
  );
}
