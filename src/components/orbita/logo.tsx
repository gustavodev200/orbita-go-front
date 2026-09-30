import * as React from "react";

import { cn } from "@/lib/utils";

/** Marca: planeta verde com anel amarelo inclinado. */
function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  const k = size / 34;
  return (
    <div aria-hidden className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <div
        className="absolute rounded-full bg-g"
        style={{ inset: 4 * k, boxShadow: `inset 0 -${Math.max(3, Math.round(4 * k))}px 0 var(--gd)` }}
      />
      <div
        className="absolute rounded-[50%]"
        style={{
          left: -4 * k,
          top: 12 * k,
          width: 42 * k,
          height: 12 * k,
          border: `3px solid var(--y)`,
          transform: "rotate(-20deg)",
        }}
      />
    </div>
  );
}

/** Wordmark "órbitaGO" em Nunito 900 verde. */
function Wordmark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("font-display leading-none font-black tracking-[-.01em] text-g", className)}
      style={{ fontSize: size }}
    >
      órbitaGO
    </span>
  );
}

export { LogoMark, Wordmark };
