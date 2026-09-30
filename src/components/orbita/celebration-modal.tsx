"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Cobre } from "@/components/orbita/cobre";
import { Confetti } from "@/components/orbita/confetti";
import { Icon } from "@/components/orbita/icon";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ModalState } from "@/stores/app-store";

type RewardChip = { icon: string; label: string; bg: string; bd: string; c: string };

type Content = {
  bg: string;
  cardBg: string;
  kicker: string;
  title: string;
  text: string;
  kickC: string;
  titleC: string;
  textC: string;
  btnBg: string;
  btnC: string;
  btnSh: string;
  btn: string;
  rayC?: string;
  rewards: RewardChip[];
  sec?: string;
};

const WHITE_CHIP = { bg: "rgba(255,255,255,.18)", bd: "rgba(255,255,255,.3)", c: "#fff" };
const GOLD_CHIP = { bg: "rgba(255,255,255,.4)", bd: "rgba(255,255,255,.6)", c: "#3A2800" };

/** Copy e cores por `kind` — Celebracao.dc.html. */
function contentFor(m: ModalState): Content {
  switch (m.kind) {
    case "nivel":
      return {
        bg: "#20B878", cardBg: "transparent", kicker: "Subiu de nível!", title: `Nível ${m.level ?? ""}`.trim(),
        text: "Você está cuidando da grana como gente grande. Continue assim e novos títulos aparecem.",
        kickC: "#FFF3B0", titleC: "#fff", textC: "rgba(255,255,255,.92)", btnBg: "#fff", btnC: "#149160", btnSh: "#0E7A50",
        btn: "Continuar", rayC: "rgba(255,255,255,.18)",
        rewards: [{ icon: "military_tech", label: "Novo nível", ...WHITE_CHIP }, { icon: "storefront", label: "Loja liberada", ...WHITE_CHIP }],
      };
    case "conquista":
      return {
        bg: "rgba(30,20,10,.55)", cardBg: "var(--sf)", kicker: "Conquista desbloqueada",
        title: m.achievement?.title ?? "Primeiro passo",
        text: m.achievement?.description ?? "Você começou a organizar a vida. Isso já te coloca na frente de muita gente.",
        kickC: "var(--o)", titleC: "var(--ink)", textC: "var(--mut)", btnBg: "var(--g)", btnC: "#fff", btnSh: "var(--gd)",
        btn: "Show!", rayC: "rgba(255,194,31,.25)", rewards: [],
      };
    case "ofensiva": {
      const n = m.streak ?? 0;
      return {
        bg: "rgba(30,20,10,.6)", cardBg: "var(--sf)", kicker: "Ofensiva perdida", title: "O fogo apagou…",
        text: `Você não fechou o dia ontem e a ofensiva${n ? ` de ${n} dias` : ""} zerou. Use um escudo para recuperar.`,
        kickC: "var(--r)", titleC: "var(--ink)", textC: "var(--mut)", btnBg: "var(--b)", btnC: "#fff", btnSh: "var(--bdk)",
        btn: "Usar escudo · 200 moedas",
        rewards: [{ icon: "local_fire_department", label: `${n} → 0 dias`, bg: "var(--rs)", bd: "var(--r)", c: "var(--rd)" }],
        sec: "Começar do zero",
      };
    }
    case "escudo": {
      const n = m.streak ?? 0;
      return {
        bg: "rgba(30,20,10,.55)", cardBg: "var(--sf)", kicker: "Salvo pelo escudo", title: "Ofensiva protegida!",
        text: `Seu escudo segurou a onda. A ofensiva${n ? ` de ${n} dias` : ""} continua de pé. Hoje é dia de fechar o dia!`,
        kickC: "var(--b)", titleC: "var(--ink)", textC: "var(--mut)", btnBg: "var(--o)", btnC: "#fff", btnSh: "var(--od)",
        btn: "Bora!", rayC: "rgba(46,139,239,.18)",
        rewards: [{ icon: "local_fire_department", label: `${n} dias mantidos`, bg: "var(--os)", bd: "var(--o)", c: "var(--od)" }],
      };
    }
    case "meta": {
      const g = m.goal;
      return {
        bg: "#FFC21F", cardBg: "transparent", kicker: "Meta concluída!",
        title: g ? `${g.name} garantida` : "Meta garantida",
        text: g
          ? `${formatBRL(g.targetCents)} guardados em ${g.steps} passos. Agora é só aproveitar a conquista.`
          : "Todos os passos da trilha concluídos. Agora é só aproveitar a conquista.",
        kickC: "#7A4E00", titleC: "#3A2800", textC: "#5A3E00", btnBg: "#fff", btnC: "#D39500", btnSh: "#B07A00",
        btn: "Criar próxima meta", rayC: "rgba(255,255,255,.35)",
        rewards: [{ icon: "emoji_events", label: "Medalha Zerou a trilha", ...GOLD_CHIP }],
        sec: "Voltar",
      };
    }
  }
}

function Hero({ modal }: { modal: ModalState }) {
  switch (modal.kind) {
    case "nivel":
      return (
        <div className="relative flex items-end">
          <Cobre mood="comemorando" size={150} />
          <div className="absolute -top-1 -right-[34px] flex size-[72px] rotate-[8deg] items-center justify-center rounded-[22px] border-4 border-white bg-p font-display text-[34px] leading-none font-black text-white shadow-[inset_0_-6px_0_var(--pd)]">
            {modal.level}
          </div>
        </div>
      );
    case "conquista":
      return (
        <>
          <div className="relative flex size-[140px] items-center justify-center rounded-full bg-[#FF8A1E] shadow-[inset_0_-10px_0_#D96A00,0_0_0_8px_rgba(255,255,255,.6)]">
            <div className="absolute inset-3 rounded-full border-4 border-white/40" />
            <Icon name={modal.achievement?.icon ?? "flag"} size={70} className="text-white" />
          </div>
          <div className="absolute right-0 bottom-0">
            <Cobre mood="comemorando" size={80} />
          </div>
        </>
      );
    case "ofensiva":
      return (
        <>
          <motion.div
            className="relative flex size-[140px] items-center justify-center rounded-full bg-sf2"
            animate={{ x: [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Icon name="local_fire_department" size={90} className="text-bd" />
          </motion.div>
          <div className="absolute right-1.5 bottom-0">
            <Cobre mood="preocupado" size={84} />
          </div>
        </>
      );
    case "escudo":
      return (
        <>
          <div className="relative flex h-[150px] w-[140px] items-center justify-center">
            <Icon name="shield" size={150} className="absolute text-[#2E8BEF]" />
            <Icon name="local_fire_department" size={62} className="relative -mt-1.5 text-[#FF8A1E]" />
          </div>
          <div className="absolute right-0 bottom-0">
            <Cobre mood="feliz" size={80} />
          </div>
        </>
      );
    case "meta":
      return (
        <>
          <div className="relative flex size-[140px] items-center justify-center rounded-[40px] bg-[#FFC21F] shadow-[inset_0_-10px_0_#D39500]">
            <Icon name="emoji_events" size={86} className="text-white" />
          </div>
          <div className="absolute -right-1 -bottom-1.5">
            <Cobre mood="comemorando" size={86} />
          </div>
        </>
      );
  }
}

/**
 * Modal de celebração (nivel | conquista | ofensiva | escudo | meta).
 * Entrada: scale .6 → 1.08 → 1 em 500ms; confete nas festas; raios girando.
 */
function CelebrationModal({
  modal,
  onClose,
  onPrimary,
  onSecondary,
  busy,
}: {
  modal: ModalState | null;
  onClose: () => void;
  /** Padrão: fecha. Ofensiva usa para comprar/usar escudo. */
  onPrimary?: (m: ModalState) => void;
  onSecondary?: (m: ModalState) => void;
  busy?: boolean;
}) {
  const c = modal ? contentFor(modal) : null;
  const full = modal?.kind === "nivel" || modal?.kind === "meta";
  const party = modal?.kind === "nivel" || modal?.kind === "conquista" || modal?.kind === "meta";

  return (
    <DialogPrimitive.Root open={!!modal} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {modal && c ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                key={`${modal.kind}-${modal.level ?? ""}-${modal.achievement?.key ?? ""}`}
                className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden p-5 outline-none"
                style={{ background: c.bg }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <DialogPrimitive.Title className="sr-only">{c.title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">{c.text}</DialogPrimitive.Description>
                {party ? <Confetti /> : null}
                <motion.div
                  className={cn(
                    "relative flex w-full flex-col items-center gap-3.5 rounded-[32px] text-center",
                    full ? "max-w-[520px] p-2.5" : "max-w-[440px] px-6 pt-7 pb-5",
                  )}
                  style={{ background: c.cardBg }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: [0.6, 1.08, 1] }}
                  transition={{ duration: 0.5, times: [0, 0.6, 1], ease: [0.3, 1.4, 0.5, 1] }}
                >
                  <div className="relative flex h-[200px] w-[220px] items-center justify-center">
                    {c.rayC ? (
                      <div
                        aria-hidden
                        className="absolute top-1/2 left-1/2 -mt-[150px] -ml-[150px] size-[300px] animate-rays rounded-full"
                        style={{
                          background: `repeating-conic-gradient(${c.rayC} 0 12deg, transparent 12deg 30deg)`,
                          maskImage: "radial-gradient(circle, #000 20%, transparent 68%)",
                          WebkitMaskImage: "radial-gradient(circle, #000 20%, transparent 68%)",
                        }}
                      />
                    ) : null}
                    <Hero modal={modal} />
                  </div>
                  <div className="font-display text-[13px] leading-none font-black tracking-[.14em] uppercase" style={{ color: c.kickC }}>
                    {c.kicker}
                  </div>
                  <div
                    className={cn(
                      "font-display leading-[1.08] font-black tracking-[-.01em] text-balance",
                      full ? "text-[42px] lg:text-[52px]" : "text-[30px] lg:text-[34px]",
                    )}
                    style={{ color: c.titleC }}
                  >
                    {c.title}
                  </div>
                  <div className="max-w-[380px] text-base leading-[1.45] font-semibold text-pretty" style={{ color: c.textC }}>
                    {c.text}
                  </div>
                  {c.rewards.length ? (
                    <div className="mt-1.5 mb-1 flex flex-wrap justify-center gap-2">
                      {c.rewards.map((r) => (
                        <div
                          key={r.label}
                          className="flex h-10 items-center gap-1.5 rounded-xl border-2 px-3.5 font-display text-[15px] leading-none font-black"
                          style={{ background: r.bg, borderColor: r.bd, color: r.c }}
                        >
                          <Icon name={r.icon} size={20} />
                          {r.label}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => (onPrimary ? onPrimary(modal) : onClose())}
                    className="h-14 w-full max-w-[360px] rounded-2xl font-display text-base leading-none font-black tracking-[.06em] uppercase transition-[transform,box-shadow] duration-[80ms] active:translate-y-[5px] active:shadow-none disabled:opacity-70"
                    style={{ background: c.btnBg, color: c.btnC, boxShadow: `0 5px 0 ${c.btnSh}` }}
                  >
                    {c.btn}
                  </button>
                  {c.sec ? (
                    <button
                      type="button"
                      onClick={() => (onSecondary ? onSecondary(modal) : onClose())}
                      className="h-11 bg-transparent font-display text-sm leading-none font-black tracking-[.06em] uppercase"
                      style={{ color: c.textC }}
                    >
                      {c.sec}
                    </button>
                  ) : null}
                </motion.div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export { CelebrationModal };
