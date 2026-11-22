"use client";

import Link from "next/link";

import { Icon } from "@/components/orbita/icon";
import { formatClock, useFocus } from "./use-focus";

/** Pílula no header enquanto há um foco correndo ou pausado. */
export function FocusPill() {
  const f = useFocus();
  if (!f.running && !f.paused) return null;
  return (
    <Link
      href="/foco"
      aria-label={f.paused ? "Foco pausado" : "Foco em andamento"}
      className="flex h-11 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm leading-none font-medium text-bg no-underline hover:text-bg"
    >
      <Icon name={f.mode === "focus" ? "timer" : "coffee"} size={18} className={f.paused ? "" : "text-g"} />
      <span className="num">{formatClock(f.left)}</span>
    </Link>
  );
}
