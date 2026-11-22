"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { Avatar } from "@/components/ui/avatar";
import { greeting } from "@/lib/dates";
import { useAppStore } from "@/stores/app-store";
import { titleFor } from "./nav";
import { useTheme } from "./use-theme";

const roundBtn =
  "flex size-11 shrink-0 items-center justify-center rounded-full bg-sf text-ink no-underline shadow-card transition-colors hover:bg-sf2 hover:text-ink";

/**
 * Header: no Início mostra avatar + saudação (como um app de uso diário);
 * nas outras telas, o título. À direita: sino (agenda/lembretes) e, no
 * desktop, tema + avatar.
 */
export function AppHeader() {
  const pathname = usePathname();
  const me = useAppStore((s) => s.me);
  const { isDark, toggle } = useTheme();
  const home = pathname === "/";
  const first = me?.name?.trim().split(/\s+/)[0];

  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center gap-3 bg-bg/85 pt-[calc(0.75rem+env(safe-area-inset-top))] pr-[calc(1rem+env(safe-area-inset-right))] pb-3 pl-[calc(1rem+env(safe-area-inset-left))] backdrop-blur-md lg:px-8 lg:pt-5">
      {home ? (
        <Link href="/perfil" aria-label="Perfil" className="flex min-w-0 items-center gap-3 no-underline lg:hidden">
          <Avatar src={me?.avatarUrl} name={me?.name ?? me?.email} size={44} />
          <div className="min-w-0">
            <div className="text-[13px] leading-none text-mut">{greeting()}!</div>
            <div className="mt-1 truncate text-[17px] leading-none font-semibold text-ink">{first ?? "Você"}</div>
          </div>
        </Link>
      ) : (
        <h1 className="m-0 text-2xl leading-none font-semibold tracking-[-.02em] text-ink lg:hidden">{titleFor(pathname)}</h1>
      )}
      <h1 className="m-0 hidden text-[28px] leading-none font-semibold tracking-[-.02em] text-ink lg:block">
        {home ? `${greeting()}${first ? `, ${first}` : ""}` : titleFor(pathname)}
      </h1>
      <div className="flex-1" />
      <button
        type="button"
        onClick={toggle}
        title="Tema"
        aria-label={isDark ? "Usar tema claro" : "Usar tema escuro"}
        className={`${roundBtn} hidden lg:flex`}
      >
        <Icon name={isDark ? "light_mode" : "dark_mode"} size={22} />
      </button>
      <Link href="/agenda" aria-label="Agenda e lembretes" className={roundBtn}>
        <Icon name="notifications" size={22} />
      </Link>
      <Link href="/perfil" aria-label="Perfil" className="hidden lg:block">
        <Avatar src={me?.avatarUrl} name={me?.name ?? me?.email} size={44} />
      </Link>
    </header>
  );
}
