"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Cobre } from "@/components/orbita/cobre";
import { GoogleButton } from "@/components/orbita/google-button";
import { Icon } from "@/components/orbita/icon";
import { useIsDesktop } from "@/hooks/use-media-query";
import { hasSupabaseEnv } from "@/lib/env";
import { safeNextPath, signInWithGoogle } from "./auth";

function OrbitTile({ icon, bg, shadow, size, className }: { icon: string; bg: string; shadow: string; size: number; className: string }) {
  return (
    <div
      className={`absolute flex items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: size / 3, background: bg, boxShadow: `inset 0 -4px 0 ${shadow}` }}
    >
      <Icon name={icon} size={size * 0.6} className="text-white" />
    </div>
  );
}

/** Login: hero verde com Cobre comemorando e 2 órbitas girando; só "Continuar com Google". */
export function LoginScreen() {
  const desktop = useIsDesktop();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (params.has("error")) toast.error("Não foi possível entrar com o Google. Tente de novo.");
  }, [params]);

  // No mobile, o hero não tem padding e o anel ocupa a largura do device: em
  // 360-390px, um anel de 360px deixava os tiles decorativos (que "sentam"
  // na borda do anel, ±20px) parcial ou totalmente cortados pelo
  // `overflow-hidden`. 300/210 dão folga suficiente até 360px.
  const o1 = desktop ? 380 : 210;
  const o2 = desktop ? 560 : 300;

  async function login() {
    if (!hasSupabaseEnv()) {
      toast.error("Login indisponível: configure as variáveis do Supabase.");
      return;
    }
    setRedirecting(true);
    const { error } = await signInWithGoogle(next);
    if (error) {
      setRedirecting(false);
      toast.error("Não foi possível iniciar o login com o Google.");
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-bg lg:flex-row">
      <div className="relative flex min-h-[360px] flex-none items-center justify-center overflow-hidden rounded-b-[40px] bg-g lg:min-h-dvh lg:flex-[1.1] lg:rounded-none">
        <div
          className="absolute animate-spin-slow rounded-full border-[3px] border-dashed border-white/28"
          style={{ width: o1, height: o1 }}
        >
          <OrbitTile icon="bolt" bg="var(--y)" shadow="var(--yd)" size={36} className="-top-[18px] left-1/2 -ml-[18px]" />
          <OrbitTile icon="local_fire_department" bg="var(--o)" shadow="var(--od)" size={36} className="top-1/2 -left-[18px] -mt-[18px]" />
        </div>
        <div
          className="absolute animate-spin-slower-reverse rounded-full border-[3px] border-white/14"
          style={{ width: o2, height: o2 }}
        >
          <OrbitTile icon="task_alt" bg="var(--b)" shadow="var(--bdk)" size={40} className="top-1/2 -right-5 -mt-5" />
          <OrbitTile icon="savings" bg="var(--p)" shadow="var(--pd)" size={40} className="-bottom-5 left-1/2 -ml-5" />
        </div>
        <Cobre mood="comemorando" size={desktop ? 220 : 150} />
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pt-7 pb-9 lg:p-12">
        <div className="flex w-full max-w-[400px] flex-col gap-3.5 text-center lg:text-left">
          <div className="font-display text-[34px] leading-none font-black tracking-[-.02em] text-g lg:text-[40px]">órbitaGO</div>
          <h1 className="m-0 font-display text-[28px] leading-[1.1] font-black text-balance text-ink lg:text-[40px]">
            Sua vida, subindo de nível.
          </h1>
          <p className="m-0 mb-2.5 text-base leading-normal font-semibold text-pretty text-mut">
            Finanças e tarefas num lugar só, com ofensivas, missões e um mascote que torce por você.
          </p>
          <GoogleButton onClick={login} disabled={redirecting}>
            {redirecting ? "Redirecionando…" : "Continuar com Google"}
          </GoogleButton>
          <p className="m-0 mt-2 text-xs leading-normal font-semibold text-mut">
            Ao continuar, você aceita os Termos e a Política de Privacidade. Nada de senha pra lembrar.
          </p>
        </div>
      </div>
    </main>
  );
}
