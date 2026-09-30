import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("manifest", () => {
  it("declara nome, cores e start_url do órbitaGO", () => {
    const m = manifest();
    expect(m.name).toBe("órbitaGO");
    expect(m.short_name).toBe("órbitaGO");
    expect(m.start_url).toBe("/");
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toBe("#20B878");
    expect(m.background_color).toBe("#FBF6EE");
  });

  it("inclui os 3 ícones (192, 512 e o 512 maskable)", () => {
    const icons = manifest().icons ?? [];
    expect(icons).toHaveLength(3);

    const bySize = (size: string) => icons.filter((i) => i.sizes === size);
    expect(bySize("192x192")).toHaveLength(1);

    const icons512 = bySize("512x512");
    expect(icons512).toHaveLength(2);
    expect(icons512.every((i) => i.type === "image/png")).toBe(true);

    const maskable = icons512.find((i) => i.purpose === "maskable");
    expect(maskable).toBeDefined();
    expect(maskable?.src).toBe("/icons/icon-512-maskable.png");

    const nonMaskable = icons512.find((i) => i.purpose !== "maskable");
    expect(nonMaskable?.src).toBe("/icons/icon-512.png");

    expect(icons.find((i) => i.sizes === "192x192")?.src).toBe("/icons/icon-192.png");
  });
});
