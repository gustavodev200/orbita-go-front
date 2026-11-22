"use client";

import { useCallback, useEffect, useState } from "react";

import { useUpdateMe } from "@/features/me/hooks";
import { useAppStore } from "@/stores/app-store";
import { isIOS, isPushSupported, isStandalone, usePushSubscription } from "./use-push-subscription";

export type PushState =
  /** iPhone fora do app instalado: precisa "Adicionar à Tela de Início". */
  | "needs-install"
  /** Navegador sem Push API. */
  | "unsupported"
  /** Usuário bloqueou notificações para o site. */
  | "denied"
  /** Permitido + inscrito neste aparelho + preferência ligada. */
  | "on"
  | "off";

/** Lê permissão + inscrição do navegador e cruza com a preferência salva. */
async function readPushState(enabledPref: boolean): Promise<PushState> {
  if (!isPushSupported()) return isIOS() && !isStandalone() ? "needs-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    return enabledPref && Notification.permission === "granted" && subscription ? "on" : "off";
  } catch {
    return "off";
  }
}

/** Estado real das notificações neste aparelho (permissão + inscrição + preferência). */
export function usePushStatus() {
  const enabledPref = useAppStore((s) => s.me?.notificationsEnabled ?? false);
  const [state, setState] = useState<PushState>("off");

  useEffect(() => {
    let alive = true;
    void readPushState(enabledPref).then((next) => alive && setState(next));
    return () => {
      alive = false;
    };
  }, [enabledPref]);

  const refresh = useCallback(async () => setState(await readPushState(useAppStore.getState().me?.notificationsEnabled ?? false)), []);

  return { state, refresh };
}

/**
 * Garante push ativo no momento em que o usuário cria algo que avisa
 * (lembrete, tarefa com lembrete). Pede permissão só se ainda não deu;
 * reassinar é idempotente no back (upsert por endpoint).
 */
export function useEnsurePush() {
  const push = usePushSubscription();
  const updateMe = useUpdateMe();
  const enabledPref = useAppStore((s) => s.me?.notificationsEnabled ?? false);

  return useCallback(async (): Promise<boolean> => {
    if (typeof Notification !== "undefined" && Notification.permission === "denied") return false;
    const ok = await push.subscribe();
    if (ok && !enabledPref) updateMe.mutate({ notificationsEnabled: true });
    return ok;
  }, [push, updateMe, enabledPref]);
}
