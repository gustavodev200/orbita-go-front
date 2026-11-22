import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Botão em pílula, plano. `primary` = laranja (ação principal da tela),
 * `dark` = preto/tinta (ação forte secundária, ex.: "Aplicar"), `secondary`
 * = cinza suave. Os demais nomes ficaram por compatibilidade e mapeiam
 * para essas mesmas aparências.
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-sans font-semibold leading-none",
    "transition-[background-color,color,opacity,transform] duration-150 outline-none active:scale-[.98]",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_.material-symbols-rounded]:text-[1.35em]",
  ],
  {
    variants: {
      variant: {
        primary: "bg-g text-white hover:bg-gd",
        orange: "bg-g text-white hover:bg-gd",
        dark: "bg-ink text-bg hover:opacity-90",
        gold: "bg-ink text-bg hover:opacity-90",
        blue: "bg-ink text-bg hover:opacity-90",
        ai: "bg-ink text-bg hover:opacity-90",
        danger: "bg-r text-white hover:bg-rd",
        white: "bg-white text-ink hover:bg-white/90",
        secondary: "bg-sf2 text-ink hover:bg-bd",
        "secondary-danger": "bg-rs text-r hover:opacity-90",
        ghost: "bg-transparent text-mut hover:text-ink",
        link: "h-auto! px-0! bg-transparent text-g text-sm! font-medium hover:text-gd active:scale-100",
      },
      size: {
        lg: "h-14 px-6 text-base rounded-full",
        md: "h-12 px-5 text-[15px] rounded-full",
        sm: "h-10 px-4 text-sm rounded-full",
        xs: "h-8 px-3 text-[13px] rounded-full",
        fab: "size-14 rounded-full [&_.material-symbols-rounded]:text-[30px]",
        icon: "size-12 rounded-full [&_.material-symbols-rounded]:text-[24px]",
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

/** Botão redondo de ícone (sino, voltar, filtros) — branco sobre o fundo cinza. */
function IconButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-sf text-ink shadow-card transition-colors hover:bg-sf2 [&_.material-symbols-rounded]:text-[22px]",
        className,
      )}
      {...props}
    />
  );
}

export { Button, IconButton, buttonVariants };
export type { ButtonProps };
