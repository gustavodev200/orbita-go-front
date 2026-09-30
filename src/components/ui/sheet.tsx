"use client";

import * as React from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Bottom sheet mobile: sobe em 300ms (cubic-bezier(.2,.9,.3,1)), 94% da altura,
 * cantos superiores 28px e alça 44×5 — arrastar a alça pra baixo fecha.
 */
function Sheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const controls = useDragControls();
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onOpenChange(false);
  };
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-[rgba(30,20,10,.45)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className={cn(
                  "fixed inset-x-0 bottom-0 z-40 flex h-[94dvh] flex-col overflow-hidden rounded-t-[28px] bg-bg shadow-[0_20px_60px_rgba(0,0,0,.25)] outline-none",
                  className,
                )}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3, ease: [0.2, 0.9, 0.3, 1] }}
                drag="y"
                dragControls={controls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={onDragEnd}
              >
                <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
                <div
                  aria-hidden
                  onPointerDown={(e) => controls.start(e)}
                  className="absolute inset-x-0 top-0 z-10 flex h-5 cursor-grab touch-none justify-center pt-1.5"
                >
                  <span className="h-[5px] w-11 rounded-[3px] bg-bd" />
                </div>
                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export { Sheet };
