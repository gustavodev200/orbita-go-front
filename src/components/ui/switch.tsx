"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Switch 52×32, trilho verde/--bd, bolinha branca 26px com base. */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-8 w-[52px] shrink-0 items-center rounded-2xl bg-bd p-[3px] transition-colors duration-200 outline-none data-[state=checked]:bg-g disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[26px] rounded-full bg-white shadow-[0_2px_0_rgba(0,0,0,.15)] transition-transform duration-200 data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
