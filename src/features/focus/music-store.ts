import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { YouTubeSource } from "./youtube";

export type MusicTrack = YouTubeSource & { title: string };

type MusicState = {
  /** Última música escolhida (fica salva para a próxima sessão). */
  track: MusicTrack | null;
  /** Player montado e tocando. */
  playing: boolean;
  /** Mini-player recolhido em barra (o vídeo continua tocando). */
  minimized: boolean;
  play: (track: MusicTrack) => void;
  stop: () => void;
  setMinimized: (m: boolean) => void;
};

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      track: null,
      playing: false,
      minimized: false,
      play: (track) => set({ track, playing: true, minimized: false }),
      stop: () => set({ playing: false }),
      setMinimized: (minimized) => set({ minimized }),
    }),
    {
      name: "orbita:focus-music",
      // Ao recarregar a página o player não volta sozinho (autoplay sem clique é bloqueado).
      partialize: ({ track }) => ({ track }),
      skipHydration: true,
    },
  ),
);
