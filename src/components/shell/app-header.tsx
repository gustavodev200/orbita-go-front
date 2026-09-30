"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { LogoMark } from "@/components/orbita/logo";
import { CoinPill, LevelBadge, StreakPill } from "@/components/orbita/stat-pill";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/stores/app-store";
import { titleFor } from "./nav";
import { useTheme } from "./use-theme";

/**
 * Header fixo (mobile 60px / desktop 72px): título (desktop) ou logo (mobile)
 * · ofensiva · moedas · nível + mini XP · sino (mobile) ou tema + avatar (desktop).
 */
export function AppHeader() {
  const pathname = usePathname();
  const me = useAppStore((s) => s.me);
  const { isDark, toggle } = useTheme();
  const xpPct = me ? Math.round((me.xp / (me.xpToNext || 1500)) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-1 border-b-2 border-bd bg-bg pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] lg:h-[72px] lg:gap-2.5 lg:pl-8 lg:pr-8">
      <Link href="/" aria-label="órbitaGO — Hoje" className="lg:hidden">
        <LogoMark size={30} />
      </Link>
      <div className="hidden font-display text-2xl leading-none font-black text-ink lg:block">{titleFor(pathname)}</div>
      <div className="flex-1" />
      <StreakPill value={me?.streak ?? 0} />
      <CoinPill value={me?.coins ?? 0} />
      <div title="Nível" className="flex h-[38px] items-center gap-1.5 px-1 min-[400px]:gap-2 min-[400px]:px-1.5">
        <LevelBadge level={me?.level ?? 1} />
        <Progress value={xpPct} tone="y" size="xs" className="w-9 min-[400px]:w-11 lg:w-24" aria-label="XP do nível" />
      </div>
      <Link
        href="/lembretes"
        aria-label="Lembretes"
        className="flex size-[38px] items-center justify-center rounded-xl text-mut hover:text-ink lg:hidden"
      >
        <Icon name="notifications" size={26} />
      </Link>
      <button
        type="button"
        onClick={toggle}
        title="Tema"
        aria-label={isDark ? "Usar tema claro" : "Usar tema escuro"}
        className="hidden size-10 items-center justify-center rounded-xl border-2 border-bd bg-sf p-0 text-mut hover:text-ink lg:flex"
      >
        <Icon name={isDark ? "light_mode" : "dark_mode"} size={22} />
      </button>
      <Link href="/perfil" aria-label="Perfil" className="hidden lg:block">
        <Avatar src={me?.avatarUrl} name={me?.name ?? me?.email} size={40} />
      </Link>
    </header>
  );
}
