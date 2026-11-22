"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

/** Abas em pílulas (como "Booking · About · Reviews"): ativa = laranja sólido. */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "group flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-sf px-4 shadow-card",
        "text-sm leading-none font-medium text-mut transition-colors hover:text-ink",
        "data-[state=active]:bg-g data-[state=active]:text-white data-[state=active]:shadow-none",
        "[&_.material-symbols-rounded]:text-lg",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("flex flex-col gap-4 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
