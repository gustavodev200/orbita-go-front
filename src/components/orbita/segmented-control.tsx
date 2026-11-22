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
 * Controle segmentado em pílula.
 * - card:  ativo vira pílula branca com sombra leve.
 * - solid: ativo ganha a cor da opção (Saída vermelho / Entrada verde).
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
      className={cn("grid gap-1 rounded-full bg-sf2 p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value;
        const solidStyle: React.CSSProperties | undefined =
          variant === "solid"
            ? {
                background: active ? o.color : "transparent",
                color: active ? "#fff" : "var(--mut)",
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
              "flex items-center justify-center gap-1.5 leading-none font-medium transition-colors",
              variant === "card" &&
                cn(
                  "h-10 rounded-full text-sm",
                  active ? "bg-sf text-ink shadow-card" : "text-mut",
                ),
              variant === "solid" && "h-11 rounded-full text-[15px]",
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
