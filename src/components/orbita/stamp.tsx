"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Carimbo "FEITO!": scale 2.6 → .92 → 1, rotate −14°, 450ms com overshoot. */
function Stamp({ children = "FEITO!", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute top-1/2 right-[18px] -mt-[22px] h-11 rounded-xl border-4 border-g bg-sf px-3.5 font-display text-xl leading-9 font-black tracking-[.08em] text-g",
        className,
      )}
      initial={{ opacity: 0, rotate: -14, scale: 2.6 }}
      animate={{ opacity: [0, 1, 1], rotate: -14, scale: [2.6, 0.92, 1] }}
      transition={{ duration: 0.45, times: [0, 0.6, 1], ease: [0.3, 1.5, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}

export { Stamp };
