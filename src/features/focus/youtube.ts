export type YouTubeSource = { kind: "video" | "playlist"; id: string };

const HOSTS = new Set(["youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "youtube-nocookie.com"]);
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const LIST_ID = /^[A-Za-z0-9_-]{10,64}$/;

/**
 * Extrai vídeo/live/shorts ou playlist de um link do YouTube. Só o ID sai daqui
 * (validado por regex) — o embed nunca usa a URL colada.
 */
export function parseYouTube(raw: string): YouTubeSource | null {
  let url: URL;
  try {
    url = new URL(raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (!HOSTS.has(host)) return null;

  const video = (id: string | null | undefined): YouTubeSource | null => (id && VIDEO_ID.test(id) ? { kind: "video", id } : null);

  if (host === "youtu.be") return video(url.pathname.split("/")[1]);

  const [first, second] = url.pathname.split("/").filter(Boolean);
  if (first === "watch") {
    return video(url.searchParams.get("v")) ?? playlist(url.searchParams.get("list"));
  }
  if (first === "playlist") return playlist(url.searchParams.get("list"));
  if (first === "live" || first === "shorts" || first === "embed") return video(second);
  return null;
}

function playlist(id: string | null): YouTubeSource | null {
  return id && LIST_ID.test(id) ? { kind: "playlist", id } : null;
}

/** Player sem cookies de rastreamento; começa tocando (a escolha foi um clique). */
export function embedUrl(src: YouTubeSource): string {
  const params = "autoplay=1&rel=0&modestbranding=1&playsinline=1";
  return src.kind === "video"
    ? `https://www.youtube-nocookie.com/embed/${src.id}?${params}`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=${src.id}&${params}`;
}

export function watchUrl(src: YouTubeSource): string {
  return src.kind === "video" ? `https://www.youtube.com/watch?v=${src.id}` : `https://www.youtube.com/playlist?list=${src.id}`;
}

/** Estações prontas (lives 24h; IDs conferidos via oEmbed em 2026-11-24). */
export const MUSIC_PRESETS: { id: string; title: string; hint: string; icon: string }[] = [
  { id: "jfKfPfyJRdk", title: "Lofi", hint: "beats para estudar", icon: "headphones" },
  { id: "HuFYqnbVbzY", title: "Jazz lofi", hint: "jazz tranquilo", icon: "piano" },
  { id: "5yx6BWlEVcY", title: "Chillhop", hint: "jazzy & lofi", icon: "coffee" },
  { id: "rUxyKA_-grg", title: "Bem calmo", hint: "para relaxar", icon: "bedtime" },
  { id: "4xDzrJKXOOY", title: "Synthwave", hint: "eletrônico suave", icon: "graphic_eq" },
];
