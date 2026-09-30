"use client";

import { motion } from "framer-motion";

import { AmountDisplay } from "@/components/orbita/amount-display";
import { Icon } from "@/components/orbita/icon";
import { IconTile } from "@/components/orbita/icon-tile";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="flex items-center gap-3 py-1.5">
      <IconTile icon={cat.icon} color={cat.color} soft={softOf(cat.color)} variant="soft" size={44} radius={14} iconSize={24} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[15px] leading-[1.2] font-extrabold">{r.description}</div>
        {due ? (
          <div className="mt-0.5 text-xs leading-[1.3] font-semibold" style={{ color: hot ? "var(--r)" : "var(--mut)" }}>
            {formatDM(due)} · {relativeDays(due, today)}
          </div>
        ) : null}
      </div>
      <AmountDisplay cents={r.amountCents} type={r.type} size="sm" className="text-ink" />
      {paid ? (
        <motion.div
          initial={{ scale: 0.4 }}
          animate={{ scale: [0.4, 1.2, 1] }}
          transition={{ duration: 0.35 }}
          className="flex h-9 shrink-0 items-center gap-1 rounded-xl bg-gs px-2.5 font-display text-xs leading-9 font-black text-gd"
        >
          <Icon name="check_circle" size={18} />
          PAGO
        </motion.div>
      ) : (
        <Button
          variant="secondary"
          size="xs"
          className="border-b-4 text-g active:translate-y-0.5"
          disabled={pay.isPending}
          onClick={() => pay.mutate({ id: r.id, month: due?.slice(0, 7), name: r.description })}
        >
          Paguei
        </Button>
      )}
    </div>
  );
}

/** Próximos recorrentes (7 dias) com "Paguei" → PAGO + 10 XP. */
export function UpcomingRecurringsCard({ className }: { className?: string }) {
  const upcoming = useUpcomingRecurrings(7);
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const list = upcoming.data ?? [];
  return (
    <Card className={className}>
      <div className="flex flex-col gap-3">
        <CardHeader className="items-baseline">
          <CardTitle>Próximos recorrentes</CardTitle>
          <CardDescription>7 dias</CardDescription>
        </CardHeader>
        <QueryState
          query={upcoming}
          rows={4}
          compact
          isEmpty={list.length === 0}
          empty={
            <EmptyState
              compact
              mood="feliz"
              title="Nenhuma conta fixa"
              text="Marque um lançamento como recorrente e eu te aviso antes de vencer."
              ctaLabel="Adicionar recorrente"
              onCta={() => openTxSheet({ recurring: true })}
            />
          }
        >
          <div className="flex flex-col">
            {list.map((r) => (
              <RecurringRow key={r.id} r={r} />
            ))}
          </div>
        </QueryState>
      </div>
    </Card>
  );
}
