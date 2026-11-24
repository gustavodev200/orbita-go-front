"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Gráficos leves em HTML/SVG com os tokens do app. Regras (skill dataviz):
 * marcas finas, pontas arredondadas de 4px presas na base, 2px de folga entre
 * barras, grade/eixos discretos, legenda para ≥ 2 séries, tooltip no hover e
 * tabela equivalente para leitores de tela. Cor de série nunca pinta texto.
 */

export type ChartSeries = { name: string; color: string };

/** Teto "bonito" para o eixo (1, 2, 2.5, 5 × 10^n). */
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(v));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

export function ChartLegend({
  series,
  className,
}: {
  series: ChartSeries[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] leading-none text-mut",
        className,
      )}
    >
      {series.map((s) => (
        <span key={s.name} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 rounded-full"
            style={{ background: s.color }}
          />
          {s.name}
        </span>
      ))}
    </div>
  );
}

function Tooltip({
  title,
  rows,
  align,
}: {
  title: string;
  rows: { name: string; value: string; color?: string }[];
  align: number;
}) {
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute bottom-full z-10 mb-2 min-w-36 rounded-2xl bg-ink px-3 py-2.5 text-bg shadow-[0_8px_24px_rgba(0,0,0,.18)]"
      style={{ left: `${align}%`, transform: `translateX(-${align}%)` }}
    >
      <div className="mb-1.5 text-xs leading-none font-semibold">{title}</div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center gap-2 py-0.5 text-xs leading-none"
        >
          {r.color ? (
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: r.color }}
            />
          ) : null}
          <span className="flex-1 opacity-75">{r.name}</span>
          <span className="num font-semibold">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Tabela só para leitores de tela (o gráfico em si fica `aria-hidden`). */
function SrTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    // `sr-only` no wrapper: tabela ignora width:1px e alargaria a página.
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type BarDatum = { label: string; title?: string; values: number[] };

/**
 * Barras verticais (agrupadas quando há mais de uma série), valores ≥ 0.
 * A coluna inteira é o alvo do hover.
 */
export function BarChart({
  data,
  series,
  format,
  caption,
  height = 180,
  max: maxProp,
  className,
}: {
  data: BarDatum[];
  series: ChartSeries[];
  format: (v: number) => string;
  caption: string;
  height?: number;
  /** Força o teto do eixo (ex.: 100 para %). */
  max?: number;
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const max = maxProp ?? niceMax(Math.max(0, ...data.flatMap((d) => d.values)));
  const ticks = [max, max / 2, 0];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {series.length > 1 ? <ChartLegend series={series} /> : null}
      <div className="flex gap-2">
        <div
          aria-hidden
          className="flex flex-col justify-between pb-6 text-right text-[11px] leading-none text-mut"
          style={{ height }}
        >
          {ticks.map((t) => (
            <span key={t} className="num">
              {format(t)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1" aria-hidden>
          <div
            className="absolute inset-x-0 top-0 flex flex-col justify-between"
            style={{ height: height - 24 }}
          >
            {ticks.map((t, i) => (
              <div
                key={t}
                className={cn(
                  "h-px",
                  i === ticks.length - 1 ? "bg-bd" : "bg-bd/60",
                )}
              />
            ))}
          </div>
          <div
            className="relative flex"
            style={{ height }}
            onMouseLeave={() => setHover(null)}
          >
            {data.map((d, i) => (
              <div
                key={d.label + i}
                className="relative flex flex-1 flex-col items-center"
                onMouseEnter={() => setHover(i)}
                onTouchStart={() => setHover(i)}
              >
                <div
                  className={cn(
                    "flex w-full flex-1 items-end justify-center gap-[2px] rounded-t-lg px-[18%] transition-colors",
                    hover === i && "bg-sf2/70",
                  )}
                  style={{ maxHeight: height - 24 }}
                >
                  {d.values.map((v, s) => (
                    <div
                      key={s}
                      className="min-w-[3px] flex-1 rounded-t-[4px] transition-[height] duration-500"
                      style={{
                        height: `${(v / max) * 100}%`,
                        maxWidth: 18,
                        background: series[s].color,
                      }}
                    />
                  ))}
                </div>
                <div className="flex h-6 items-end text-[11px] leading-none text-mut">
                  {d.label}
                </div>
                {hover === i ? (
                  <Tooltip
                    title={d.title ?? d.label}
                    align={data.length > 1 ? (i / (data.length - 1)) * 100 : 50}
                    rows={series.map((s, k) => ({
                      name: s.name,
                      value: format(d.values[k]),
                      color: series.length > 1 ? s.color : undefined,
                    }))}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <SrTable
        caption={caption}
        columns={["", ...series.map((s) => s.name)]}
        rows={data.map((d) => [d.title ?? d.label, ...d.values.map(format)])}
      />
    </div>
  );
}

export type LineDatum = { label: string; title?: string; value: number };

/** Linha única de 2px com área suave; aceita negativos (linha de zero destacada). */
export function LineChart({
  data,
  color,
  name,
  format,
  caption,
  height = 160,
  className,
}: {
  data: LineDatum[];
  color: string;
  name: string;
  format: (v: number) => string;
  caption: string;
  height?: number;
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const values = data.map((d) => d.value);
  const hi = niceMax(Math.max(0, ...values));
  const lo = Math.min(0, ...values) < 0 ? -niceMax(-Math.min(...values)) : 0;
  const span = hi - lo || 1;
  const plotH = height - 24;
  const x = (i: number) =>
    data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
  const y = (v: number) => ((hi - v) / span) * 100;
  const points = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const zeroY = y(0);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex gap-2">
        <div
          aria-hidden
          className="flex flex-col justify-between pb-6 text-right text-[11px] leading-none text-mut"
          style={{ height }}
        >
          <span className="num">{format(hi)}</span>
          <span className="num">{format(lo)}</span>
        </div>
        <div
          className="relative min-w-0 flex-1 px-1.5"
          aria-hidden
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-x-1.5 top-0 w-[calc(100%-12px)] overflow-visible"
            style={{ height: plotH }}
          >
            <line
              x1="0"
              x2="100"
              y1={zeroY}
              y2={zeroY}
              stroke="var(--bd)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {data.length > 1 ? (
              <>
                <polygon
                  points={`0,${zeroY} ${points} 100,${zeroY}`}
                  fill={color}
                  opacity="0.08"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            ) : null}
            {hover !== null ? (
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1="0"
                y2="100"
                stroke="var(--mut)"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
          </svg>
          {hover !== null ? (
            <span
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-sf"
              style={{
                left: `calc(6px + (100% - 12px) * ${x(hover) / 100})`,
                top: (plotH * y(data[hover].value)) / 100,
                background: color,
              }}
            />
          ) : null}
          <div className="relative flex" style={{ height }}>
            {data.map((d, i) => (
              <div
                key={d.label + i}
                className="relative flex flex-1 flex-col justify-end"
                onMouseEnter={() => setHover(i)}
                onTouchStart={() => setHover(i)}
              >
                <div className="flex h-6 items-end justify-center text-[11px] leading-none text-mut">
                  {d.label}
                </div>
                {hover === i ? (
                  <Tooltip
                    title={d.title ?? d.label}
                    align={x(i)}
                    rows={[{ name, value: format(d.value) }]}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      <SrTable
        caption={caption}
        columns={["", name]}
        rows={data.map((d) => [d.title ?? d.label, format(d.value)])}
      />
    </div>
  );
}

/** Barra horizontal com rótulo e valor (ranking por categoria). */
export function HBarList({
  items,
  format,
  caption,
  color = "var(--g)",
}: {
  items: {
    key: string;
    label: string;
    value: number;
    icon?: React.ReactNode;
  }[];
  format: (v: number) => string;
  caption: string;
  color?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-3">
      <ul
        aria-label={caption}
        className="m-0 flex list-none flex-col gap-3 p-0"
      >
        {items.map((i) => (
          <li key={i.key} className="flex items-center gap-3">
            {i.icon}
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm leading-none">
                <span className="truncate font-medium">{i.label}</span>
                <span className="num shrink-0 text-mut">{format(i.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-sf2">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${(i.value / max) * 100}%`,
                    background: color,
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
