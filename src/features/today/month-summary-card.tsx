"use client";

import Link from "next/link";

import { AmountDisplay } from "@/components/orbita/amount-display";
import { Icon } from "@/components/orbita/icon";
import { ErrorState, LoadingState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { daysInMonth, monthName, todayISO } from "@/lib/dates";
import { useSummary } from "@/features/finance/hooks";

/** Resumo do mês: saldo, entradas/saídas e mini barras de gasto diário. */
export function MonthSummaryCard({ className }: { className?: string }) {
  const today = todayISO();
  const month = today.slice(0, 7);
  const summary = useSummary(month);
  const s = summary.data;
  const lastDay = daysInMonth(month);
  const todayNum = Number(today.slice(8, 10));

  const spend = Array.from({ length: todayNum }, (_, i) => s?.daily.find((d) => d.day === i + 1)?.expenseCents ?? 0);
  const max = Math.max(1, ...spend);

  return (
    <Card className={className}>
      <div className="flex flex-col gap-4">
        <CardHeader>
          <CardTitle>{monthName(month)}</CardTitle>
          <Button asChild variant="link">
            <Link href="/financas">Extrato</Link>
          </Button>
        </CardHeader>
        {summary.isPending ? (
          <LoadingState rows={2} />
        ) : summary.isError || !s ? (
          <ErrorState compact onRetry={() => summary.refetch()} />
        ) : (
          <>
            <div>
              <div className="text-[13px] leading-none font-bold text-mut">Saldo do mês</div>
              <AmountDisplay cents={s.balanceCents} size="balance" className="mt-1.5 block" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-bs px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[13px] leading-none font-bold text-bdk">
                  <Icon name="south_west" size={18} />
                  Entradas
                </div>
                <AmountDisplay cents={s.incomeCents} type="income" size="lg" className="mt-1.5 block" />
              </div>
              <div className="rounded-2xl bg-rs px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[13px] leading-none font-bold text-rd">
                  <Icon name="north_east" size={18} />
                  Saídas
                </div>
                <AmountDisplay cents={s.expenseCents} type="expense" size="lg" className="mt-1.5 block" />
              </div>
            </div>
            <div>
              <div className="flex h-16 items-end gap-[3px]" aria-label="Gasto por dia">
                {spend.map((v, i) => {
                  const h = Math.max(6, Math.round((v / max) * 100));
                  const isToday = i === spend.length - 1;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[4px] rounded-b-[2px] transition-[height] duration-500"
                      style={{ height: `${h}%`, background: isToday ? "var(--r)" : h > 60 ? "var(--rs)" : "var(--sf2)" }}
                    />
                  );
                })}
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] leading-none font-semibold text-mut">
                <span>01/{month.slice(5, 7)}</span>
                <span>gasto por dia</span>
                <span>
                  {String(lastDay).padStart(2, "0")}/{month.slice(5, 7)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
