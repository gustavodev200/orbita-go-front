import { create } from "zustand";
import { persist } from "zustand/middleware";

import { todayISO } from "@/lib/dates";

export type FocusMode = "focus" | "break";
export type FocusMinutes = 15 | 25 | 50;
export const BREAK_MINUTES = 5;

type FocusData = {
  mode: FocusMode;
  minutes: FocusMinutes;
  /** Timestamp (ms) do fim da contagem em andamento; null = parado. */
  endsAt: number | null;
  /** Restante (ms) quando pausado; null = não pausado. */
  pausedLeftMs: number | null;
  taskId: string | null;
  /** Dia (YYYY-MM-DD, fuso de negócio) a que `sessions` se refere. */
  sessionsDay: string;
  sessions: number;
};

type FocusActions = {
  setMinutes: (m: FocusMinutes) => void;
  start: (opts?: { now?: number; taskId?: string | null }) => void;
  pause: (now?: number) => void;
  resume: (now?: number) => void;
  /** Para o timer e volta ao foco; mantém as sessões do dia. */
  reset: () => void;
  /** Fim da contagem (chamado pelo ticker). Idempotente. */
  finish: (now?: number) => void;
};

export const initialFocusState: FocusData = {
  mode: "focus",
  minutes: 25,
  endsAt: null,
  pausedLeftMs: null,
  taskId: null,
  sessionsDay: "",
  sessions: 0,
};

/** Duração cheia (ms) do modo atual. */
export function durationMs(s: Pick<FocusData, "mode" | "minutes">): number {
  return (s.mode === "focus" ? s.minutes : BREAK_MINUTES) * 60_000;
}

/** Quanto falta (ms) — nunca negativo. Parado: a duração cheia do modo atual. */
export function remainingMs(s: FocusData, now: number = Date.now()): number {
  if (s.endsAt != null) return Math.max(0, s.endsAt - now);
  if (s.pausedLeftMs != null) return s.pausedLeftMs;
  return durationMs(s);
}

export function isRunning(s: FocusData): boolean {
  return s.endsAt != null;
}

/** Sessões de foco concluídas hoje (zera ao virar o dia). */
export function sessionsToday(s: FocusData, now: number = Date.now()): number {
  return s.sessionsDay === todayISO(new Date(now)) ? s.sessions : 0;
}

export const useFocusStore = create<FocusData & FocusActions>()(
  persist(
    (set, get) => ({
      ...initialFocusState,
      setMinutes: (minutes) => {
        if (isRunning(get())) return;
        set({ minutes, pausedLeftMs: null });
      },
      start: (opts) => {
        const now = opts?.now ?? Date.now();
        const s = get();
        set({ endsAt: now + durationMs(s), pausedLeftMs: null, taskId: opts?.taskId !== undefined ? opts.taskId : s.taskId });
      },
      pause: (now = Date.now()) => {
        const s = get();
        if (s.endsAt == null) return;
        set({ endsAt: null, pausedLeftMs: Math.max(0, s.endsAt - now) });
      },
      resume: (now = Date.now()) => {
        const s = get();
        if (s.pausedLeftMs == null) return;
        set({ endsAt: now + s.pausedLeftMs, pausedLeftMs: null });
      },
      reset: () => set({ mode: "focus", endsAt: null, pausedLeftMs: null, taskId: null }),
      finish: (now = Date.now()) => {
        const s = get();
        if (s.endsAt == null) return;
        if (s.mode === "break") {
          set({ mode: "focus", endsAt: null, pausedLeftMs: null });
          return;
        }
        const day = todayISO(new Date(now));
        set({
          mode: "break",
          endsAt: null,
          pausedLeftMs: null,
          sessionsDay: day,
          sessions: (s.sessionsDay === day ? s.sessions : 0) + 1,
        });
      },
    }),
    {
      name: "orbita:focus",
      partialize: ({ mode, minutes, endsAt, pausedLeftMs, taskId, sessionsDay, sessions }) => ({
        mode,
        minutes,
        endsAt,
        pausedLeftMs,
        taskId,
        sessionsDay,
        sessions,
      }),
      // Reidratado no client (FocusTicker) para não divergir do HTML do servidor.
      skipHydration: true,
    },
  ),
);
