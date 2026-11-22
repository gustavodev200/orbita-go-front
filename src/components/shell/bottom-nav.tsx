"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive, type NavItem } from "./nav";
import { QuickAddMenu } from "./quick-add-menu";

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-12 items-center justify-center gap-1.5 rounded-full text-sm leading-none font-medium no-underline transition-[background-color,padding] duration-200",
        active ? "bg-white px-4 text-[#141416]" : "w-12 text-white/70 hover:text-white",
      )}
    >
      <Icon name={item.icon} size={22} className={cn(active && "icon-fill text-g")} />
      {active ? item.label : null}
    </Link>
  );
}

/** Barra flutuante em pílula escura (mobile): Início · Agenda · + · Tarefas · Finanças. */
export function BottomNav() {
  const pathname = usePathname();
  const [home, agenda, tarefas, financas] = NAV_ITEMS;
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="flex items-center gap-1 rounded-full bg-[#141416] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,.25)] dark:bg-[#26262b]">
        <NavButton item={home} active={isActive(pathname, home.href)} />
        <NavButton item={agenda} active={isActive(pathname, agenda.href)} />
        <QuickAddMenu>
          <button
            type="button"
            aria-label="Adicionar"
            className="flex size-12 items-center justify-center rounded-full bg-g text-white transition-transform active:scale-95"
          >
            <Icon name="add" size={28} />
          </button>
        </QuickAddMenu>
        <NavButton item={tarefas} active={isActive(pathname, tarefas.href)} />
        <NavButton item={financas} active={isActive(pathname, financas.href)} />
      </div>
    </nav>
  );
}
