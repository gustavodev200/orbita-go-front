"use client";

import { useEffect } from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";
import { useMusicStore } from "./music-store";
import { embedUrl, watchUrl } from "./youtube";

/**
 * Mini-player fixo, montado uma vez no shell: a música continua ao trocar de
 * tela. Recolher só esconde o vídeo (o iframe segue montado e tocando).
 */
export function MusicPlayer() {
  const { track, playing, minimized, stop, setMinimized } = useMusicStore();

  useEffect(() => {
    void useMusicStore.persist.rehydrate();
  }, []);

  if (!track || !playing) return null;

  return (
    <aside
      aria-label="Música tocando"
      className="fixed right-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-30 w-[min(240px,calc(100vw-24px))] lg:w-[300px] overflow-hidden rounded-3xl bg-sf shadow-[0_16px_40px_rgba(0,0,0,.18)] lg:right-6 lg:bottom-6"
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gs text-g">
          <Icon name="music_note" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm leading-none font-medium">{track.title}</div>
          <a href={watchUrl(track)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs leading-none text-mut">
            Abrir no YouTube
          </a>
        </div>
        <button
          type="button"
          onClick={() => setMinimized(!minimized)}
          aria-label={minimized ? "Mostrar vídeo" : "Recolher vídeo"}
          className="flex size-8 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
        >
          <Icon name={minimized ? "expand_less" : "expand_more"} size={20} />
        </button>
        <button
          type="button"
          onClick={stop}
          aria-label="Parar música"
          className="flex size-8 items-center justify-center rounded-full text-mut hover:bg-sf2 hover:text-ink"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className={cn("relative aspect-video w-full bg-black", minimized && "pointer-events-none absolute size-px opacity-0")}>
        <iframe
          key={`${track.kind}-${track.id}`}
          src={embedUrl(track)}
          title={track.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </aside>
  );
}
