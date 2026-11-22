"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { completeTask, taskKeys } from "@/features/tasks/api";
import { getQueryClient } from "@/lib/query-client";
import { useFocusStore } from "./focus-store";

async function notify(title: string, body: string) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const registration = await navigator.serviceWorker?.ready;
    if (registration) await registration.showNotification(title, { body, icon: "/icons/icon-192.png", tag: "focus" });
    else new Notification(title, { body });
  } catch {
    // Sem permissão/suporte: o toast dentro do app já avisa.
  }
}

/**
 * Montado uma vez no shell: reidrata o timer persistido e, quando a contagem
 * acaba (mesmo em outra tela), fecha a sessão, avisa e oferece concluir a tarefa.
 */
export function FocusTicker() {
  const endsAt = useFocusStore((s) => s.endsAt);

  useEffect(() => {
    void useFocusStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (endsAt == null) return;
    const fire = () => {
      const s = useFocusStore.getState();
      if (s.endsAt == null || s.endsAt > Date.now()) return;
      const wasFocus = s.mode === "focus";
      const taskId = s.taskId;
      s.finish();
      if (wasFocus) {
        void notify("Sessão de foco concluída", "Hora de uma pausa de 5 minutos.");
        toast.success("Sessão de foco concluída! Pausa de 5 min liberada.", {
          duration: 10_000,
          action: taskId
            ? {
                label: "Concluir tarefa",
                onClick: () =>
                  void completeTask(taskId).then(() => getQueryClient().invalidateQueries({ queryKey: taskKeys.all })),
              }
            : undefined,
        });
      } else {
        void notify("Pausa encerrada", "Bora para a próxima sessão?");
        toast("Pausa encerrada. Bora para a próxima sessão?");
      }
    };
    const id = setInterval(fire, 1000);
    fire();
    return () => clearInterval(id);
  }, [endsAt]);

  return null;
}
