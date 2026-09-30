"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { env } from "@/lib/env";
import { subscribePush, unsubscribePush } from "./api";
import { urlBase64ToUint8Array } from "./url-base64";

function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

/** iPhone/iPad — no Safari, a Push API só existe quando o site roda instalado (Tela de Início). */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as { standalone?: boolean }).standalone === true;
}

/**
 * Assina/cancela Web Push no navegador atual. Não mexe em `Me` nem no switch
 * — quem chama decide o que fazer com o resultado (ver `ProfileScreen`).
 */
export function usePushSubscription() {
  const [isPending, setIsPending] = useState(false);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) {
      if (isIOS() && !isStandalone()) {
        toast.error(
          "No iPhone, notificações só funcionam com o app instalado. Toque em Compartilhar → \"Adicionar à Tela de Início\", abra o órbitaGO por esse ícone e tente de novo.",
          { duration: 8000 },
        );
      } else {
        toast.error("Este navegador não suporta notificações push.");
      }
      return false;
    }
    if (!env.vapidPublicKey) {
      toast.error("Notificações push ainda não estão configuradas.");
      return false;
    }
    setIsPending(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permita notificações no navegador para ativar esse recurso.");
        return false;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // Cast: lib.dom tipa BufferSource sobre ArrayBuffer estrito, mas
          // TypedArray aqui é sempre genérico sobre ArrayBufferLike — válido em runtime.
          applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey) as BufferSource,
        }));
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Assinatura de push incompleta");
      }
      await subscribePush({ endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } });
      return true;
    } catch (error) {
      // Expomos o erro real (nome técnico) em vez de uma mensagem genérica:
      // iOS Safari tem várias causas distintas para a Push API falhar
      // (AbortError, NotAllowedError, InvalidStateError...) e sem isso não dá
      // pra diferenciar "sem permissão" de "serviço da Apple recusou agora".
      const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      console.error("[push] subscribe falhou:", error);
      toast.error(`Não foi possível ativar as notificações (${detail}). Tenta fechar e abrir o app de novo.`, {
        duration: 10000,
      });
      return false;
    } finally {
      setIsPending(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported()) return true;
    setIsPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await unsubscribePush(endpoint).catch(() => {
          // Já cancelada no navegador; se o back não souber, o próximo push
          // simplesmente falha e a subscription é limpa do lado dele.
        });
      }
      return true;
    } catch {
      toast.error("Não foi possível desativar as notificações agora.");
      return false;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { subscribe, unsubscribe, isPending };
}
