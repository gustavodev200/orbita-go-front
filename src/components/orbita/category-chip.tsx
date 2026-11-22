import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/**
 * Chip de categoria em linha (onboarding / categorias): ligado = anel laranja
 * e tile colorido; desligado = tile cinza.
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
        "relative flex h-14 items-center gap-2.5 rounded-2xl bg-sf px-3 text-left text-ink shadow-card transition-shadow",
        on ? "ring-2 ring-[color:var(--g)]" : "",
        className,
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: on ? color : "var(--bd)" }}
      >
        <Icon name={icon} size={22} className="text-white" />
      </span>
      <span className="flex-1 text-sm leading-[1.15] font-medium">{name}</span>
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
      className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl bg-sf px-1 pt-2.5 pb-2 text-ink shadow-card transition-shadow"
      style={{ boxShadow: selected ? `0 0 0 2px ${color}` : undefined }}
    >
      <span
        className="flex size-10 items-center justify-center rounded-full"
        style={{ background: color }}
      >
        <Icon name={icon} size={22} className="text-white" />
      </span>
      <span className="max-w-full truncate text-[11px] leading-[1.1] font-medium">{name}</span>
    </button>
  );
}

export { CategoryToggleChip, CategoryGridButton };
