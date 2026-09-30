"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Dialog controlado com animação framer-motion (overlay fade + scale .92 → 1).
 * Esc e clique no overlay fecham (Radix).
 */
function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  overlayClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className={cn("fixed inset-0 z-40 bg-[rgba(30,20,10,.45)]", overlayClassName)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4 lg:p-8">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  className={cn(
                    "pointer-events-auto relative flex max-h-[92%] w-full max-w-[580px] flex-col overflow-hidden rounded-[28px] bg-bg shadow-[0_20px_60px_rgba(0,0,0,.25)] outline-none",
                    className,
                  )}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                  <DialogPrimitive.Description className="sr-only">{description ?? title}</DialogPrimitive.Description>
                  {children}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

const DialogClose = DialogPrimitive.Close;

export { Dialog, DialogClose };
