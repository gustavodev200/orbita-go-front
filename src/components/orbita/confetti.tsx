"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#20B878", "#FFC21F", "#FF8A1E", "#2E8BEF", "#EC4E9C", "#8B5CF6"];

/** Gerador determinístico (mesmo do protótipo) — sem Math.random no render. */
function makePieces(count: number) {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  return Array.from({ length: count }, (_, i) => ({
    left: rnd() * 100,
    w: 8 + rnd() * 8,
    h: 10 + rnd() * 10,
    round: rnd() > 0.6,
    color: COLORS[i % COLORS.length],
    dx: (rnd() - 0.5) * 200,
    rot: rnd() * 900 - 450,
    duration: 2.2 + rnd() * 2.2,
    delay: rnd() * 1.4,
  }));
}

/** Confete: 70 peças, 6 cores, queda 2,2–4,4s com rotação, em loop. */
function Confetti({ count = 70 }: { count?: number }) {
  const reduce = useReducedMotion();
  const pieces = React.useMemo(() => makePieces(count), [count]);
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute -top-5"
          style={{ left: `${p.left}%`, width: p.w, height: p.h, borderRadius: p.round ? "50%" : 3, background: p.color }}
          initial={{ y: -20, x: 0, rotate: 0 }}
          animate={{ y: "110vh", x: p.dx, rotate: p.rot }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: [0.2, 0.6, 0.4, 1] }}
        />
      ))}
    </div>
  );
}

export { Confetti };
