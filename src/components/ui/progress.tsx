"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Barra de progresso do design system.
 * - kind "bar": trilho --sf2, preenchimento com `inset 0 -4px 0 rgba(0,0,0,.12)`.
 * - kind "hp":  trilho com padding 3px e brilho `inset 0 3px 0 rgba(255,255,255,.35)`.
 * A largura anima com spring com overshoot (~800ms).
 */
const trackVariants = cva("relative flex w-full overflow-hidden bg-sf2", {
  variants: {
    kind: { bar: "", hp: "p-[3px]" },
    size: { xs: "h-2.5 rounded-md", sm: "h-3.5 rounded-lg", md: "h-4 rounded-[9px]", lg: "h-[18px] rounded-[10px]", xl: "h-5 rounded-[11px]" },
  },
  defaultVariants: { kind: "bar", size: "sm" },
});

const TONES = {
  g: "var(--g)",
  b: "var(--b)",
  o: "var(--o)",
  y: "var(--y)",
  r: "var(--r)",
  p: "var(--p)",
  boss: "#FF5A6E",
} as const;
export type ProgressTone = keyof typeof TONES;

type ProgressProps = Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value"> &
  VariantProps<typeof trackVariants> & {
    value: number;
    tone?: ProgressTone;
    color?: string;
    /** largura mínima do preenchimento (HP nunca some por completo). */
    minFill?: number;
    indicatorClassName?: string;
  };

function Progress({
  className,
  value,
  kind,
  size,
  tone = "g",
  color,
  minFill,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  const hp = kind === "hp";
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={pct}
      className={cn(trackVariants({ kind, size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator asChild>
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 13, mass: 0.9 }}
          className={cn("h-full", indicatorClassName)}
          style={{
            minWidth: minFill,
            borderRadius: "inherit",
            background: color ?? TONES[tone],
            boxShadow: hp
              ? "inset 0 -4px 0 rgba(0,0,0,.15), inset 0 3px 0 rgba(255,255,255,.35)"
              : "inset 0 -4px 0 rgba(0,0,0,.12)",
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
