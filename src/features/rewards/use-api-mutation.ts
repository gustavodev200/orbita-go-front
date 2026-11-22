"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import type { WithReward } from "@/lib/api/client";
import { mapApiError } from "@/lib/api/errors";
import { handleReward } from "@/features/rewards/handle-reward";

type Options<TVars, TData> = {
  mutationFn: (vars: TVars) => Promise<TData>;
  /** Queries a invalidar no sucesso. */
  invalidate?: QueryKey[];
  onSuccess?: (data: TData, vars: TVars) => void;
  onError?: (error: unknown, vars: TVars) => void;
  /** Mensagem curta de confirmação (toast) no sucesso. */
  message?: (data: TData, vars: TVars) => string | undefined;
  silent?: boolean;
};

/** Mutação simples: invalida caches, confirma com toast opcional e mostra erro amigável. */
export function useApiMutation<TVars = void, TData = unknown>(opts: Options<TVars, TData>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: opts.mutationFn,
    onSuccess: (data, vars) => {
      opts.invalidate?.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
      const msg = opts.message?.(data, vars);
      if (msg) toast.success(msg);
      opts.onSuccess?.(data, vars);
    },
    onError: (error, vars) => {
      if (!opts.silent) toast.error(mapApiError(error));
      opts.onError?.(error, vars);
    },
  });
}

/**
 * Mutação de rota que responde `{ data, reward }`: sincroniza o `me` que veio
 * no reward e entrega só o `data` para os callbacks.
 */
export function useRewardedMutation<TVars = void, TData = unknown>(
  opts: Omit<Options<TVars, WithReward<TData>>, "onSuccess" | "message"> & {
    message?: (data: TData, vars: TVars) => string | undefined;
    onSuccess?: (data: TData, vars: TVars) => void;
  },
) {
  return useApiMutation<TVars, WithReward<TData>>({
    ...opts,
    message: opts.message ? (res, vars) => opts.message?.(res.data, vars) : undefined,
    onSuccess: (res, vars) => {
      handleReward(res.reward);
      opts.onSuccess?.(res.data, vars);
    },
  });
}
