"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";
import { MoreMenu } from "./more-menu";
import { MOBILE_MORE, MOBILE_PRIMARY, isActive, type NavItem } from "./nav";
import { QuickAddMenu } from "./quick-add-menu";

/** Botão compacto (44px); ativo vira pílula branca — rótulo só a partir de 390px pra caber em telas estreitas. */
const btn =
  "flex h-11 items-center justify-center gap-1.5 rounded-full text-sm leading-none font-medium no-underline transition-[background-color,padding] duration-200";
const btnActive = "bg-white px-3.5 text-[#141416] max-[389px]:w-11 max-[389px]:px-0";
const btnIdle = "w-11 text-white/70 hover:text-white";

function NavLabel({ children }: { children: React.ReactNode }) {
  return <span className="max-[389px]:sr-only">{children}</span>;
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(btn, active ? btnActive : btnIdle)}
    >
      <Icon name={item.icon} size={22} className={cn(active && "icon-fill text-g")} />
      {active ? <NavLabel>{item.label}</NavLabel> : null}
    </Link>
  );
}

/**
 * Barra flutuante em pílula escura (mobile): Início · Agenda · + · Tarefas · Finanças · Mais.
 * "Mais" abre Metas, Hábitos, Desafios, Foco, Inglês, Linha do tempo e Perfil; quando a tela atual é
 * uma delas, o botão assume o ícone dela.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [home, agenda, tarefas, financas] = MOBILE_PRIMARY;
  const moreActive = MOBILE_MORE.find((n) => isActive(pathname, n.href));

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="flex items-center gap-0.5 rounded-full bg-[#141416] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,.25)] dark:bg-[#26262b]">
        <NavButton item={home} active={isActive(pathname, home.href)} />
        <NavButton item={agenda} active={isActive(pathname, agenda.href)} />
        <QuickAddMenu>
          <button
            type="button"
            aria-label="Adicionar"
            className="mx-0.5 flex size-11 items-center justify-center rounded-full bg-g text-white transition-transform active:scale-95"
          >
            <Icon name="add" size={26} />
          </button>
        </QuickAddMenu>
        <NavButton item={tarefas} active={isActive(pathname, tarefas.href)} />
        <NavButton item={financas} active={isActive(pathname, financas.href)} />
        <MoreMenu items={MOBILE_MORE} pathname={pathname}>
          <button
            type="button"
            aria-label={moreActive ? `Mais: ${moreActive.label}` : "Mais"}
            className={cn(btn, moreActive ? btnActive : btnIdle)}
          >
            <Icon
              name={moreActive?.icon ?? "more_horiz"}
              size={22}
              className={cn(moreActive && "icon-fill text-g")}
            />
            {moreActive ? <NavLabel>{moreActive.short ?? moreActive.label}</NavLabel> : null}
          </button>
        </MoreMenu>
      </div>
    </nav>
  );
}
