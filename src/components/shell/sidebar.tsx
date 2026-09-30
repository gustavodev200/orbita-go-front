"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Cobre } from "@/components/orbita/cobre";
import { Icon } from "@/components/orbita/icon";
import { LogoMark, Wordmark } from "@/components/orbita/logo";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { NAV_ITEMS, SOON_ITEMS, isActive } from "./nav";

/** Sidebar desktop recolhível 256 ↔ 88 (250ms cubic-bezier(.3,1,.4,1)), persistida. */
export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggle = useAppStore((s) => s.toggleSidebar);
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const open = !collapsed;
  const tip = open ? "Recolher menu" : "Expandir menu";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col gap-1.5 overflow-x-hidden overflow-y-auto border-r-2 border-bd bg-sf py-5 transition-[width] duration-250 ease-[cubic-bezier(.3,1,.4,1)] lg:flex",
        open ? "w-64 px-4" : "w-[88px] px-3.5",
      )}
    >
      <div className={cn("flex items-center gap-2.5 pb-[18px]", open ? "flex-row px-2.5" : "flex-col px-0")}>
        <LogoMark />
        {open ? <Wordmark className="flex-1" /> : null}
        <button
          type="button"
          onClick={toggle}
          title={tip}
          aria-label={tip}
          className="flex size-9 shrink-0 items-center justify-center rounded-[11px] border-2 border-b-4 border-bd bg-sf p-0 text-mut transition-[transform,border-width] duration-[80ms] hover:text-ink active:translate-y-0.5 active:border-b-2"
        >
          <Icon name={open ? "left_panel_close" : "left_panel_open"} size={22} />
        </button>
      </div>

      {NAV_ITEMS.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Tooltip key={n.href} content={n.label} disabled={open}>
            <Link
              href={n.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-13 items-center gap-3.5 rounded-[14px] border-2 font-display text-[15px] leading-none font-extrabold tracking-[.03em] whitespace-nowrap uppercase no-underline transition-colors",
                open ? "justify-start px-3.5" : "justify-center px-0",
                active ? "border-g bg-gs text-gd hover:text-gd" : "border-transparent text-mut hover:bg-sf2 hover:text-mut",
              )}
            >
              <Icon name={n.icon} size={26} className={active ? "text-g" : "text-mut"} />
              {open ? n.label : null}
            </Link>
          </Tooltip>
        );
      })}

      <Tooltip content="Novo lançamento" disabled={open}>
        <Button className="mt-3.5 px-0" onClick={() => openTxSheet()} aria-label="Novo lançamento">
          <Icon name="add_circle" size={24} />
          {open ? "Novo lançamento" : null}
        </Button>
      </Tooltip>

      {open ? (
        <div className="mx-3.5 mt-7 mb-2 font-display text-xs leading-none font-extrabold tracking-[.12em] text-mut uppercase">
          Em breve
        </div>
      ) : (
        <div className="mx-2.5 mt-6 mb-2 h-0.5 rounded-sm bg-bd" />
      )}

      {SOON_ITEMS.map((s) => (
        <div
          key={s.label}
          title={`${s.label} · em breve`}
          aria-disabled
          className={cn(
            "relative flex h-12 items-center gap-3.5 rounded-[14px] font-display text-[15px] leading-none font-extrabold whitespace-nowrap text-mut opacity-70",
            open ? "justify-start px-3.5" : "justify-center px-0",
          )}
        >
          <Icon name={s.icon} size={24} className="grayscale" />
          {open ? (
            <>
              <span className="flex-1">{s.label}</span>
              <Icon name="lock" size={18} />
            </>
          ) : (
            <Icon name="lock" size={14} className="absolute right-1 bottom-1" />
          )}
        </div>
      ))}

      {open ? (
        <div className="mt-auto flex items-center gap-3 rounded-[18px] bg-ps p-4">
          <Cobre mood="feliz" size={44} />
          <div className="text-[13px] leading-[1.35] font-bold text-ink">Saúde e Hábitos chegam logo. Guarde suas moedas!</div>
        </div>
      ) : (
        <div className="mt-auto flex justify-center">
          <Cobre mood="feliz" size={40} />
        </div>
      )}
    </aside>
  );
}
