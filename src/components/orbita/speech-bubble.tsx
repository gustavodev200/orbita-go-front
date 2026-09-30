import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Balão de fala do Cobre. `tail="left"` desenha o biquinho apontando para o
 * mascote (onboarding); `raised` usa base de 4px.
 */
function SpeechBubble({
  children,
  tail,
  raised,
  className,
}: {
  children: React.ReactNode;
  tail?: "left";
  raised?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 border-bd bg-sf px-3.5 py-2.5 text-sm leading-[1.4] font-semibold text-pretty text-ink",
        raised && "rounded-[18px] border-b-4",
        className,
      )}
    >
      {tail === "left" ? (
        <span
          aria-hidden
          className="absolute bottom-4 -left-[9px] size-3.5 rotate-45 border-b-2 border-l-2 border-bd bg-sf"
        />
      ) : null}
      {children}
    </div>
  );
}

export { SpeechBubble };
