"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

/** Confirmação curta antes de uma ação destrutiva. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  text,
  confirmLabel = "Confirmar",
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} className="max-w-[400px]">
      <div className="flex flex-col gap-2 px-6 pt-6 pb-2">
        <div className="text-lg leading-[1.25] font-semibold">{title}</div>
        <div className="text-sm leading-[1.5] text-mut">{text}</div>
      </div>
      <div className="flex gap-2 px-6 pt-4 pb-6">
        <Button variant="secondary" className="flex-1" onClick={() => onOpenChange(false)} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
