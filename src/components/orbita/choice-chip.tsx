import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Chip de escolha (data, frequência, "quando", sugestões, filtros).
 * - green: selecionado --gs + borda --g + texto --gd.
 * - ink:   selecionado fundo --ink + texto --bg (filtros do extrato).
 * - plain: sem estado (sugestões / atalhos).
 * - dashed: ação "Nova meta".
 */
const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap border-2 font-display leading-none font-extrabold transition-colors [&_.material-symbols-rounded]:text-lg",
  {
    variants: {
      variant: {
        green: "border-bd bg-sf text-ink data-[selected=true]:border-g data-[selected=true]:bg-gs data-[selected=true]:text-gd",
        greenMuted: "border-bd bg-sf text-mut data-[selected=true]:border-g data-[selected=true]:bg-gs data-[selected=true]:text-gd",
        ink: "border-bd bg-sf text-ink data-[selected=true]:border-ink data-[selected=true]:bg-ink data-[selected=true]:text-bg",
        plain: "border-bd bg-sf text-ink hover:bg-sf2",
        dashed: "border-dashed border-bd bg-transparent text-mut hover:text-ink",
      },
      size: {
        xs: "h-[34px] rounded-[10px] px-3 text-[13px]",
        sm: "h-10 rounded-xl px-3.5 text-sm",
        sm13: "h-10 rounded-xl px-3 text-[13px]",
        md: "h-[50px] rounded-[14px] px-2 text-[13px]",
      },
    },
    defaultVariants: { variant: "green", size: "sm" },
  },
);

type ChipProps = React.ComponentProps<"button"> & VariantProps<typeof chipVariants> & { selected?: boolean };

function ChoiceChip({ className, variant, size, selected, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      data-selected={selected ? "true" : "false"}
      aria-pressed={selected}
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { ChoiceChip, chipVariants };
