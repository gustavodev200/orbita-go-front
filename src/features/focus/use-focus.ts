"use client";

import { useEffect, useState } from "react";

import { durationMs, remainingMs, useFocusStore } from "./focus-store";

/** "mm:ss" de milissegundos. */
export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Estado do foco + tempo restante, re-renderizando a cada segundo enquanto corre. */
export function useFocus() {
  const state = useFocusStore();
  const [now, setNow] = useState(() => Date.now());
  const running = state.endsAt != null;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);
  // `now` pode ser de antes do `start()` (ex.: header montado antes de "Focar"):
  // limita à duração cheia para nunca mostrar "25:01"; o próximo tique corrige.
  const left = Math.min(remainingMs(state, now), durationMs(state));
  return { ...state, running, paused: state.pausedLeftMs != null, left };
}
