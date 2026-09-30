import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Badges de status/XP — Nunito 900 em caixa alta sobre tint. */
const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-display font-black leading-none",
  {
    variants: {
      tone: {
        paid: "bg-gs text-gd",
        pending: "bg-ys text-yd",
        overdue: "bg-rs text-rd",
        info: "bg-bs text-bdk",
        finance: "bg-gs text-g",
        task: "bg-bs text-b",
        xp: "bg-ys text-yd",
        muted: "bg-sf2 text-mut",
      },
      size: {
        sm: "rounded-lg px-2 py-1 text-[11px] tracking-[.05em] uppercase",
        md: "rounded-lg px-2.5 py-[5px] text-xs tracking-[.05em] uppercase",
        xp: "rounded-lg px-2 py-1 text-xs",
        lg: "rounded-[10px] px-2.5 py-1.5 text-sm",
      },
    },
    defaultVariants: { tone: "muted", size: "md" },
  },
);

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
