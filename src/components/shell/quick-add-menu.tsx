"use client";

import * as React from "react";
import { DropdownMenu as DropdownPrimitive } from "radix-ui";

import { Icon } from "@/components/orbita/icon";
import { todayISO } from "@/lib/dates";
import { useAppStore } from "@/stores/app-store";

const ITEMS = [
  { key: "tx", label: "Lançamento", hint: "gasto ou entrada", icon: "payments" },
  { key: "task", label: "Tarefa", hint: "algo pra fazer", icon: "task_alt" },
  { key: "reminder", label: "Lembrete", hint: "aviso no celular", icon: "notifications" },
  { key: "habit", label: "Hábito", hint: "rotina para manter", icon: "self_improvement" },
] as const;

/** Menu do botão "+": cria lançamento, tarefa ou lembrete de qualquer tela. */
export function QuickAddMenu({
  children,
  side = "top",
  align = "center",
}: {
  children: React.ReactNode;
  side?: "top" | "right" | "bottom";
  align?: "start" | "center" | "end";
}) {
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const openQuickAdd = useAppStore((s) => s.openQuickAdd);

  const pick = (key: (typeof ITEMS)[number]["key"]) => {
    if (key === "tx") openTxSheet();
    else if (key === "task") openQuickAdd({ kind: "task", date: todayISO() });
    else if (key === "habit") openQuickAdd({ kind: "habit" });
    else openQuickAdd({ kind: "reminder", date: todayISO() });
  };

  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{children}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          side={side}
          align={align}
          sideOffset={12}
          className="z-50 flex w-60 flex-col gap-0.5 rounded-3xl bg-sf p-2 shadow-[0_16px_40px_rgba(0,0,0,.18)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {ITEMS.map((item) => (
            <DropdownPrimitive.Item
              key={item.key}
              onSelect={() => pick(item.key)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2 outline-none select-none data-[highlighted]:bg-sf2"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-gs text-g">
                <Icon name={item.icon} size={22} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] leading-none font-medium text-ink">{item.label}</span>
                <span className="text-xs leading-none text-mut">{item.hint}</span>
              </span>
            </DropdownPrimitive.Item>
          ))}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
