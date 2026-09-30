import * as React from "react";

import { cn } from "@/lib/utils";

/** "Missões diárias ………… renovam em 9h 12min" — título H2 20/900 + auxiliar. */
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
      <h2 className={cn("m-0 font-display leading-[1.2] font-black", size === "lg" ? "text-xl" : "text-lg")}>{title}</h2>
      {aside != null ? <div className="text-[13px] leading-none font-bold text-mut">{aside}</div> : null}
    </div>
  );
}

export { SectionHeader };
