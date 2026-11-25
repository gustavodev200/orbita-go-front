"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/features/rewards/use-api-mutation";
import {
  dismissNotification,
  getNotifications,
  getNotificationSummary,
  markAllNotificationsRead,
  markNotificationRead,
  notificationKeys,
  refreshNotifications,
  type AppNotification,
  type NotificationFilter,
} from "./api";

/** Sino: atualiza a cada 2 min com o app visível (react-query pausa em segundo plano). */
export function useNotificationSummary() {
  return useQuery({
    queryKey: notificationKeys.summary,
    queryFn: getNotificationSummary,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useNotifications(filter: NotificationFilter) {
  return useQuery({
    queryKey: notificationKeys.list(filter),
    queryFn: () => getNotifications(filter),
    refetchInterval: 120_000,
  });
}

type ListData = { items: AppNotification[]; unreadCount: number };

/** Atualiza todas as listas em cache (otimista) — o sino acompanha. */
function usePatchLists() {
  const qc = useQueryClient();
  return (fn: (items: AppNotification[]) => AppNotification[]) => {
    qc.setQueriesData<ListData>({ queryKey: [...notificationKeys.all, "list"] }, (old) => {
      if (!old) return old;
      const items = fn(old.items);
      return { items, unreadCount: items.filter((n) => !n.read).length };
    });
  };
}

export function useMarkNotificationRead() {
  const patch = usePatchLists();
  return useApiMutation({
    mutationFn: (n: AppNotification) => markNotificationRead(n.id),
    invalidate: [notificationKeys.summary],
    silent: true,
    onSuccess: (_d, n) => patch((items) => items.map((x) => (x.id === n.id ? { ...x, read: true } : x))),
  });
}

export function useMarkAllNotificationsRead() {
  const patch = usePatchLists();
  return useApiMutation({
    mutationFn: () => markAllNotificationsRead(),
    invalidate: [notificationKeys.all],
    message: () => "Tudo marcado como lido",
    onSuccess: () => patch((items) => items.map((x) => ({ ...x, read: true }))),
  });
}

export function useDismissNotification() {
  const patch = usePatchLists();
  return useApiMutation({
    mutationFn: (n: AppNotification) => dismissNotification(n.id),
    invalidate: [notificationKeys.all],
    onSuccess: (_d, n) => patch((items) => items.filter((x) => x.id !== n.id)),
  });
}

/**
 * Depois de uma ação rápida (concluir tarefa, marcar hábito…): pede ao back
 * para recalcular e recarrega a central — o alerta resolvido some na hora.
 */
export function useRefreshNotifications() {
  const qc = useQueryClient();
  return async () => {
    await refreshNotifications().catch(() => undefined);
    await qc.invalidateQueries({ queryKey: notificationKeys.all });
  };
}
