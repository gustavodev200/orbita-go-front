"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { GoogleButton } from "@/components/orbita/google-button";
import { Icon } from "@/components/orbita/icon";
import { LogoMark } from "@/components/orbita/logo";
import { hasSupabaseEnv } from "@/lib/env";
import { safeNextPath, signInWithGoogle } from "./auth";

const FEATURES = [
  { icon: "calendar_month", label: "Agenda" },
  { icon: "notifications", label: "Lembretes" },
  { icon: "task_alt", label: "Tarefas" },
  { icon: "account_balance_wallet", label: "Finanças" },
];

/** Login: tela escura com brilho laranja, chamada curta e "Continuar com Google". */
export function LoginScreen() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (params.has("error")) toast.error("Não foi possível entrar com o Google. Tente de novo.");
  }, [params]);

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
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#0d0d0f] text-white lg:items-center lg:justify-center">
      <div aria-hidden className="absolute -top-40 -right-32 size-[520px] rounded-full bg-[#ff6a1f]/30 blur-[100px]" />
      <div aria-hidden className="absolute -bottom-48 -left-40 size-[420px] rounded-full bg-[#ff6a1f]/15 blur-[90px]" />

      <div className="relative flex flex-1 flex-col px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] lg:w-full lg:max-w-[440px] lg:flex-none lg:p-0">
        <div className="flex items-center gap-2.5">
          <LogoMark size={36} className="[--ink:#fff]" />
          <span className="text-xl leading-none font-semibold tracking-[-.02em]">
            órbita<span className="text-[#ff6a1f]">GO</span>
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-5 pt-16">
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-[13px] leading-none text-white/85">
                <Icon name={f.icon} size={16} className="text-[#ff6a1f]" />
                {f.label}
              </span>
            ))}
          </div>
          <h1 className="m-0 text-[40px] leading-[1.05] font-semibold tracking-[-.03em] text-balance lg:text-[48px]">
            Seu dia, organizado em um só lugar.
          </h1>
          <p className="m-0 text-base leading-normal text-pretty text-white/60">
            Compromissos, lembretes que chegam no celular, tarefas e o controle do seu dinheiro — simples para usar todo dia.
          </p>
          <GoogleButton onClick={login} disabled={redirecting} className="mt-2">
            {redirecting ? "Redirecionando…" : "Continuar com Google"}
          </GoogleButton>
          <p className="m-0 text-xs leading-normal text-white/40">
            Ao continuar, você aceita os Termos e a Política de Privacidade. Nada de senha para lembrar.
          </p>
        </div>
      </div>
    </main>
  );
}
