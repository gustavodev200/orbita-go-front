"use client";

import Link from "next/link";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";
import { useNotificationSummary } from "./hooks";

/** Sino do cabeçalho: abre a central; badge = não lidas (vermelho se houver urgente). */
export function NotificationBell({ className }: { className?: string }) {
  const { data } = useNotificationSummary();
  const unread = data?.unread ?? 0;
  const urgent = (data?.urgent ?? 0) > 0;
  const label = unread > 0 ? `Notificações (${unread} não lidas)` : "Notificações";

  return (
    <Link href="/notificacoes" aria-label={label} title={label} className={cn("relative", className)}>
      <Icon name={unread > 0 ? "notifications_active" : "notifications"} size={22} />
      {unread > 0 ? (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-none font-bold text-white ring-2 ring-[color:var(--bg)]",
            urgent ? "bg-r" : "bg-g",
          )}
        >
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
