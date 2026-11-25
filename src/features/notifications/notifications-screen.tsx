"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/orbita/icon";
import { SegmentedControl } from "@/components/orbita/segmented-control";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationFilter } from "./api";
import {
  useDismissNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "./hooks";
import { groupByDay, kindIcon, linkLabel, quickActions, SEVERITY, timeAgo } from "./notification-meta";
import { ACTION_LABEL, useQuickAction } from "./use-quick-action";

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "important", label: "Importantes" },
  { value: "unread", label: "Não lidas" },
];

const EMPTY: Record<NotificationFilter, { title: string; text: string }> = {
  all: {
    title: "Tudo em órbita",
    text: "Nenhum alerta agora. Avisamos quando uma tarefa, meta, hábito ou conta precisar da sua atenção.",
  },
  important: { title: "Nada urgente", text: "Nenhum alerta importante no momento." },
  unread: { title: "Tudo lido", text: "Você já viu todas as notificações." },
};

function NotificationCard({ n }: { n: AppNotification }) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const dismiss = useDismissNotification();
  const quick = useQuickAction();
  const sev = SEVERITY[n.severity];
  const actions = quickActions(n);

  const open = () => {
    if (!n.read) markRead.mutate(n);
    if (n.url) router.push(n.url);
  };

  return (
    <Card padding="md" className={cn("flex flex-col gap-3", !n.read && "ring-1 ring-[color:var(--bd)]")}>
      <div className="flex items-start gap-3">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", sev.tone)}>
          <Icon name={kindIcon(n.kind)} size={22} />
        </div>
        <button type="button" onClick={open} className="min-w-0 flex-1 cursor-pointer bg-transparent p-0 text-left">
          <div className="flex items-center gap-2 text-[12px] leading-none">
            <span className={cn("rounded-full px-2 py-1 font-semibold", sev.chip)}>{sev.label}</span>
            <span className="text-mut">{timeAgo(n.createdAt)}</span>
            {!n.read ? <span aria-label="Não lida" className="size-2 rounded-full bg-g" /> : null}
          </div>
          <div className="mt-2 text-[15px] leading-[1.3] font-semibold text-pretty text-ink">{n.title}</div>
          <div className="mt-1 text-[13px] leading-[1.45] text-pretty text-mut">{n.body}</div>
        </button>
        <button
          type="button"
          onClick={() => dismiss.mutate(n)}
          disabled={dismiss.isPending}
          title="Dispensar"
          aria-label="Dispensar notificação"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-mut hover:bg-sf2 hover:text-ink"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-14">
        {actions.map((a) => (
          <Button key={a} size="xs" variant={a === actions[0] ? "primary" : "secondary"} disabled={quick.pending} onClick={() => quick.run(a, n)}>
            <Icon name={ACTION_LABEL[a].icon} size={16} />
            {ACTION_LABEL[a].label}
          </Button>
        ))}
        {n.url ? (
          <Button size="xs" variant="link" asChild>
            <Link href={n.url} onClick={() => !n.read && markRead.mutate(n)}>
              {linkLabel(n.kind)} →
            </Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

/** Central de notificações: o que precisa da sua atenção, com ações rápidas. */
export function NotificationsScreen() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const query = useNotifications(filter);
  const readAll = useMarkAllNotificationsRead();
  const items = query.data?.items ?? [];
  const unread = query.data?.unreadCount ?? 0;
  const empty = EMPTY[filter];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-[18px]">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="m-0 text-[15px] leading-[1.3] text-mut">O que precisa da sua atenção.</p>
          <p className="m-0 mt-1 text-[13px] leading-none font-medium text-ink">
            {unread === 0 ? "Nenhuma não lida" : unread === 1 ? "1 não lida" : `${unread} não lidas`}
          </p>
        </div>
        {unread > 0 ? (
          <Button size="xs" variant="secondary" disabled={readAll.isPending} onClick={() => readAll.mutate()}>
            <Icon name="done_all" size={16} />
            Marcar todas como lidas
          </Button>
        ) : null}
      </div>

      <SegmentedControl value={filter} onChange={setFilter} options={FILTERS} ariaLabel="Filtrar notificações" />

      <QueryState
        query={query}
        isEmpty={items.length === 0}
        frame={(node) => <Card>{node}</Card>}
        empty={<EmptyState icon="notifications_paused" title={empty.title} text={empty.text} />}
      >
        {groupByDay(items).map((g) => (
          <section key={g.label} className="flex flex-col gap-2.5">
            <h2 className="m-0 px-1 text-[12px] leading-none font-semibold tracking-[.06em] text-mut uppercase">{g.label}</h2>
            {g.items.map((n) => (
              <NotificationCard key={n.id} n={n} />
            ))}
          </section>
        ))}
      </QueryState>

      <p className="m-0 px-1 text-center text-[12px] leading-[1.45] text-mut">
        Alertas somem sozinhos quando a pendência é resolvida. Ajuste o resumo diário e os avisos no{" "}
        <Link href="/perfil" className="text-g">
          Perfil
        </Link>
        .
      </p>
    </div>
  );
}
