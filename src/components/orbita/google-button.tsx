import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** "G" do Google em conic-gradient (como no design). */
function GoogleGlyph({ size = 24 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "conic-gradient(#EA4335 0 25%, #FBBC05 0 50%, #34A853 0 75%, #4285F4 0)",
      }}
    >
      <span className="rounded-full bg-sf" style={{ width: size / 2, height: size / 2 }} />
    </span>
  );
}

/** Botão secundário 58px "Continuar com Google". */
function GoogleButton({ className, children = "Continuar com Google", ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="secondary"
      size="lg"
      className={cn("h-[58px] gap-3 text-base tracking-[.02em] normal-case", className)}
      {...props}
    >
      <GoogleGlyph />
      {children}
    </Button>
  );
}

export { GoogleButton, GoogleGlyph };
