"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Icon } from "@/components/orbita/icon";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Chama da ofensiva: loop scale 1 ↔ 1.15 + rotate ±3°. */
function Flame({ size = 26, duration = 1.6, className, color }: { size?: number; duration?: number; className?: string; color?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={cn("inline-flex", className)}
      animate={reduce ? undefined : { scale: [1, 1.15, 1], rotate: [-3, 3, -3] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      style={{ color }}
    >
      <Icon name="local_fire_department" size={size} />
    </motion.span>
  );
}

/** Moeda amarela com "$". */
function Coin({ size = 22, withSign = true, className }: { size?: number; withSign?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-y font-display font-black text-white", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.55),
        lineHeight: 1,
        boxShadow: `inset 0 -${size >= 20 ? 3 : 2}px 0 var(--yd)`,
      }}
    >
      {withSign ? "$" : null}
    </span>
  );
}

/** Quadrado roxo do nível. */
function LevelBadge({ level, size = 30, className }: { level: number; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center bg-p font-display font-black text-white", className)}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size / 3),
        fontSize: Math.round(size * 0.46),
        lineHeight: 1,
        boxShadow: `inset 0 -${size >= 40 ? 4 : 3}px 0 var(--pd)`,
      }}
    >
      {level}
    </span>
  );
}

type PillProps = { value: number; tinted?: boolean; className?: string; title?: string };

/** Ofensiva no header/biblioteca: fogo pulsando + número em --o. */
function StreakPill({ value, tinted, className, title = "Ofensiva" }: PillProps) {
  return (
    <div
      title={title}
      className={cn(
        "flex h-[38px] items-center gap-[3px] rounded-xl px-2.5 font-display text-[17px] leading-none font-black text-o",
        tinted && "h-10 bg-os text-lg",
        className,
      )}
    >
      <Flame />
      {formatNumber(value)}
    </div>
  );
}

/** Moedas: moeda amarela + número em --yd. */
function CoinPill({ value, tinted, className, title = "Moedas" }: PillProps) {
  return (
    <div
      title={title}
      className={cn(
        "flex h-[38px] items-center gap-[5px] rounded-xl px-2 font-display text-[17px] leading-none font-black text-yd",
        tinted && "h-10 gap-1.5 bg-ys px-3 text-lg",
        className,
      )}
    >
      <Coin />
      {formatNumber(value)}
    </div>
  );
}

/** Chip "+20 XP". */
function XpChip({ xp, className }: { xp: number; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-lg bg-ys px-2 py-1 font-display text-xs leading-none font-black text-yd", className)}>
      +{xp} XP
    </span>
  );
}

/** "(moeda) +5" pequeno ao lado da recompensa. */
function CoinReward({ coins, className }: { coins: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-display text-xs leading-none font-black text-yd", className)}>
      <Coin size={14} withSign={false} />+{coins}
    </span>
  );
}

export { Flame, Coin, LevelBadge, StreakPill, CoinPill, XpChip, CoinReward };
