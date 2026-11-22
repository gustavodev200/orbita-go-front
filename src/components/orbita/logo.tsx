import * as React from "react";

import { cn } from "@/lib/utils";

/** Marca: círculo laranja com um anel em órbita. */
function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 34 34" className={cn("shrink-0", className)}>
      <circle cx="17" cy="17" r="11" fill="var(--g)" />
      <ellipse cx="17" cy="17" rx="16" ry="5.5" fill="none" stroke="var(--ink)" strokeWidth="2.2" transform="rotate(-22 17 17)" />
      <circle cx="17" cy="17" r="11" fill="var(--g)" style={{ clipPath: "inset(0 0 50% 0)" }} />
    </svg>
  );
}

/** Wordmark "órbitaGO" — "GO" na cor de destaque. */
function Wordmark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("leading-none font-semibold tracking-[-.02em] text-ink", className)} style={{ fontSize: size }}>
      órbita<span className="text-g">GO</span>
    </span>
  );
}

export { LogoMark, Wordmark };
