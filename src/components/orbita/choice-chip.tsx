import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Chip de escolha em pílula (data, frequência, "quando", sugestões, filtros).
 * - green / greenMuted: selecionado laranja sólido (cor de destaque).
 * - ink:   selecionado fundo --ink + texto --bg (filtros do extrato).
 * - plain: sem estado (sugestões / atalhos).
 * - dashed: ação "Nova meta".
 */
const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full leading-none font-medium transition-colors [&_.material-symbols-rounded]:text-lg",
  {
    variants: {
      variant: {
        green: "bg-sf2 text-ink hover:bg-bd data-[selected=true]:bg-g data-[selected=true]:text-white",
        greenMuted: "bg-sf2 text-mut hover:text-ink data-[selected=true]:bg-g data-[selected=true]:text-white",
        ink: "bg-sf text-mut shadow-card hover:text-ink data-[selected=true]:bg-ink data-[selected=true]:text-bg data-[selected=true]:shadow-none",
        plain: "bg-sf2 text-ink hover:bg-bd",
        dashed: "border border-dashed border-mut/50 bg-transparent text-mut hover:text-ink",
      },
      size: {
        xs: "h-8 px-3 text-[13px]",
        sm: "h-10 px-4 text-sm",
        sm13: "h-10 px-3 text-[13px]",
        md: "h-12 px-3 text-[13px]",
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
