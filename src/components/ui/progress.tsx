"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Barra de progresso fina e arredondada. A largura anima suave (~600ms).
 */
const trackVariants = cva("relative flex w-full overflow-hidden bg-sf2", {
  variants: {
    kind: { bar: "", hp: "" },
    size: { xs: "h-1.5 rounded-full", sm: "h-2 rounded-full", md: "h-2.5 rounded-full", lg: "h-3 rounded-full", xl: "h-3.5 rounded-full" },
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
  ok: "var(--ok)",
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
          transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.2, 0.9, 0.3, 1] }}
          className={cn("h-full", indicatorClassName)}
          style={{
            minWidth: minFill,
            borderRadius: "inherit",
            background: color ?? TONES[tone],
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
