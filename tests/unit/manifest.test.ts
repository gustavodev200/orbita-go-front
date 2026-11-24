import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("manifest", () => {
  it("declara nome, cores e start_url do órbitaGO", () => {
    const m = manifest();
    expect(m.name).toBe("órbitaGO");
    expect(m.short_name).toBe("órbitaGO");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#F4F4F6");
    expect(m.background_color).toBe("#F4F4F6");
  });

  it("tem ícone comum e maskable em 192 e 512, todos PNG", () => {
    const icons = manifest().icons ?? [];
    expect(icons).toHaveLength(4);
    expect(icons.every((i) => i.type === "image/png")).toBe(true);
    const find = (size: string, purpose: string) => icons.find((i) => i.sizes === size && i.purpose === purpose)?.src;
    expect(find("192x192", "any")).toBe("/icons/icon-192.png");
    expect(find("512x512", "any")).toBe("/icons/icon-512.png");
    expect(find("192x192", "maskable")).toBe("/icons/icon-192-maskable.png");
    expect(find("512x512", "maskable")).toBe("/icons/icon-512-maskable.png");
  });
});
