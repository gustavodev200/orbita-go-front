import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Campo em pílula branca (ou cinza `muted`), foco com anel laranja. */
const fieldVariants = cva(
  "flex min-w-0 items-center gap-2 transition-shadow focus-within:ring-2 focus-within:ring-[color:color-mix(in_srgb,var(--g)_45%,transparent)]",
  {
    variants: {
      tone: {
        default: "bg-sf shadow-card",
        ai: "bg-sf shadow-card",
        muted: "bg-sf2",
        raised: "bg-sf2",
      },
      size: {
        md: "h-12 rounded-full px-4",
        lg: "h-[52px] rounded-full px-4",
        xl: "min-h-14 rounded-full px-5",
        hero: "h-14 rounded-2xl px-4",
      },
    },
    defaultVariants: { tone: "default", size: "md" },
  },
);

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
          "min-w-0 flex-1 border-none bg-transparent text-[15px] leading-[1.3] text-ink outline-none placeholder:text-mut",
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}

export { Input, fieldVariants };
