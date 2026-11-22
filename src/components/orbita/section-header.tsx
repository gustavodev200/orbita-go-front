import * as React from "react";

import { cn } from "@/lib/utils";

/** "Categoria ………… Ver tudo" — título de seção + auxiliar/ação à direita. */
function SectionHeader({
  title,
  aside,
  size = "lg",
  className,
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3 px-1", className)}>
      <h2 className={cn("m-0 leading-[1.2] font-semibold tracking-[-.01em]", size === "lg" ? "text-lg" : "text-base")}>{title}</h2>
      {aside != null ? <div className="text-[13px] leading-none text-mut">{aside}</div> : null}
    </div>
  );
}

export { SectionHeader };
