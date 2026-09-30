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
  silent?: boolean;
};

/** Mutação simples: invalida caches e mostra erro amigável (sonner). */
export function useApiMutation<TVars = void, TData = unknown>(opts: Options<TVars, TData>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: opts.mutationFn,
    onSuccess: (data, vars) => {
      opts.invalidate?.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
      opts.onSuccess?.(data, vars);
    },
    onError: (error, vars) => {
      if (!opts.silent) toast.error(mapApiError(error));
      opts.onError?.(error, vars);
    },
  });
}

/**
 * Mutação que responde `{ data, reward }`: passa o reward pelo handleReward
 * (me + toast XP + modais) com a mensagem do toast.
 */
export function useRewardedMutation<TVars = void, TData = unknown>(
  opts: Omit<Options<TVars, WithReward<TData>>, "onSuccess"> & {
    message?: (data: TData, vars: TVars) => string | undefined;
    onSuccess?: (data: TData, vars: TVars) => void;
  },
) {
  return useApiMutation<TVars, WithReward<TData>>({
    ...opts,
    onSuccess: (res, vars) => {
      handleReward(res.reward, opts.message?.(res.data, vars));
      opts.onSuccess?.(res.data, vars);
    },
  });
}
