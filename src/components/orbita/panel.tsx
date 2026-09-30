import * as React from "react";

import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/** Cabeçalho de sheet/dialog: [fechar] título centralizado [espaço]. */
function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 px-4 pt-3.5 pb-2.5">
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="flex size-10 items-center justify-center rounded-xl bg-transparent text-mut hover:text-ink"
      >
        <Icon name="close" size={28} />
      </button>
      <div className="flex-1 text-center font-display text-lg leading-none font-black">{title}</div>
      <div className="w-10" />
    </div>
  );
}

function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-h-0 flex-1 flex-col gap-3.5 overflow-auto px-4 pt-1 pb-4", className)} {...props} />;
}

function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("shrink-0 px-4 pt-3 pb-4", className)} {...props} />;
}

/** Rótulo de campo em caixa alta (Nunito 900 13px, --mut). */
function FieldLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-2 font-display text-[13px] leading-none font-black tracking-[.08em] text-mut uppercase", className)}
      {...props}
    />
  );
}

export { PanelHeader, PanelBody, PanelFooter, FieldLabel };
