import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Card 3D: borda 2px com base 5px, sem drop shadow. */
const cardVariants = cva("card-3d min-w-0", {
  variants: {
    radius: { md: "rounded-[20px]", lg: "rounded-[22px]", xl: "rounded-[24px]" },
    padding: { none: "", sm: "p-3.5", md: "p-4", lg: "p-5", xl: "p-[22px]" },
    tone: { default: "border-bd", danger: "border-[color:var(--r)]" },
  },
  defaultVariants: { radius: "xl", padding: "lg", tone: "default" },
});

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

function Card({ className, radius, padding, tone, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardVariants({ radius, padding, tone }), className)} {...props} />;
}

/** Cabeçalho "H2 ... ação" usado em quase todos os cards. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-between gap-3", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("m-0 font-display text-xl leading-[1.2] font-black", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("m-0 text-[13px] leading-none font-bold text-mut", className)} {...props} />;
}

/** Faixa de grupo (fundo --sf2, rótulo em caixa alta) — extrato, recorrentes. */
function CardGroupHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-between bg-sf2 px-[18px] py-3 font-display text-sm leading-none font-black tracking-[.04em] text-mut uppercase",
        className,
      )}
      {...props}
    />
  );
}

/** Linha de lista dentro de card com divisor --sf2. */
function CardRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex items-center gap-3 border-t-2 border-sf2 px-[18px] py-3 first:border-t-0", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardGroupHeader, CardRow, cardVariants };
