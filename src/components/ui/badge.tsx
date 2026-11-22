import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Badges de status — pílula com fundo suave. */
const badgeVariants = cva("inline-flex shrink-0 items-center gap-1 rounded-full font-medium whitespace-nowrap leading-none", {
  variants: {
    tone: {
      paid: "bg-oks text-okd",
      pending: "bg-ys text-yd",
      overdue: "bg-rs text-rd",
      info: "bg-bs text-bdk",
      finance: "bg-gs text-gd",
      task: "bg-bs text-bdk",
      accent: "bg-gs text-gd",
      muted: "bg-sf2 text-mut",
    },
    size: {
      sm: "px-2 py-1 text-[11px]",
      md: "px-2.5 py-1.5 text-xs",
      lg: "px-3 py-1.5 text-sm",
    },
  },
  defaultVariants: { tone: "muted", size: "md" },
});

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
