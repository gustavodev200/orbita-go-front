import axios from "axios";
import type { z } from "zod";

import { env } from "@/lib/env";
import { rewardSchema, type Reward } from "@/lib/api/schemas";
import { getSupabase } from "@/lib/supabase/client";

export const api = axios.create({ baseURL: env.apiUrl });

// Bearer = access_token da sessão Supabase (cookie, renovado pelo client).
api.interceptors.request.use(async (config) => {
  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isEnvelope(body: unknown): body is { data: unknown; reward?: unknown } {
  if (!body || typeof body !== "object" || Array.isArray(body) || !("data" in body)) return false;
  const keys = Object.keys(body);
  return "reward" in body || keys.length === 1;
}

/**
 * Rotas comuns devolvem o payload cru; só as que premiam usam `{ data, reward }`.
 * Por tolerância, um envelope `{ data }` também é aceito.
 */
export function unwrap<S extends z.ZodTypeAny>(schema: S, body: unknown): z.infer<S> {
  // Nest serializa `null` como corpo vazio (ex.: GET /boss sem chefão).
  if (body === "" || body === undefined) body = null;
  return schema.parse(isEnvelope(body) ? body.data : body);
}

export type WithReward<T> = { data: T; reward: Reward | null };

/** Para rotas que dão XP/moedas: `{ data, reward }`. */
export function unwrapReward<S extends z.ZodTypeAny>(schema: S, body: unknown): WithReward<z.infer<S>> {
  if (isEnvelope(body)) {
    const reward = body.reward ? rewardSchema.safeParse(body.reward) : null;
    return { data: schema.parse(body.data), reward: reward?.success ? reward.data : null };
  }
  return { data: schema.parse(body), reward: null };
}

export async function get<S extends z.ZodTypeAny>(url: string, schema: S, params?: object) {
  const { data } = await api.get(url, { params });
  return unwrap(schema, data);
}

export async function send<S extends z.ZodTypeAny>(
  method: "post" | "patch" | "put" | "delete",
  url: string,
  schema: S,
  body?: unknown,
  params?: object,
) {
  const { data } = await api.request({ method, url, data: body, params });
  return unwrap(schema, data);
}

export async function sendRewarded<S extends z.ZodTypeAny>(
  method: "post" | "patch" | "put",
  url: string,
  schema: S,
  body?: unknown,
  params?: object,
) {
  const { data } = await api.request({ method, url, data: body, params });
  return unwrapReward(schema, data);
}
