"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { NAV_ITEMS, isActive, type NavItem } from "./nav";

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-[62px] flex-col items-center justify-center gap-[3px] p-0 font-display text-[11px] leading-none font-extrabold tracking-[.02em] no-underline",
        active ? "text-gd hover:text-gd" : "text-mut hover:text-mut",
      )}
    >
      <span
        className={cn(
          "flex h-[34px] w-[50px] items-center justify-center rounded-xl border-2",
          active ? "border-g bg-gs" : "border-transparent",
        )}
      >
        <Icon name={item.icon} size={26} className={active ? "text-g" : "text-mut"} />
      </span>
      {item.label}
    </Link>
  );
}

/** Bottom nav mobile 78px: Hoje · Finanças · FAB + · Tarefas · Perfil. */
export function BottomNav() {
  const pathname = usePathname();
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const [hoje, fin, tar, , perfil] = NAV_ITEMS;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid h-[78px] grid-cols-5 items-center border-t-2 border-bd bg-sf px-1.5 pb-2 lg:hidden">
      <NavButton item={hoje} active={isActive(pathname, hoje.href)} />
      <NavButton item={fin} active={isActive(pathname, fin.href)} />
      <div className="flex justify-center">
        <Button size="fab" aria-label="Adicionar lançamento" className="-mt-[30px] border-4 border-bg" onClick={() => openTxSheet()}>
          <Icon name="add" />
        </Button>
      </div>
      <NavButton item={tar} active={isActive(pathname, tar.href)} />
      <NavButton item={perfil} active={isActive(pathname, perfil.href)} />
    </nav>
  );
}
