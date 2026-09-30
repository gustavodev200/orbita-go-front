import * as React from "react";

import { cn } from "@/lib/utils";

/** Skeleton com shimmer 1,3s (gradiente --sf2 → --bd → --sf2). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(90deg,var(--sf2)_0%,var(--bd)_50%,var(--sf2)_100%)] bg-size-[200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
