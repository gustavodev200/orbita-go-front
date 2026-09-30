"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { useIsDesktop } from "@/hooks/use-media-query";
import type { Goal } from "@/lib/api/schemas";
import { formatBRL } from "@/lib/format";

/** Offsets X da trilha em zig-zag (×0.7 no mobile). */
const XS = [0, 56, 84, 56, 0, -56, -84, -56, 0, 40];
/** Baús depois dos nós 3 e 7 (índices 2 e 6). */
const CHEST_AFTER = [2, 6];
const CHEST_COINS = 50;

type NodeState = "done" | "current" | "locked";

function TrailNode({ state, last, label }: { state: NodeState; last: boolean; label: string }) {
  const reduce = useReducedMotion();
  const on = state !== "locked";
  const icon = state === "done" ? "check" : state === "current" ? "savings" : last ? "emoji_events" : "lock";
  return (
    <>
      <motion.div
        className="flex h-[66px] w-[72px] items-center justify-center rounded-full"
        style={{ background: on ? "var(--g)" : "var(--sf2)", boxShadow: `0 6px 0 ${on ? "var(--gd)" : "var(--bd)"}` }}
        animate={
          state === "current" && !reduce
            ? {
                boxShadow: [
                  "0 0 0 0 rgba(32,184,120,.45), 0 6px 0 #149160",
                  "0 0 0 14px rgba(32,184,120,0), 0 6px 0 #149160",
                  "0 0 0 0 rgba(32,184,120,.45), 0 6px 0 #149160",
                ],
              }
            : undefined
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      >
        <Icon name={icon} size={34} style={{ color: on ? "#fff" : "var(--mut)" }} />
      </motion.div>
      <div className="num mt-3 text-xs leading-none font-extrabold text-mut">{label}</div>
    </>
  );
}

function Chest({ opened }: { opened: boolean }) {
  return (
    <>
      <div className="relative h-[58px] w-[74px]">
        <motion.div
          className="absolute left-1 h-6 w-[66px] rounded-[14px_14px_4px_4px] shadow-[inset_0_-3px_0_rgba(0,0,0,.18)]"
          style={{ background: opened ? "#C88A2E" : "#E0A43A", transformOrigin: "left bottom" }}
          initial={false}
          animate={{ rotate: opened ? -28 : 0, top: opened ? -6 : 2 }}
          transition={{ type: "spring", stiffness: 220, damping: 12 }}
        />
        <div
          className="absolute top-6 left-1 h-8 w-[66px] rounded-[4px_4px_12px_12px] shadow-[inset_0_-5px_0_rgba(0,0,0,.2)]"
          style={{ background: opened ? "#B87824" : "#C98A2B" }}
        />
        <div className="absolute top-5 left-[30px] h-[18px] w-3.5 rounded" style={{ background: opened ? "transparent" : "var(--y)" }} />
      </div>
      <div className="mt-2 text-xs leading-none font-extrabold" style={{ color: opened ? "var(--mut)" : "var(--yd)" }}>
        {opened ? `Aberto · +${CHEST_COINS} moedas` : `Baú · ${CHEST_COINS} moedas`}
      </div>
    </>
  );
}

/**
 * Trilha vertical da meta: nós 72×66 (feito/atual/bloqueado), troféu no fim,
 * baús após os nós 3 e 7. O nó atual pulsa e tem o balão "Guardar R$ X".
 */
export function GoalTrail({ goal, onSave, saving }: { goal: Goal; onSave: (amountCents: number) => void; saving?: boolean }) {
  const desktop = useIsDesktop();
  const reduce = useReducedMotion();
  const steps = goal.steps || 10;
  const per = Math.round(goal.targetCents / steps);
  const current = goal.completed ? steps : goal.currentStep;
  const k = desktop ? 1 : 0.7;

  const items: ({ kind: "node"; i: number } | { kind: "chest"; i: number })[] = [];
  for (let i = 0; i < steps; i++) {
    items.push({ kind: "node", i });
    if (CHEST_AFTER.includes(i)) items.push({ kind: "chest", i });
  }

  return (
    <div className="relative flex flex-col items-center gap-[22px] pt-2.5 pb-5">
      {items.map((it, idx) => {
        const x = XS[idx % XS.length] * k;
        if (it.kind === "chest") {
          const opened = current > it.i || goal.chestsOpened.includes(it.i + 1);
          return (
            <div key={`c${it.i}`} className="relative flex flex-col items-center" style={{ transform: `translateX(${x}px)` }}>
              <Chest opened={opened} />
            </div>
          );
        }
        const state: NodeState = it.i < current ? "done" : it.i === current ? "current" : "locked";
        const amount = it.i === steps - 1 ? goal.targetCents - per * (steps - 1) : per;
        return (
          <div key={`n${it.i}`} className="relative flex flex-col items-center" style={{ transform: `translateX(${x}px)` }}>
            {state === "current" ? (
              <motion.div
                className="z-[2] mb-2.5 flex flex-col items-center"
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Button size="sm" className="h-11 rounded-[14px] px-4 text-sm" disabled={saving} onClick={() => onSave(amount)}>
                  Guardar {formatBRL(amount, { compact: true })}
                </Button>
                <div className="-mt-2 size-3.5 rotate-45 bg-g" />
              </motion.div>
            ) : null}
            <TrailNode state={state} last={it.i === steps - 1} label={formatBRL(per * (it.i + 1), { compact: true })} />
          </div>
        );
      })}
    </div>
  );
}
