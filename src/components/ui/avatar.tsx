"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** Avatar circular azul com base 3D; iniciais em Nunito 900. */
function Avatar({
  className,
  src,
  name,
  size = 40,
}: {
  className?: string;
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const initials = (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex shrink-0 overflow-hidden rounded-full bg-b text-white", className)}
      style={{ width: size, height: size, boxShadow: `inset 0 -${Math.max(3, Math.round(size / 16))}px 0 var(--bdk)` }}
    >
      {src ? <AvatarPrimitive.Image src={src} alt={name ?? ""} className="size-full object-cover" /> : null}
      <AvatarPrimitive.Fallback
        className="flex size-full items-center justify-center font-display leading-none font-black"
        style={{ fontSize: Math.round(size * 0.375) }}
      >
        {initials || "?"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar };
