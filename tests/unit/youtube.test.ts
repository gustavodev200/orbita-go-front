import { describe, expect, it } from "vitest";

import { embedUrl, parseYouTube } from "@/features/focus/youtube";

describe("parseYouTube", () => {
  it.each([
    ["https://www.youtube.com/watch?v=jfKfPfyJRdk", "jfKfPfyJRdk"],
    ["https://youtu.be/jfKfPfyJRdk?si=abc", "jfKfPfyJRdk"],
    ["youtube.com/live/jfKfPfyJRdk", "jfKfPfyJRdk"],
    ["https://m.youtube.com/shorts/jfKfPfyJRdk", "jfKfPfyJRdk"],
    ["https://music.youtube.com/watch?v=jfKfPfyJRdk&list=RDAMVM", "jfKfPfyJRdk"],
  ])("vídeo: %s", (url, id) => {
    expect(parseYouTube(url)).toEqual({ kind: "video", id });
  });

  it("playlist", () => {
    expect(parseYouTube("https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG")).toEqual({
      kind: "playlist",
      id: "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG",
    });
  });

  it.each(["https://vimeo.com/123", "https://evil.com/watch?v=jfKfPfyJRdk", "texto qualquer", "https://youtube.com/watch?v=<script>"])(
    "recusa %s",
    (url) => {
      expect(parseYouTube(url)).toBeNull();
    },
  );
});

describe("embedUrl", () => {
  it("usa youtube-nocookie com autoplay", () => {
    expect(embedUrl({ kind: "video", id: "jfKfPfyJRdk" })).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/jfKfPfyJRdk\?autoplay=1/);
  });
});
