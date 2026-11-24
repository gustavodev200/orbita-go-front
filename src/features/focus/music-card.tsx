"use client";

import { useState } from "react";

import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMusicStore } from "./music-store";
import { MUSIC_PRESETS, parseYouTube } from "./youtube";

/** "Som para relaxar": estações prontas ou qualquer link do YouTube. */
export function MusicCard() {
  const { track, playing, play, stop } = useMusicStore();
  const [link, setLink] = useState("");
  const [error, setError] = useState(false);

  const playLink = () => {
    const src = parseYouTube(link);
    if (!src) {
      setError(true);
      return;
    }
    play({ ...src, title: "Seu link do YouTube" });
    setLink("");
    setError(false);
  };

  const isOn = (id: string) => playing && track?.id === id;

  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold">Som para relaxar</div>
          <div className="mt-1 text-[13px] leading-[1.4] text-mut">Toca no YouTube enquanto você foca — continua ao trocar de tela.</div>
        </div>
        {playing ? (
          <Button size="sm" variant="secondary" onClick={stop}>
            <Icon name="stop" size={18} />
            Parar
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {MUSIC_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={isOn(p.id)}
            onClick={() => (isOn(p.id) ? stop() : play({ kind: "video", id: p.id, title: p.title }))}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-colors",
              isOn(p.id) ? "bg-ink text-bg" : "bg-sf2 text-ink hover:bg-bd",
            )}
          >
            <Icon name={isOn(p.id) ? "graphic_eq" : p.icon} size={20} className={cn(isOn(p.id) ? "text-g" : "text-mut")} />
            <span className="min-w-0">
              <span className="block truncate text-sm leading-none font-medium">{p.title}</span>
              <span className={cn("mt-1 block truncate text-[11px] leading-none", isOn(p.id) ? "text-bg/70" : "text-mut")}>{p.hint}</span>
            </span>
          </button>
        ))}
      </div>
      <form
        className="flex items-start gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          playLink();
        }}
      >
        <Input
          containerClassName="flex-1"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setError(false);
          }}
          placeholder="Cole um link do YouTube"
          aria-label="Link do YouTube"
          aria-invalid={error}
          inputMode="url"
          icon={<Icon name="link" size={20} className="text-mut" />}
        />
        <Button type="submit" disabled={!link.trim()} aria-label="Tocar link">
          <Icon name="play_arrow" size={20} />
        </Button>
      </form>
      {error ? <div className="-mt-1.5 text-[13px] text-rd">Não reconheci esse link. Use um link de vídeo, live ou playlist do YouTube.</div> : null}
      {track && !playing ? (
        <button
          type="button"
          onClick={() => play(track)}
          className="flex items-center gap-1.5 self-start text-[13px] leading-none text-mut hover:text-ink"
        >
          <Icon name="replay" size={16} />
          Tocar de novo: {track.title}
        </button>
      ) : null}
    </Card>
  );
}
