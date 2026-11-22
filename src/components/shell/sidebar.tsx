"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { LogoMark, Wordmark } from "@/components/orbita/logo";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { NAV_ITEMS, isActive } from "./nav";
import { QuickAddMenu } from "./quick-add-menu";

/** Sidebar desktop recolhível 248 ↔ 84, persistida. */
export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle = useAppStore((s) => s.toggleSidebar);
  const open = !collapsed;
  const tip = open ? "Recolher menu" : "Expandir menu";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col gap-1 overflow-x-hidden overflow-y-auto bg-sf py-6 transition-[width] duration-250 ease-[cubic-bezier(.3,1,.4,1)] lg:flex",
        open ? "w-62 px-4" : "w-21 px-3",
      )}
    >
      <div className={cn("flex items-center gap-2.5 pb-6", open ? "flex-row px-2" : "flex-col px-0")}>
        <LogoMark size={32} />
        {open ? <Wordmark className="flex-1" /> : null}
        <button
          type="button"
          onClick={toggle}
          title={tip}
          aria-label={tip}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-mut hover:bg-sf2 hover:text-ink"
        >
          <Icon name={open ? "left_panel_close" : "left_panel_open"} size={20} />
        </button>
      </div>

      <QuickAddMenu side="right" align="start">
        <Button className={cn("mb-4", open ? "justify-start px-4" : "px-0")} aria-label="Adicionar">
          <Icon name="add" size={22} />
          {open ? "Adicionar" : null}
        </Button>
      </QuickAddMenu>

      {NAV_ITEMS.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Tooltip key={n.href} content={n.label} disabled={open}>
            <Link
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-3 rounded-full text-[15px] leading-none font-medium whitespace-nowrap no-underline transition-colors",
                open ? "justify-start px-4" : "justify-center px-0",
                active ? "bg-ink text-bg hover:text-bg" : "text-mut hover:bg-sf2 hover:text-ink",
              )}
            >
              <Icon name={n.icon} size={22} className={cn(active && "icon-fill text-g")} />
              {open ? n.label : null}
            </Link>
          </Tooltip>
        );
      })}
    </aside>
  );
}
