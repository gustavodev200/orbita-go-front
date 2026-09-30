"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useAppStore } from "@/stores/app-store";

/** Toaster para mensagens de sistema (erros, confirmações). XP usa o XpToast. */
function Toaster(props: ToasterProps) {
  const theme = useAppStore((s) => s.theme);
  return (
    <Sonner
      theme={theme}
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-[18px] !border-2 !border-b-[5px] !border-bd !bg-sf !text-ink !font-sans !font-semibold !shadow-[0_12px_30px_rgba(0,0,0,.12)]",
          error: "!border-[color:var(--r)]",
          success: "!border-g",
          title: "!font-display !font-extrabold",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
