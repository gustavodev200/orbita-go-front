"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUpdateMe } from "@/features/me/hooks";
import { cn } from "@/lib/utils";
import { sendTestPush } from "./api";
import { usePushStatus, type PushState } from "./use-push-status";
import { usePushSubscription } from "./use-push-subscription";

const COPY: Record<PushState, { title: string; text: string; icon: string; tone: "on" | "off" | "warn" }> = {
  on: {
    title: "Notificações ativas",
    text: "Seus lembretes chegam neste aparelho, mesmo com o app fechado.",
    icon: "notifications_active",
    tone: "on",
  },
  off: {
    title: "Notificações desligadas",
    text: "Ative para receber seus lembretes na hora certa.",
    icon: "notifications_off",
    tone: "off",
  },
  denied: {
    title: "Notificações bloqueadas",
    text: "O navegador está bloqueando avisos deste site. Libere em Configurações do site → Notificações e volte aqui.",
    icon: "block",
    tone: "warn",
  },
  "needs-install": {
    title: "Instale o app para receber avisos",
    text: "No iPhone, toque em Compartilhar → \"Adicionar à Tela de Início\" e abra o órbitaGO pelo ícone.",
    icon: "install_mobile",
    tone: "warn",
  },
  unsupported: {
    title: "Sem suporte a notificações",
    text: "Este navegador não recebe notificações push. Tente o Chrome, Edge ou o app instalado.",
    icon: "notifications_off",
    tone: "warn",
  },
};

/** Mostra uma notificação direto pelo service worker (sem passar pelo servidor). */
async function showLocalTest() {
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification("Notificações ativas", {
    body: "Este aparelho consegue exibir avisos do órbitaGO.",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge-96.png",
    tag: "push-test",
  });
}

/** Card de status das notificações: ativar/desativar e enviar um teste real. */
export function NotificationsCard({ className }: { className?: string }) {
  const { state, refresh } = usePushStatus();
  const push = usePushSubscription();
  const updateMe = useUpdateMe();
  const [testing, setTesting] = useState(false);
  const copy = COPY[state];
  const busy = push.isPending || updateMe.isPending;

  async function toggle(next: boolean) {
    const ok = next ? await push.subscribe() : await push.unsubscribe();
    if (ok) await updateMe.mutateAsync({ notificationsEnabled: next }).catch(() => undefined);
    await refresh();
    if (ok && next) toast.success("Notificações ativadas neste aparelho.");
  }

  async function test() {
    setTesting(true);
    try {
      const { delivered } = await sendTestPush();
      if (delivered > 0) {
        toast.success("Teste enviado. A notificação deve chegar em instantes.");
      } else {
        await showLocalTest();
        toast.message("O servidor não encontrou este aparelho. Desative e ative de novo para reinscrever.");
      }
    } catch {
      await showLocalTest().catch(() => undefined);
      toast.error("Não consegui falar com o servidor; mostrei um teste local.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            copy.tone === "on" && "bg-oks text-ok",
            copy.tone === "off" && "bg-sf2 text-mut",
            copy.tone === "warn" && "bg-ys text-yd",
          )}
        >
          <Icon name={copy.icon} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-[1.3] font-semibold">{copy.title}</div>
          <div className="mt-1 text-[13px] leading-[1.45] text-mut">{copy.text}</div>
        </div>
      </div>
      {state === "on" ? (
        <div className="flex gap-2">
          <Button size="sm" variant="dark" className="flex-1" disabled={testing} onClick={test}>
            <Icon name="send" size={18} />
            {testing ? "Enviando…" : "Enviar teste"}
          </Button>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => toggle(false)}>
            Desativar
          </Button>
        </div>
      ) : state === "off" ? (
        <Button size="sm" disabled={busy} onClick={() => toggle(true)}>
          <Icon name="notifications_active" size={18} />
          {busy ? "Ativando…" : "Ativar notificações"}
        </Button>
      ) : null}
    </Card>
  );
}
