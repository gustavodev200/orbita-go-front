import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Botão 3D do órbitaGO.
 * - Sólidos: sombra sólida `0 var(--press) 0 var(--btn-sh)`; no :active desce
 *   `--press` px e perde a sombra (80ms).
 * - Secundário: borda 2px com base 5px; no :active desce 3px e a base vira 2px.
 * `--press` vem do size (5px padrão, 4px pequeno); `--btn-sh` vem da variante.
 */
const solid =
  "shadow-[0_var(--press)_0_var(--btn-sh)] active:translate-y-(--press) active:shadow-none text-white";

const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-display font-black uppercase tracking-[.05em] leading-none",
    "transition-[transform,box-shadow,border-width,background-color] duration-[80ms] outline-none",
    "disabled:pointer-events-none disabled:!bg-bd disabled:!text-mut disabled:!shadow-none disabled:!border-transparent",
    "[&_.material-symbols-rounded]:text-[1.45em]",
  ],
  {
    variants: {
      variant: {
        primary: cn(solid, "bg-g [--btn-sh:var(--gd)]"),
        orange: cn(solid, "bg-o [--btn-sh:var(--od)]"),
        gold: cn(solid, "bg-y text-[#3A2800] [--btn-sh:var(--yd)]"),
        blue: cn(solid, "bg-b [--btn-sh:var(--bdk)]"),
        danger: cn(solid, "bg-r [--btn-sh:var(--rd)]"),
        ai: cn(solid, "bg-p [--btn-sh:var(--pd)]"),
        white: cn(solid, "bg-white text-gd [--btn-sh:#0E7A50]"),
        secondary:
          "bg-sf text-ink border-2 border-bd border-b-[5px] active:translate-y-[3px] active:border-b-2",
        "secondary-danger":
          "bg-sf text-r border-2 border-[color:var(--r)] border-b-[5px] active:translate-y-[3px] active:border-b-2",
        ghost: "bg-transparent text-mut hover:text-ink normal-case tracking-normal",
        link: "h-auto! px-0! bg-transparent text-b text-[13px]! font-extrabold tracking-[.05em] hover:text-bdk",
      },
      size: {
        lg: "h-14 px-5 text-base rounded-2xl [--press:5px]",
        md: "h-13 px-[22px] text-[15px] rounded-2xl [--press:5px]",
        sm: "h-10 px-3.5 text-[13px] tracking-[.04em] rounded-xl [--press:4px]",
        xs: "h-9 px-3 text-xs tracking-[.04em] rounded-xl [--press:4px]",
        fab: "size-[62px] rounded-[22px] [--press:5px] [&_.material-symbols-rounded]:text-[38px]",
        icon: "size-13 rounded-2xl [--press:5px] [&_.material-symbols-rounded]:text-[30px]",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, block, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "primary"}
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

/** Pill "+15 XP" dentro de botões sólidos. */
function ButtonTag({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("rounded-lg bg-white/25 px-2 py-1 text-[13px] leading-none", className)}
      {...props}
    />
  );
}

export { Button, ButtonTag, buttonVariants };
export type { ButtonProps };
