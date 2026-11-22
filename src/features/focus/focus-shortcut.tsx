"use client";

import Link from "next/link";

import { Icon } from "@/components/orbita/icon";
import { Card } from "@/components/ui/card";
import { sessionsToday } from "./focus-store";
import { formatClock, useFocus } from "./use-focus";

/** Atalho do Início: mostra o foco em andamento ou convida a começar um. */
export function FocusShortcut({ className }: { className?: string }) {
  const f = useFocus();
  const active = f.running || f.paused;
  const sessions = sessionsToday(f);
  return (
    <Card padding="none" className={className}>
      <Link href="/foco" className="flex items-center gap-3 px-5 py-4 text-ink no-underline hover:text-ink">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gs text-g">
          <Icon name="timer" size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-[1.25] font-semibold">
            {active ? `${f.mode === "focus" ? "Foco" : "Pausa"} · ${formatClock(f.left)}` : "Modo foco"}
          </span>
          <span className="mt-1 block text-xs leading-none text-mut">
            {active
              ? f.paused
                ? "Pausado — toque para continuar"
                : "Em andamento"
              : sessions
                ? `${sessions} ${sessions === 1 ? "sessão" : "sessões"} hoje · comece outra`
                : "Sessões de 15, 25 ou 50 min"}
          </span>
        </span>
        <Icon name="chevron_right" className="text-mut" />
      </Link>
    </Card>
  );
}
