"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/**
 * Checkbox 3D (36px padrão, 30px compacto). Ao marcar: check com pop
 * (overshoot) e anel verde pulsando 0,6s.
 */
function Checkbox3D({
  checked,
  onCheckedChange,
  size = 36,
  label = "Concluir",
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: 30 | 36;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [ringKey, setRingKey] = React.useState(0);
  const big = size === 36;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        if (!checked) setRingKey((k) => k + 1);
        onCheckedChange(!checked);
      }}
      className={cn(
        "relative flex shrink-0 items-center justify-center p-0 transition-all duration-200",
        big ? "rounded-xl border-[3px]" : "rounded-[10px] border-[3px]",
        checked ? "border-g bg-g" : "border-bd bg-sf",
        big && !checked && "border-b-[5px]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {ringKey > 0 ? (
        <motion.span
          key={ringKey}
          aria-hidden
          className="pointer-events-none absolute -inset-[3px] rounded-[inherit]"
          initial={{ boxShadow: "0 0 0 0 rgba(32,184,120,.5)" }}
          animate={{ boxShadow: "0 0 0 14px rgba(32,184,120,0)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ) : null}
      <AnimatePresence>
        {checked ? (
          <motion.span
            key="check"
            className="flex text-white"
            initial={{ scale: 0.4 }}
            animate={{ scale: [0.4, 1.2, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.3, 1.6, 0.5, 1] }}
          >
            <Icon name="check" size={big ? 26 : 22} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}

export { Checkbox3D };
