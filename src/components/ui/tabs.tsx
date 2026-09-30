"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/** Trilho "segmented" 3D: fundo --sf2, raio 18, padding 6. */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("grid auto-cols-fr grid-flow-col gap-1.5 rounded-[18px] bg-sf2 p-1.5", className)}
      {...props}
    />
  );
}

/** Aba ativa vira "card" com base de 4px e texto verde. */
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[13px] border-2 border-transparent px-1",
        // <400px (iPhone SE/mini etc.): "Recorrentes" não cabe em 13px dentro de 4
        // colunas — cai pra 11px só abaixo desse limiar; 390px+ fica como já era.
        "font-display text-[11px] leading-none font-black tracking-[.02em] text-mut min-[400px]:text-[13px] lg:text-[15px]",
        "transition-colors data-[state=active]:border-bd data-[state=active]:border-b-4 data-[state=active]:bg-sf data-[state=active]:text-g",
        "[&_.material-symbols-rounded]:text-xl",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("flex flex-col gap-[18px] outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
