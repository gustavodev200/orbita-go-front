"use client";

import { useRouter } from "next/navigation";

import { CelebrationModal } from "@/components/orbita/celebration-modal";
import { XpToast } from "@/components/orbita/xp-toast";
import { useShieldMutation } from "@/features/gamification/hooks";
import { useAppStore } from "@/stores/app-store";

/** Camada global: toast de XP + fila de modais de celebração. */
export function RewardLayer() {
  const router = useRouter();
  const toast = useAppStore((s) => s.toast);
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const replaceModal = useAppStore((s) => s.replaceModal);
  const shield = useShieldMutation();

  return (
    <>
      <XpToast toast={toast} />
      <CelebrationModal
        modal={modal}
        busy={shield.isPending}
        onClose={closeModal}
        onPrimary={(m) => {
          if (m.kind === "ofensiva") {
            shield.mutate(undefined, {
              onSuccess: () => replaceModal({ kind: "escudo", streak: m.streak }),
            });
            return;
          }
          closeModal();
          if (m.kind === "meta") router.push("/financas?tab=metas&nova=1");
        }}
      />
    </>
  );
}
