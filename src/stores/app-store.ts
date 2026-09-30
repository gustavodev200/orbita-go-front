import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AchievementBrief, Me, ThemePref, Transaction } from "@/lib/api/schemas";

export type CelebrationKind = "nivel" | "conquista" | "ofensiva" | "escudo" | "meta";

export type ModalState = {
  kind: CelebrationKind;
  level?: number;
  achievement?: AchievementBrief;
  goal?: { name: string; targetCents: number; steps: number };
  streak?: number;
};

export type XpToastState = { id: number; xp: number; coins: number; message?: string };

export type TxSheetState = {
  open: boolean;
  /** Edição de um lançamento existente. */
  editing?: Transaction;
  /** Abre com o switch "Recorrente" ligado. */
  recurring?: boolean;
};

export const TOAST_DURATION = 2400;

type AppState = {
  me: Me | null;
  setMe: (me: Me | null) => void;

  theme: ThemePref;
  setTheme: (theme: ThemePref) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  toast: XpToastState | null;
  showToast: (t: Omit<XpToastState, "id">) => void;
  clearToast: () => void;

  modal: ModalState | null;
  modalQueue: ModalState[];
  openModal: (m: ModalState) => void;
  /** Troca o modal atual sem passar pela fila (ex.: ofensiva → escudo). */
  replaceModal: (m: ModalState) => void;
  closeModal: () => void;

  txSheet: TxSheetState;
  openTxSheet: (opts?: Omit<TxSheetState, "open">) => void;
  closeTxSheet: () => void;
};

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      me: null,
      setMe: (me) => set({ me }),

      theme: "system",
      setTheme: (theme) => set({ theme }),

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      toast: null,
      showToast: (t) => {
        clearTimeout(toastTimer);
        set({ toast: { ...t, id: Date.now() + Math.random() } });
        toastTimer = setTimeout(() => set({ toast: null }), TOAST_DURATION);
      },
      clearToast: () => {
        clearTimeout(toastTimer);
        set({ toast: null });
      },

      modal: null,
      modalQueue: [],
      openModal: (m) => {
        if (get().modal) set((s) => ({ modalQueue: [...s.modalQueue, m] }));
        else set({ modal: m });
      },
      replaceModal: (m) => set({ modal: m }),
      closeModal: () => {
        const [next, ...rest] = get().modalQueue;
        set({ modal: next ?? null, modalQueue: rest });
      },

      txSheet: { open: false },
      openTxSheet: (opts) => set({ txSheet: { open: true, ...opts } }),
      closeTxSheet: () => set({ txSheet: { open: false } }),
    }),
    {
      name: "orbita:ui",
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }),
      // Reidratado no client (Providers) para não divergir do HTML do servidor.
      skipHydration: true,
    },
  ),
);
