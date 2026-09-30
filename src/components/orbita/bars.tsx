"use client";

import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { Progress, type ProgressTone } from "@/components/ui/progress";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Barra de XP amarela com rótulo "XP · Nível 7 … 1.240 / 1.500". */
function XpBar({
  xp,
  xpToNext = 1500,
  level,
  showLabel = true,
  size = "md",
  className,
}: {
  xp: number;
  xpToNext?: number;
  level?: number;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));
  return (
    <div className={cn("min-w-0", className)}>
      {showLabel ? (
        <div className="mb-2 flex justify-between font-display text-[13px] leading-none font-extrabold">
          <span>XP{level != null ? ` · Nível ${level}` : ""}</span>
          <span className="text-mut">
            {formatNumber(xp)} / {formatNumber(xpToNext)}
          </span>
        </div>
      ) : null}
      <Progress value={pct} tone="y" size={size} aria-label="Experiência" />
    </div>
  );
}

/** Tom do HP pela faixa: >50% verde, >20% amarelo, ≤20% vermelho. */
export function hpTone(pct: number): { bar: ProgressTone; text: string; low: boolean } {
  if (pct > 50) return { bar: "g", text: "var(--gd)", low: false };
  if (pct > 20) return { bar: "y", text: "var(--yd)", low: false };
  return { bar: "r", text: "var(--rd)", low: true };
}

/** Barra de vida (orçamento): "♥ HP 72% … resta R$ 170". */
function HpBar({ value, trailing, className }: { value: number; trailing?: React.ReactNode; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const tone = hpTone(pct);
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex justify-between font-display text-xs leading-none font-black tracking-[.05em] uppercase">
        <span className="flex items-center gap-1" style={{ color: tone.text }}>
          <Icon name="favorite" size={16} />
          HP {pct}%
        </span>
        {trailing ? <span className="num text-mut">{trailing}</span> : null}
      </div>
      <Progress value={pct} kind="hp" size="xl" tone={tone.bar} minFill={8} aria-label={`Vida ${pct}%`} />
    </div>
  );
}

export { XpBar, HpBar };
