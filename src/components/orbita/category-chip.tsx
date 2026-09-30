import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/**
 * Chip de categoria em linha (onboarding / biblioteca): 58–60px, tile 34–36,
 * ligado = borda --g, fundo --gs, tile colorido; desligado = tile --bd.
 */
function CategoryToggleChip({
  name,
  icon,
  color,
  on,
  onToggle,
  showCheck,
  className,
}: {
  name: string;
  icon: string;
  color: string;
  on: boolean;
  onToggle: () => void;
  showCheck?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cn(
        "relative flex h-[60px] items-center gap-2.5 rounded-2xl border-2 border-b-[5px] px-3 text-left text-ink transition-colors",
        on ? "border-g bg-gs" : "border-bd bg-sf",
        className,
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-[11px] shadow-[inset_0_-3px_0_rgba(0,0,0,.15)]"
        style={{ background: on ? color : "var(--bd)" }}
      >
        <Icon name={icon} size={22} className="text-white" />
      </span>
      <span className="flex-1 font-display text-sm leading-[1.15] font-extrabold">{name}</span>
      {showCheck && on ? <Icon name="check_circle" size={20} className="text-g" /> : null}
    </button>
  );
}

/** Botão de categoria da grade do Novo lançamento (tile 40 em cima, nome embaixo). */
function CategoryGridButton({
  name,
  icon,
  color,
  selected,
  onSelect,
}: {
  name: string;
  icon: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border-2 border-b-4 bg-sf px-1 pt-2.5 pb-2 text-ink transition-colors"
      style={{ borderColor: selected ? color : "var(--bd)" }}
    >
      <span
        className="flex size-10 items-center justify-center rounded-[13px] shadow-[inset_0_-3px_0_rgba(0,0,0,.15)]"
        style={{ background: color }}
      >
        <Icon name={icon} size={22} className="text-white" />
      </span>
      <span className="max-w-full truncate font-display text-[11px] leading-[1.1] font-extrabold">{name}</span>
    </button>
  );
}

export { CategoryToggleChip, CategoryGridButton };
