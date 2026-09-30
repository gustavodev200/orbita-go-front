import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Ícone único do app: Material Symbols Rounded preenchido (FILL 1, wght 600).
 * A fonte é carregada no layout raiz; `name` é o ligature (ex.: "savings").
 */
function Icon({
  name,
  size,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      translate="no"
      className={cn("material-symbols-rounded shrink-0", className)}
      style={size ? { fontSize: size, ...style } : style}
      {...props}
    >
      {name}
    </span>
  );
}

export { Icon };
