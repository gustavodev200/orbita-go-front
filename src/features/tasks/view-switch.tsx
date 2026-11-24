"use client";

import Link from "next/link";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

const VIEWS = [
  { value: "lista", href: "/tarefas", label: "Lista", icon: "view_agenda" },
  { value: "quadro", href: "/tarefas/quadro", label: "Quadro", icon: "view_kanban" },
] as const;

/** Alterna Tarefas entre lista (por data) e quadro Kanban (por status). */
export function TaskViewSwitch({ view, className }: { view: (typeof VIEWS)[number]["value"]; className?: string }) {
  return (
    <nav aria-label="Visualização das tarefas" className={cn("inline-flex shrink-0 gap-1 rounded-full bg-sf2 p-1", className)}>
      {VIEWS.map((v) => {
        const active = v.value === view;
        return (
          <Link
            key={v.value}
            href={v.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm leading-none font-medium no-underline transition-colors",
              active ? "bg-sf text-ink shadow-card" : "text-mut hover:text-ink",
            )}
          >
            <Icon name={v.icon} size={18} className={cn(active && "text-g")} />
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}
