"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Icon } from "@/components/orbita/icon";
import { cn } from "@/lib/utils";

/** Vazio: ícone num círculo suave + título + texto + CTA. */
function EmptyState({
  title,
  text,
  ctaLabel,
  onCta,
  icon = "inbox",
  compact,
  className,
}: {
  title: string;
  text: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-3 text-center", compact ? "py-3" : "py-6", className)}>
      <div className={cn("flex items-center justify-center rounded-full bg-gs text-g", compact ? "size-12" : "size-16")}>
        <Icon name={icon} size={compact ? 24 : 30} />
      </div>
      <div className="mt-1 text-base leading-[1.3] font-semibold text-balance text-ink">{title}</div>
      <div className="max-w-[300px] text-sm leading-[1.45] text-pretty text-mut">{text}</div>
      {ctaLabel ? (
        <Button size="sm" className="mt-2" onClick={onCta}>
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}

/** Carregando: linhas skeleton (tile + 2 linhas + valor). */
function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Carregando" className={cn("flex flex-col gap-3.5 py-1", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-[62%] rounded-full" />
            <Skeleton className="h-2.5 w-[36%] rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Erro: aviso discreto + "Tentar de novo". */
function ErrorState({ onRetry, compact, className }: { onRetry?: () => void; compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-2xl px-3 text-center", compact ? "py-3" : "py-6", className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-rs text-r">
        <Icon name="cloud_off" size={24} />
      </div>
      <div className="mt-1 text-base leading-[1.3] font-semibold text-ink">Não consegui carregar</div>
      <div className="max-w-[300px] text-sm leading-[1.45] text-mut">Verifique a conexão e tente de novo. Seus dados estão seguros.</div>
      <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
        <Icon name="refresh" size={18} />
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
