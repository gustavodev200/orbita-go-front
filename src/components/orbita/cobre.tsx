"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type CobreMood = "feliz" | "preocupado" | "dormindo" | "comemorando";

type Box = { l: number; t: number; w: number; h: number };
const abs = ({ l, t, w, h }: Box): React.CSSProperties => ({ position: "absolute", left: l, top: t, width: w, height: h });

const INK = "#3A1D0E";
const ARM = "#C4642E";

function Arm({ box, rotate, origin, color = ARM }: { box: Box; rotate: number; origin: "left" | "right"; color?: string }) {
  return (
    <div
      style={{ ...abs(box), borderRadius: 8, background: color, transform: `rotate(${rotate}deg)`, transformOrigin: `${origin} center` }}
    />
  );
}

function Spark({ box, color, delay }: { box: Box; color: string; delay: number }) {
  return (
    <motion.div
      style={{ ...abs(box), background: color, borderRadius: 2, rotate: 45 }}
      animate={{ scale: [0.5, 1.1, 0.5], opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Zzz({ l, t, size, delay }: { l: number; t: number; size: number; delay: number }) {
  return (
    <motion.div
      style={{ position: "absolute", left: l, top: t, font: `900 ${size}px/1 var(--font-nunito), sans-serif`, color: "#8B7BC8" }}
      animate={{ opacity: [0, 1, 0], x: [0, 5, 12], y: [0, -8, -20], scale: [0.6, 0.9, 1.15] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay, times: [0, 0.4, 1] }}
    >
      {size > 18 ? "Z" : "z"}
    </motion.div>
  );
}

/**
 * Cobre — mascote de moedinha de cobre, só formas CSS numa caixa 120×120
 * escalada por `size`. 4 humores; bob Y 4px 3,2s (dormindo 5s; comemorando
 * pulo .9s). Spec: Cobre.dc.html.
 */
function Cobre({ mood = "feliz", size = 120, className }: { mood?: CobreMood; size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const scale = size / 120;

  const bodyAnim =
    mood === "comemorando"
      ? { y: [0, -10, 0, 0], scaleX: [1, 1.04, 0.98, 1], scaleY: [1, 0.97, 1.03, 1] }
      : { y: [0, -4, 0] };
  const bodyTransition = {
    duration: mood === "comemorando" ? 0.9 : mood === "dormindo" ? 5 : 3.2,
    repeat: Infinity,
    ease: "easeInOut" as const,
    times: mood === "comemorando" ? [0, 0.3, 0.6, 1] : undefined,
  };

  return (
    <div
      role="img"
      aria-label={`Cobre ${mood}`}
      data-mood={mood}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, width: 120, height: 120, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        {/* sombra no chão */}
        <div style={{ ...abs({ l: 30, t: 108, w: 60, h: 8 }), borderRadius: "50%", background: "rgba(60,30,10,.14)" }} />
        <motion.div
          style={{ position: "absolute", inset: 0 }}
          animate={reduce ? undefined : bodyAnim}
          transition={bodyTransition}
        >
          {/* braços atrás do corpo */}
          {mood === "feliz" ? (
            <>
              <Arm box={{ l: 2, t: 62, w: 30, h: 12 }} rotate={25} origin="right" />
              <motion.div
                style={{ ...abs({ l: 88, t: 44, w: 30, h: 12 }), borderRadius: 8, background: ARM, transformOrigin: "left center" }}
                animate={reduce ? { rotate: -40 } : { rotate: [-40, -70, -40] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          ) : null}
          {mood === "dormindo" ? (
            <>
              <Arm box={{ l: 4, t: 72, w: 28, h: 12 }} rotate={30} origin="right" color="#B25A29" />
              <Arm box={{ l: 88, t: 72, w: 28, h: 12 }} rotate={-30} origin="left" color="#B25A29" />
            </>
          ) : null}
          {mood === "comemorando" ? (
            <>
              <Arm box={{ l: 0, t: 40, w: 32, h: 12 }} rotate={48} origin="right" />
              <Arm box={{ l: 88, t: 40, w: 32, h: 12 }} rotate={-48} origin="left" />
              <Spark box={{ l: 6, t: 10, w: 10, h: 10 }} color="#FFC21F" delay={0} />
              <Spark box={{ l: 104, t: 18, w: 8, h: 8 }} color="#FFC21F" delay={0.4} />
              <Spark box={{ l: 100, t: 92, w: 9, h: 9 }} color="#20B878" delay={0.8} />
            </>
          ) : null}

          {/* corpo */}
          <div
            style={{
              ...abs({ l: 14, t: 10, w: 92, h: 92 }),
              borderRadius: "50%",
              background: "radial-gradient(circle at 34% 28%, #FFC592 0%, #E98A4B 46%, #C6612A 100%)",
              boxShadow: "inset 0 -6px 0 rgba(120,50,15,.22), 0 4px 0 #9C4A1C",
              filter: mood === "dormindo" ? "saturate(.8) brightness(.95)" : "none",
            }}
          >
            <div style={{ ...abs({ l: 8, t: 8, w: 70, h: 70 }), borderRadius: "50%", border: "3px solid rgba(255,232,205,.45)", boxSizing: "border-box" }} />
            <div style={{ ...abs({ l: 18, t: 14, w: 18, h: 9 }), borderRadius: "50%", background: "rgba(255,255,255,.55)", transform: "rotate(-30deg)" }} />
          </div>

          {mood === "feliz" ? (
            <>
              {[42, 68].map((l) => (
                <div key={l} style={{ ...abs({ l, t: 44, w: 10, h: 14 }), borderRadius: "50%", background: INK }}>
                  <div style={{ ...abs({ l: 2, t: 2, w: 4, h: 4 }), borderRadius: "50%", background: "#fff" }} />
                </div>
              ))}
              <div style={{ ...abs({ l: 47, t: 64, w: 26, h: 12 }), border: `4px solid ${INK}`, borderTop: 0, borderRadius: "0 0 16px 16px", boxSizing: "border-box" }} />
              <div style={{ ...abs({ l: 29, t: 62, w: 12, h: 8 }), borderRadius: "50%", background: "rgba(255,105,105,.55)" }} />
              <div style={{ ...abs({ l: 79, t: 62, w: 12, h: 8 }), borderRadius: "50%", background: "rgba(255,105,105,.55)" }} />
            </>
          ) : null}

          {mood === "preocupado" ? (
            <>
              <div style={{ ...abs({ l: 38, t: 37, w: 15, h: 4 }), borderRadius: 4, background: INK, transform: "rotate(-18deg)" }} />
              <div style={{ ...abs({ l: 67, t: 37, w: 15, h: 4 }), borderRadius: 4, background: INK, transform: "rotate(18deg)" }} />
              <div style={{ ...abs({ l: 43, t: 47, w: 9, h: 12 }), borderRadius: "50%", background: INK }} />
              <div style={{ ...abs({ l: 68, t: 47, w: 9, h: 12 }), borderRadius: "50%", background: INK }} />
              <div style={{ ...abs({ l: 51, t: 70, w: 18, h: 9 }), border: `4px solid ${INK}`, borderBottom: 0, borderRadius: "12px 12px 0 0", boxSizing: "border-box" }} />
              <div style={{ ...abs({ l: 90, t: 20, w: 11, h: 15 }), background: "#6EC3FF", borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }} />
              <Arm box={{ l: 6, t: 62, w: 30, h: 12 }} rotate={-35} origin="right" />
              <Arm box={{ l: 84, t: 62, w: 30, h: 12 }} rotate={35} origin="left" />
            </>
          ) : null}

          {mood === "dormindo" ? (
            <>
              <div style={{ ...abs({ l: 40, t: 50, w: 14, h: 8 }), borderBottom: `4px solid ${INK}`, borderRadius: "0 0 10px 10px", boxSizing: "border-box" }} />
              <div style={{ ...abs({ l: 66, t: 50, w: 14, h: 8 }), borderBottom: `4px solid ${INK}`, borderRadius: "0 0 10px 10px", boxSizing: "border-box" }} />
              <div style={{ ...abs({ l: 55, t: 68, w: 10, h: 10 }), border: `3px solid ${INK}`, borderRadius: "50%", boxSizing: "border-box" }} />
              {reduce ? null : (
                <>
                  <Zzz l={92} t={6} size={16} delay={0} />
                  <Zzz l={100} t={0} size={22} delay={1.2} />
                </>
              )}
            </>
          ) : null}

          {mood === "comemorando" ? (
            <>
              <div style={{ ...abs({ l: 39, t: 46, w: 15, h: 8 }), borderTop: `4px solid ${INK}`, borderRadius: "10px 10px 0 0", boxSizing: "border-box" }} />
              <div style={{ ...abs({ l: 66, t: 46, w: 15, h: 8 }), borderTop: `4px solid ${INK}`, borderRadius: "10px 10px 0 0", boxSizing: "border-box" }} />
              <div style={{ ...abs({ l: 46, t: 60, w: 28, h: 19 }), background: INK, borderRadius: "4px 4px 16px 16px", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 6, bottom: -4, width: 16, height: 10, borderRadius: "50%", background: "#FF7A8A" }} />
              </div>
              <div style={{ ...abs({ l: 27, t: 60, w: 12, h: 8 }), borderRadius: "50%", background: "rgba(255,105,105,.6)" }} />
              <div style={{ ...abs({ l: 81, t: 60, w: 12, h: 8 }), borderRadius: "50%", background: "rgba(255,105,105,.6)" }} />
            </>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

export { Cobre };
