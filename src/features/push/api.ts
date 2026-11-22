import { z } from "zod";

import { send } from "@/lib/api/client";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export const subscribePush = (input: PushSubscriptionInput) => send("post", "/push/subscribe", z.unknown(), input);

export const unsubscribePush = (endpoint: string) => send("delete", "/push/subscribe", z.unknown(), { endpoint });

/** Pede ao back uma notificação de teste para os aparelhos do usuário. */
export const sendTestPush = () => send("post", "/push/test", z.object({ delivered: z.number() }));
