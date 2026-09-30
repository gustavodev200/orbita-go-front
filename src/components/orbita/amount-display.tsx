import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { formatBRL, MINUS } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Valor em BRL com Figtree 800 tabular. `type` define cor e sinal
 * (entrada azul "+", saída vermelha "−"); `zeroMuted` deixa cinza em 0.
 */
const amountVariants = cva("num font-extrabold whitespace-nowrap", {
  variants: {
    size: {
      sm: "text-[15px] leading-none",
      md: "text-base leading-none",
      lg: "text-[19px] leading-[1.1]",
      xl: "text-[26px] leading-none",
      stat: "text-[32px] leading-none tracking-[-.02em] lg:text-[34px]",
      balance: "text-[38px] leading-[1.05] tracking-[-.03em] lg:text-[44px]",
      hero: "text-5xl leading-none tracking-[-.03em] lg:text-[56px]",
    },
  },
  defaultVariants: { size: "md" },
});

type AmountDisplayProps = VariantProps<typeof amountVariants> & {
  cents: number;
  type?: "expense" | "income" | "neutral";
  /** Mostra o sinal +/−. Padrão: true quando há `type`. */
  signed?: boolean;
  zeroMuted?: boolean;
  compact?: boolean;
  className?: string;
};

function AmountDisplay({ cents, type = "neutral", signed, size, zeroMuted, compact, className }: AmountDisplayProps) {
  const showSign = signed ?? type !== "neutral";
  const abs = formatBRL(Math.abs(cents), { compact });
  const sign = !showSign ? (cents < 0 ? MINUS : "") : type === "expense" ? MINUS : type === "income" ? "+" : cents < 0 ? MINUS : "";
  const color =
    zeroMuted && cents === 0 ? "text-mut" : type === "expense" ? "text-r" : type === "income" ? "text-b" : "text-ink";
  return (
    <span className={cn(amountVariants({ size }), color, className)}>
      {sign}
      {abs}
    </span>
  );
}

export { AmountDisplay, amountVariants };
