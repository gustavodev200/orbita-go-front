"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

export type XpToastData = { id: number | string; xp: number; coins?: number; message?: string };

/**
 * Cartão do toast: borda --y 2px/5px, tile amarelo com `bolt`, "+10 XP · +2 moedas".
 * Só a linha de XP é `nowrap` — a mensagem (descrição do lançamento, por
 * exemplo) pode ser longa e precisa poder quebrar em telas estreitas.
 */
function XpToastCard({ xp, coins, message, className }: Omit<XpToastData, "id"> & { className?: string }) {
  return (
    <div
      className={cn(
        "flex max-w-[min(360px,calc(100vw-2rem))] items-center gap-2.5 rounded-[18px] border-2 border-b-[5px] border-[color:var(--y)] bg-sf py-2.5 pr-[18px] pl-2.5 shadow-[0_12px_30px_rgba(0,0,0,.12)]",
        className,
      )}
    >
      <div className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-y text-white shadow-[inset_0_-3px_0_var(--yd)]">
        <Icon name="bolt" size={26} />
      </div>
      <div className="min-w-0">
        <div className="font-display text-xl leading-none font-black whitespace-nowrap text-yd">
          {xp > 0 ? `+${xp} XP` : ""}
          {coins ? `${xp > 0 ? "  ·  " : ""}+${coins} moedas` : ""}
        </div>
        {message ? <div className="mt-[3px] text-[13px] leading-[1.2] font-semibold text-pretty text-mut">{message}</div> : null}
      </div>
    </div>
  );
}

/**
 * Toast de XP fixo no topo central. Entra de cima com overshoot, fica ~2,4s
 * (controlado pelo store) e sai subindo.
 */
function XpToast({ toast, className }: { toast: XpToastData | null; className?: string }) {
  return (
    <div className={cn("pointer-events-none fixed inset-x-0 top-[72px] z-[60] flex justify-center lg:top-[84px]", className)}>
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -24, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: [0.8, 1.06, 1] }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <XpToastCard xp={toast.xp} coins={toast.coins} message={toast.message} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export { XpToast, XpToastCard };
