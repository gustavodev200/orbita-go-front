"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Cobre, type CobreMood } from "@/components/orbita/cobre";
import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/** Vazio: Cobre (dormindo/feliz) + título + texto + CTA verde. */
function EmptyState({
  title,
  text,
  ctaLabel,
  onCta,
  mood = "dormindo",
  compact,
  className,
}: {
  title: string;
  text: string;
  ctaLabel?: string;
  onCta?: () => void;
  mood?: CobreMood;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2.5 px-3 py-[18px] text-center", className)}>
      <Cobre mood={mood} size={compact ? 72 : 96} />
      <div className="font-display text-lg leading-[1.25] font-black text-balance text-ink">{title}</div>
      <div className="max-w-[300px] text-sm leading-[1.45] font-medium text-pretty text-mut">{text}</div>
      {ctaLabel ? (
        <Button size="sm" className="mt-1.5 h-[46px] px-5 text-sm font-extrabold" onClick={onCta}>
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}

/** Carregando: linhas skeleton (tile 44 + 2 linhas + valor) com shimmer 1,3s. */
function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Carregando" className={cn("flex flex-col gap-3.5 py-1", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-[14px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-[62%] rounded-md" />
            <Skeleton className="h-2.5 w-[36%] rounded-md" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** Erro: fundo --rs, Cobre preocupado, "Tentar de novo" secundário vermelho. */
function ErrorState({ onRetry, compact, className }: { onRetry?: () => void; compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2.5 rounded-[18px] bg-rs px-3 py-[18px] text-center", className)}>
      <Cobre mood="preocupado" size={compact ? 72 : 96} />
      <div className="font-display text-lg leading-[1.25] font-black text-ink">Ops, não consegui carregar</div>
      <div className="max-w-[300px] text-sm leading-[1.45] font-medium text-mut">
        A conexão tropeçou no caminho. Seus dados estão seguros — é só tentar de novo.
      </div>
      <Button variant="secondary-danger" size="sm" className="mt-1.5 h-[46px] px-5 text-sm font-extrabold" onClick={onRetry}>
        <Icon name="refresh" size={20} />
        Tentar de novo
      </Button>
    </div>
  );
}

type QueryLike = { isPending: boolean; isError: boolean; refetch: () => unknown };

/**
 * Orquestra os 3 estados de uma lista a partir de uma query do react-query.
 * `empty` é renderizado quando `isEmpty` é true; senão, `children`.
 */
function QueryState({
  query,
  isEmpty,
  empty,
  rows = 3,
  compact,
  frame = (node) => node,
  children,
}: {
  query: QueryLike;
  isEmpty: boolean;
  empty: React.ReactNode;
  rows?: number;
  compact?: boolean;
  /** Envolve vazio/carregando/erro (ex.: dentro de um Card quando a lista não tem card próprio). */
  frame?: (node: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}) {
  if (query.isPending) return <>{frame(<LoadingState rows={rows} />)}</>;
  if (query.isError) return <>{frame(<ErrorState compact={compact} onRetry={() => query.refetch()} />)}</>;
  if (isEmpty) return <>{frame(empty)}</>;
  return <>{children}</>;
}

export { EmptyState, LoadingState, ErrorState, QueryState };
