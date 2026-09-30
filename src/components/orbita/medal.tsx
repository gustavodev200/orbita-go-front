import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/** Medalha circular com anel interno; bloqueada = cinza + cadeado no canto. */
function Medal({
  icon,
  color,
  shadow,
  locked,
  size = 64,
  className,
}: {
  icon: string;
  color: string;
  shadow?: string;
  locked?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: locked ? "var(--sf2)" : color,
        boxShadow: `inset 0 -${Math.round(size / 13)}px 0 ${locked ? "var(--bd)" : (shadow ?? "rgba(0,0,0,.18)")}`,
      }}
    >
      <div
        className="absolute rounded-full border-white/35"
        style={{ inset: size / 10.6, borderWidth: Math.max(3, Math.round(size / 21)), borderStyle: "solid" }}
      />
      <Icon name={icon} size={size / 2} style={{ color: locked ? "var(--mut)" : "#fff" }} />
      {locked ? (
        <div className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-lg border-2 border-bd bg-sf">
          <Icon name="lock" size={15} className="text-mut" />
        </div>
      ) : null}
    </div>
  );
}

/** Anel de progresso (conic-gradient) com conteúdo central. */
function ProgressRing({
  value,
  size = 132,
  thickness = 14,
  color = "var(--g)",
  children,
}: {
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const deg = Math.round((Math.max(0, Math.min(100, value)) / 100) * 360);
  return (
    <div
      className="relative flex items-center justify-center rounded-full transition-[background] duration-500"
      style={{ width: size, height: size, background: `conic-gradient(${color} 0 ${deg}deg, var(--sf2) ${deg}deg 360deg)` }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full bg-sf"
        style={{ width: size - thickness * 2, height: size - thickness * 2 }}
      >
        {children}
      </div>
    </div>
  );
}

export { Medal, ProgressRing };
