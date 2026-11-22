import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Me, Task, ThemePref, Transaction } from "@/lib/api/schemas";

export type TxSheetState = {
  open: boolean;
  /** Edição de um lançamento existente. */
  editing?: Transaction;
  /** Abre com o switch "Recorrente" ligado. */
  recurring?: boolean;
};

/** Diálogos globais de criação rápida (botão + e toque num dia da agenda). */
export type QuickAddState =
  | { kind: null }
  | { kind: "task"; date?: string | null; editing?: Task }
  | { kind: "reminder"; date?: string; time?: string };

type AppState = {
  me: Me | null;
  setMe: (me: Me | null) => void;

  theme: ThemePref;
  setTheme: (theme: ThemePref) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  txSheet: TxSheetState;
  openTxSheet: (opts?: Omit<TxSheetState, "open">) => void;
  closeTxSheet: () => void;

  quickAdd: QuickAddState;
  openQuickAdd: (state: Exclude<QuickAddState, { kind: null }>) => void;
  closeQuickAdd: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      me: null,
      setMe: (me) => set({ me }),

      theme: "system",
      setTheme: (theme) => set({ theme }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      txSheet: { open: false },
      openTxSheet: (opts) => set({ txSheet: { open: true, ...opts } }),
      closeTxSheet: () => set({ txSheet: { open: false } }),

      quickAdd: { kind: null },
      openQuickAdd: (quickAdd) => set({ quickAdd }),
      closeQuickAdd: () => set({ quickAdd: { kind: null } }),
    }),
    {
      name: "orbita:ui",
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }),
      // Reidratado no client (Providers) para não divergir do HTML do servidor.
      skipHydration: true,
    },
  ),
);
