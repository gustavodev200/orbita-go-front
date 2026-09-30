"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { DropdownMenu as DropdownPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const DropdownMenu = DropdownPrimitive.Root;
const DropdownMenuTrigger = DropdownPrimitive.Trigger;

/** Menu flutuante do design (⋮ do extrato): pílulas lado a lado. */
function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 flex gap-1.5 rounded-[14px] border-2 border-bd bg-sf p-1.5 shadow-[0_10px_24px_rgba(0,0,0,.12)]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
}

const itemVariants = cva(
  "flex h-9 cursor-pointer items-center gap-1 rounded-[10px] px-3 font-display text-[13px] leading-none font-extrabold outline-none select-none data-[highlighted]:brightness-95 [&_.material-symbols-rounded]:text-lg",
  {
    variants: {
      tone: { info: "bg-bs text-bdk", danger: "bg-rs text-rd", default: "bg-sf2 text-ink" },
    },
    defaultVariants: { tone: "default" },
  },
);

function DropdownMenuItem({
  className,
  tone,
  ...props
}: React.ComponentProps<typeof DropdownPrimitive.Item> & VariantProps<typeof itemVariants>) {
  return <DropdownPrimitive.Item className={cn(itemVariants({ tone }), className)} {...props} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
