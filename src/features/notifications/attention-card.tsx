"use client";

import Link from "next/link";

import { Icon } from "@/components/orbita/icon";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNotifications } from "./hooks";
import { kindIcon, SEVERITY } from "./notification-meta";

const MAX = 3;

/**
 * Início: os alertas importantes ainda não lidos (tarefas atrasadas, metas,
 * contas…). Some quando não há nada — o Início não vira uma caixa de entrada.
 */
export function AttentionCard() {
  const { data } = useNotifications("important");
  const items = (data?.items ?? []).filter((n) => !n.read);
  if (items.length === 0) return null;

  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <CardTitle>Precisa da sua atenção</CardTitle>
        <Link href="/notificacoes" className="text-[13px] font-medium text-g no-underline">
          Ver tudo{items.length > MAX ? ` (${items.length})` : ""}
        </Link>
      </CardHeader>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {items.slice(0, MAX).map((n) => (
          <li key={n.id}>
            <Link
              href={n.url ?? "/notificacoes"}
              className="-mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 text-ink no-underline hover:bg-sf2"
            >
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", SEVERITY[n.severity].tone)}>
                <Icon name={kindIcon(n.kind)} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] leading-[1.3] font-medium">{n.title}</span>
                <span className="block truncate text-[12px] leading-[1.4] text-mut">{n.body}</span>
              </span>
              <Icon name="chevron_right" size={18} className="text-mut" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
