import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Card branco, cantos bem arredondados, sem borda (sombra bem leve). */
const cardVariants = cva("card-3d min-w-0", {
  variants: {
    radius: { md: "rounded-[20px]", lg: "rounded-3xl", xl: "rounded-[28px]" },
    padding: { none: "", sm: "p-3.5", md: "p-4", lg: "p-5", xl: "p-6" },
    tone: { default: "", danger: "ring-1 ring-[color:var(--r)]" },
  },
  defaultVariants: { radius: "lg", padding: "lg", tone: "default" },
});

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

function Card({ className, radius, padding, tone, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardVariants({ radius, padding, tone }), className)} {...props} />;
}

/** Cabeçalho "Título ... ação" usado em quase todos os cards. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center justify-between gap-3", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("m-0 text-[17px] leading-[1.25] font-semibold tracking-[-.01em]", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("m-0 text-[13px] leading-none text-mut", className)} {...props} />;
}

/** Faixa de grupo (rótulo + total) — extrato, recorrentes. */
function CardGroupHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between px-5 pt-4 pb-1 text-[13px] leading-none font-medium text-mut", className)}
      {...props}
    />
  );
}

/** Linha de lista dentro de card. */
function CardRow({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex items-center gap-3 px-5 py-3", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardGroupHeader, CardRow, cardVariants };
