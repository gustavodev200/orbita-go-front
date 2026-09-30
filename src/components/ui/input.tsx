import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Container do input: 50px, raio 14, borda 2px. Tom "ai" é o campo roxo ✨. */
const fieldVariants = cva("flex min-w-0 items-center gap-2 border-2 transition-colors focus-within:border-g", {
  variants: {
    tone: {
      default: "border-bd bg-sf",
      ai: "border-p bg-ps focus-within:border-p",
      muted: "border-transparent bg-sf2",
      raised: "border-bd border-b-4 bg-sf",
    },
    size: {
      md: "h-[50px] rounded-[14px] px-3.5",
      lg: "h-[52px] rounded-2xl px-3.5",
      xl: "min-h-14 rounded-2xl px-3.5",
      hero: "h-[60px] rounded-2xl px-[18px]",
    },
  },
  defaultVariants: { tone: "default", size: "md" },
});

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof fieldVariants> & {
    /** Ícone Material à esquerda. */
    icon?: React.ReactNode;
    /** Conteúdo à direita (botão, ícone). */
    trailing?: React.ReactNode;
    containerClassName?: string;
  };

function Input({ className, containerClassName, tone, size, icon, trailing, ...props }: InputProps) {
  return (
    <div className={cn(fieldVariants({ tone, size }), containerClassName)}>
      {icon}
      <input
        data-slot="input"
        className={cn(
          "min-w-0 flex-1 border-none bg-transparent text-[15px] leading-[1.3] font-semibold text-ink outline-none placeholder:text-mut/80",
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}

export { Input, fieldVariants };
