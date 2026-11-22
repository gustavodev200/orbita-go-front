"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/** Checkbox redondo: contorno cinza → círculo laranja com check. */
function CheckCircle({
  checked,
  onCheckedChange,
  size = 26,
  label = "Concluir",
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full p-0 transition-colors duration-150",
        checked ? "bg-g text-white" : "border-2 border-bd bg-transparent text-transparent hover:border-mut",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {checked ? (
        <motion.span className="flex" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ duration: 0.18 }}>
          <Icon name="check" size={Math.round(size * 0.7)} />
        </motion.span>
      ) : null}
    </button>
  );
}

export { CheckCircle };
