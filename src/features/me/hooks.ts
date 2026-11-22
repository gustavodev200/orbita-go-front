"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { FALLBACK_CATEGORIES } from "@/lib/categories";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { useAppStore } from "@/stores/app-store";
import {
  getAccounts,
  getCategories,
  getCompare,
  getMe,
  meKeys,
  updateMe,
  type UpdateMeInput,
} from "./api";

/** `me` do back; espelhado no store (header, perfil, handleReward). */
export function useMe(enabled = true) {
  const setMe = useAppStore((s) => s.setMe);
  const query = useQuery({ queryKey: meKeys.me, queryFn: getMe, enabled, staleTime: 30_000 });
  useEffect(() => {
    if (query.data) setMe(query.data);
  }, [query.data, setMe]);
  return query;
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const setMe = useAppStore((s) => s.setMe);
  return useApiMutation({
    mutationFn: (input: UpdateMeInput) => updateMe(input),
    onSuccess: (me) => {
      qc.setQueryData(meKeys.me, me);
      setMe(me);
    },
  });
}

/** Categorias fixas; cai no catálogo local enquanto carrega/erro. */
export function useCategories() {
  const q = useQuery({ queryKey: meKeys.categories, queryFn: getCategories, staleTime: Infinity });
  return q.data?.length ? q.data : FALLBACK_CATEGORIES;
}

export function useAccounts() {
  return useQuery({ queryKey: meKeys.accounts, queryFn: getAccounts, staleTime: 5 * 60_000 });
}

export function useCompare() {
  return useQuery({ queryKey: meKeys.compare, queryFn: getCompare });
}
