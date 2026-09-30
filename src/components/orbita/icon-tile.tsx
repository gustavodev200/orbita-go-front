import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/**
 * Tile quadrado de ícone.
 * - solid: fundo na cor + ícone branco + `inset 0 -4px 0 rgba(0,0,0,.14)`.
 * - soft:  fundo tint (--gs, --bs…) + ícone na cor.
 * Tamanho padrão 44 (raio 14); ícone ≈ 55% do tile.
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
  const r = radius ?? Math.round(size * 0.31);
  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: solid ? color : (soft ?? "var(--sf2)"),
        boxShadow: solid ? `inset 0 -${size >= 44 ? 4 : 3}px 0 rgba(0,0,0,.14)` : undefined,
      }}
    >
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.56)} style={{ color: solid ? "#fff" : color }} />
      {children}
    </div>
  );
}

export { IconTile };
