"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type KeypadKey = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "00" | "del";

const KEYS: KeypadKey[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"];
export const MAX_CENTS = 99_999_999;

/** Regra "caixa registradora" do protótipo: dígitos entram pela direita. */
export function applyKey(cents: number, key: KeypadKey): number {
  if (key === "del") return Math.floor(cents / 10);
  if (key === "00") return Math.min(cents * 100, MAX_CENTS);
  return Math.min(cents * 10 + Number(key), MAX_CENTS);
}

/** Teclado numérico próprio (mobile): grade 3×4, teclas 44px com base 3px. */
function NumericKeypad({ onKey, className }: { onKey: (key: KeypadKey) => void; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-1.5 border-t-2 border-bd bg-sf2 px-3 pt-2", className)}>
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          aria-label={k === "del" ? "Apagar" : k}
          onClick={() => onKey(k)}
          className="num flex h-11 items-center justify-center rounded-xl bg-sf text-xl leading-none font-extrabold text-ink shadow-[0_3px_0_var(--bd)] transition-[transform,box-shadow] duration-[80ms] active:translate-y-[3px] active:shadow-none"
        >
          {k === "del" ? "⌫" : k}
        </button>
      ))}
    </div>
  );
}

export { NumericKeypad };
