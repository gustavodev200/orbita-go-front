"use client";

import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getQueryClient } from "@/lib/query-client";
import { useAppStore } from "@/stores/app-store";

/** Aplica a classe `dark` no <html> conforme preferência (light/dark/system). */
function ThemeController() {
  const theme = useAppStore((s) => s.theme);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  useEffect(() => {
    const dark = theme === "dark" || (theme === "system" && systemDark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [theme, systemDark]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  useEffect(() => {
    // Store persistido com skipHydration: reidrata só no client.
    useAppStore.persist.rehydrate();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeController />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
