import { describe, expect, it } from "vitest";

import { safeNextPath } from "@/features/auth/auth";

describe("safeNextPath", () => {
  it("mantém caminho interno com query e hash", () => {
    expect(safeNextPath("/financas?tab=metas#x")).toBe("/financas?tab=metas#x");
  });

  it("cai no padrão sem valor ou com caminho relativo", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath("financas")).toBe("/");
  });

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/\r/evil.com",
    "/\\\\evil.com",
  ])("bloqueia open redirect: %j", (raw) => {
    const next = safeNextPath(raw);
    expect(new URL(next, "https://orbita.app").origin).toBe("https://orbita.app");
  });
});
