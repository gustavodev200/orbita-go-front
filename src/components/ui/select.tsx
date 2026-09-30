"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

/** Gatilho no estilo chip 40px (filtro de categoria). */
function SelectTrigger({
  className,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { icon?: string }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-xl border-2 border-bd bg-sf px-3 font-display text-sm leading-none font-extrabold text-ink outline-none",
        className,
      )}
      {...props}
    >
      {icon ? <span className="material-symbols-rounded text-lg!">{icon}</span> : null}
      {children}
      <SelectPrimitive.Icon asChild>
        <span className="material-symbols-rounded text-lg!">expand_more</span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={6}
        className={cn(
          "z-50 max-h-80 min-w-44 overflow-hidden rounded-[14px] border-2 border-bd bg-sf p-1.5 shadow-[0_10px_24px_rgba(0,0,0,.12)]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "flex h-10 cursor-pointer items-center gap-2 rounded-[10px] px-2.5 font-display text-sm font-extrabold text-ink outline-none select-none data-[highlighted]:bg-sf2 data-[state=checked]:text-gd",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem };
