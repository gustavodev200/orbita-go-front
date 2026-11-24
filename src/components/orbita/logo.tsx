import * as React from "react";

import { cn } from "@/lib/utils";

// Geometria em unidades de 64 (centro 32,32) — espelhada em scripts/generate-icons.mjs
// (favicon e ícones do PWA). Mudou aqui, rode o script de novo.
const PLANET_R = 15;
const RX = 27;
const RY = 8.5;
const TILT = -24;
const SAT_DEG = 38;
const SAT: [number, number] = [RX * Math.cos((SAT_DEG * Math.PI) / 180), RY * Math.sin((SAT_DEG * Math.PI) / 180)];
/** Metade da frente do anel (passa na frente do planeta). */
const FRONT_ARC = `M ${-RX} 0 A ${RX} ${RY} 0 0 0 ${RX} 0`;
/** Órbita completa começando pela frente (para o satélite animado). */
const ORBIT = `M ${RX} 0 A ${RX} ${RY} 0 1 1 ${-RX} 0 A ${RX} ${RY} 0 1 1 ${RX} 0`;

/**
 * Marca órbitaGO: planeta laranja com volume, anel inclinado que passa atrás
 * no alto e na frente embaixo, e um satélite em órbita (o "GO").
 *
 * - Anel e satélite usam `--ink` (acompanha o tema; sobrescreva em fundos escuros fixos).
 * - `--logo-cut` é a cor do fundo atrás da marca — vira o "vão" onde o anel cruza
 *   o planeta (padrão `--sf`, a superfície dos cards e da sidebar).
 * - `animated`: o satélite dá a volta (por trás do planeta, inclusive). Respeita
 *   `prefers-reduced-motion` (fica parado).
 */
function LogoMark({ size = 34, animated, className }: { size?: number; animated?: boolean; className?: string }) {
  const id = React.useId();
  const planet = `${id}-planet`;
  const clipPlanet = `${id}-clip`;
  const clipFront = `${id}-front`;
  // Em tamanhos pequenos o traço precisa engrossar para não sumir.
  const ring = size < 48 ? 4.4 : 3.4;
  const satR = size < 48 ? 4.4 : 3.8;
  const satellite = (extra?: React.ReactNode, cls?: string) => (
    <circle
      cx={animated && extra ? 0 : SAT[0]}
      cy={animated && extra ? 0 : SAT[1]}
      r={satR}
      fill="var(--ink)"
      stroke="var(--logo-cut, var(--sf))"
      strokeWidth="1.8"
      className={cls}
    >
      {extra}
    </circle>
  );
  const motion = <animateMotion dur="3.2s" repeatCount="indefinite" path={ORBIT} />;

  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 64 64" className={cn("shrink-0 overflow-visible", className)}>
      <defs>
        <radialGradient id={planet} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#FFB37D" />
          <stop offset="0.45" stopColor="#FF6A1F" />
          <stop offset="1" stopColor="#C9430A" />
        </radialGradient>
        <clipPath id={clipPlanet}>
          <circle r={PLANET_R} />
        </clipPath>
        <clipPath id={clipFront}>
          <rect x={-40} y={0} width={80} height={40} />
        </clipPath>
      </defs>
      <g transform="translate(32 32)">
        {/* anel inteiro (a parte de trás fica sob o planeta) + satélite quando passa por trás */}
        <g transform={`rotate(${TILT})`}>
          <ellipse rx={RX} ry={RY} fill="none" stroke="var(--ink)" strokeWidth={ring} />
          {animated ? <g className="motion-reduce:hidden">{satellite(motion)}</g> : null}
        </g>
        <circle r={PLANET_R} fill={`url(#${planet})`} />
        {/* vão onde o anel cruza o planeta */}
        <g clipPath={`url(#${clipPlanet})`}>
          <path transform={`rotate(${TILT})`} d={FRONT_ARC} fill="none" stroke="var(--logo-cut, var(--sf))" strokeWidth={ring + 3} />
        </g>
        <g transform={`rotate(${TILT})`}>
          <path d={FRONT_ARC} fill="none" stroke="var(--ink)" strokeWidth={ring} strokeLinecap="round" />
          {animated ? (
            <>
              <g clipPath={`url(#${clipFront})`} className="motion-reduce:hidden">
                {satellite(motion)}
              </g>
              {satellite(undefined, "motion-safe:hidden")}
            </>
          ) : (
            satellite()
          )}
        </g>
      </g>
    </svg>
  );
}

/** Wordmark "órbitaGO" — "GO" na cor de destaque. */
function Wordmark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("leading-none font-semibold tracking-[-.02em] text-ink", className)} style={{ fontSize: size }}>
      órbita<span className="text-g">GO</span>
    </span>
  );
}

export { LogoMark, Wordmark };
