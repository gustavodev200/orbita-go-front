"use client";

import { useCallback, useEffect, useRef } from "react";

import type { ThemePref } from "@/lib/api/schemas";
import { useMediaQuery } from "@/hooks/use-media-query";
import { updateMe } from "@/features/me/api";
import { useAppStore } from "@/stores/app-store";

/** Tema efetivo + setter que persiste local e sincroniza com PATCH /me. */
export function useTheme() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isDark = theme === "dark" || (theme === "system" && systemDark);

  const setThemePref = useCallback(
    (next: ThemePref) => {
      setTheme(next);
      updateMe({ theme: next })
        .then((me) => useAppStore.getState().setMe(me))
        .catch(() => {
          // Preferência local continua valendo; sincroniza na próxima.
        });
    },
    [setTheme],
  );

  const toggle = useCallback(() => setThemePref(isDark ? "light" : "dark"), [isDark, setThemePref]);

  return { theme, isDark, setThemePref, toggle };
}

/** Na primeira carga do `me`, adota o tema salvo no servidor. */
export function useAdoptServerTheme() {
  const meTheme = useAppStore((s) => s.me?.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const adopted = useRef(false);
  useEffect(() => {
    if (!meTheme || adopted.current) return;
    adopted.current = true;
    setTheme(meTheme);
  }, [meTheme, setTheme]);
}
