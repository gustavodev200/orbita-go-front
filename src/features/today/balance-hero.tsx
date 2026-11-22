"use client";

import Link from "next/link";

import { Icon } from "@/components/orbita/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummary } from "@/features/finance/hooks";
import { monthName, todayISO } from "@/lib/dates";
import { formatBRL, MINUS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

/** Card escuro de destaque: saldo do mês + entradas/saídas + "Novo lançamento". */
export function BalanceHero({ className }: { className?: string }) {
  const month = todayISO().slice(0, 7);
  const summary = useSummary(month);
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const s = summary.data;

  return (
    <section
      className={cn("relative overflow-hidden rounded-[28px] bg-[#141416] p-5 text-white lg:p-6 dark:bg-[#1f1f23]", className)}
    >
      <div aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-g/25 blur-2xl" />
      <div aria-hidden className="absolute -right-6 -bottom-20 size-40 rounded-full bg-g/15 blur-xl" />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="text-sm leading-none text-white/60">Saldo de {monthName(month).toLowerCase()}</div>
          <Link href="/financas" className="flex items-center gap-0.5 text-sm leading-none text-white/80 no-underline hover:text-white">
            Extrato
            <Icon name="chevron_right" size={18} />
          </Link>
        </div>
        {summary.isPending ? (
          <Skeleton className="h-10 w-48 rounded-full bg-white/10" />
        ) : (
          <div className="num text-[38px] leading-none font-semibold tracking-[-.03em] lg:text-[44px]">
            {s ? `${s.balanceCents < 0 ? MINUS : ""}${formatBRL(Math.abs(s.balanceCents))}` : "—"}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[13px] leading-none">
            <Icon name="south_west" size={16} className="text-[#4ade80]" />
            <span className="num">{s ? formatBRL(s.incomeCents, { compact: true }) : "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[13px] leading-none">
            <Icon name="north_east" size={16} className="text-[#f87171]" />
            <span className="num">{s ? formatBRL(s.expenseCents, { compact: true }) : "—"}</span>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => openTxSheet()}
            className="flex h-11 items-center gap-1.5 rounded-full bg-g px-5 text-sm leading-none font-medium text-white transition-colors hover:bg-gd"
          >
            <Icon name="add" size={20} />
            Lançar
          </button>
        </div>
      </div>
    </section>
  );
}
