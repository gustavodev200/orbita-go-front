import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/**
 * Tile redondo de ícone.
 * - solid: fundo na cor + ícone branco.
 * - soft:  fundo tint (--gs, --bs… ou softOf(cor)) + ícone na cor.
 * Tamanho padrão 44; ícone ≈ 50% do tile.
 */
function IconTile({
  icon,
  color,
  soft,
  variant = "solid",
  size = 44,
  radius,
  iconSize,
  className,
  children,
}: {
  icon: string;
  /** cor principal (hex ou var(--x)). */
  color: string;
  /** fundo suave para variant="soft" (ex.: "var(--gs)"). */
  soft?: string;
  variant?: "solid" | "soft";
  size?: number;
  radius?: number;
  iconSize?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const solid = variant === "solid";
  const r = radius ?? size / 2;
  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: solid ? color : (soft ?? "var(--sf2)"),
      }}
    >
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.5)} style={{ color: solid ? "#fff" : color }} />
      {children}
    </div>
  );
}

export { IconTile };
