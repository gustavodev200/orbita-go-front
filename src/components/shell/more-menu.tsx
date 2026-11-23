"use client";

import Link from "next/link";
import { DropdownMenu as DropdownPrimitive } from "radix-ui";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";
import { isActive, type NavItem } from "./nav";

/** Menu "Mais" da barra mobile: destinos que não cabem na pílula. */
export function MoreMenu({
  items,
  pathname,
  children,
}: {
  items: NavItem[];
  pathname: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>{children}</DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          side="top"
          align="end"
          sideOffset={12}
          className="z-50 flex w-56 flex-col gap-0.5 rounded-3xl bg-sf p-2 shadow-[0_16px_40px_rgba(0,0,0,.18)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <DropdownPrimitive.Item key={item.href} asChild>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl px-2.5 py-2 no-underline outline-none select-none data-[highlighted]:bg-sf2",
                    active && "bg-sf2",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      active ? "bg-g text-white" : "bg-gs text-g",
                    )}
                  >
                    <Icon name={item.icon} size={22} />
                  </span>
                  <span className="text-[15px] leading-none font-medium text-ink">{item.label}</span>
                </Link>
              </DropdownPrimitive.Item>
            );
          })}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
