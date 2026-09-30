"use client";

import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  icon?: string;
  /** Cor da opção ativa (variant "solid"): fundo e sombra 3D. */
  color?: string;
  shadow?: string;
};

/**
 * Controle segmentado 3D.
 * - card:  ativo vira card (--sf, borda --bd base 4px, texto --g) — como as Tabs.
 * - solid: ativo ganha cor sólida + sombra 4px (Saída vermelho / Entrada azul).
 */
function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  variant = "card",
  className,
  itemClassName,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  variant?: "card" | "solid";
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("grid gap-1.5 rounded-[18px] bg-sf2 p-1.5", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        const solidStyle: React.CSSProperties | undefined =
          variant === "solid"
            ? {
                background: active ? o.color : "transparent",
                color: active ? "#fff" : "var(--mut)",
                boxShadow: `0 4px 0 ${active ? (o.shadow ?? "transparent") : "transparent"}`,
              }
            : undefined;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            style={solidStyle}
            className={cn(
              "flex items-center justify-center gap-1.5 font-display leading-none font-black transition-colors",
              variant === "card" &&
                cn(
                  "h-[42px] rounded-[13px] border-2 text-sm",
                  active ? "border-bd border-b-4 bg-sf text-g" : "border-transparent text-mut",
                ),
              variant === "solid" && "h-12 rounded-[13px] text-base tracking-[.04em] uppercase",
              itemClassName,
            )}
          >
            {o.icon ? <Icon name={o.icon} /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedControl };
