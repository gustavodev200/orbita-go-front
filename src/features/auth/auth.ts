import type { Session } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { getQueryClient } from "@/lib/query-client";
import { getSupabase } from "@/lib/supabase/client";

const DEFAULT_NEXT = "/";

/**
 * Só caminho interno: bloqueia open redirect (?next=https://…, //host, /\host e
 * variantes com tab/quebra de linha, que o parser de URL remove virando //host).
 * Resolve contra uma origem fixa e devolve o caminho já normalizado.
 */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw?.startsWith("/")) return DEFAULT_NEXT;
  const base = "https://orbita.invalid";
  try {
    const url = new URL(raw, base);
    if (url.origin !== base) return DEFAULT_NEXT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_NEXT;
  }
}

export async function signInWithGoogle(next: string | null) {
  const supabase = getSupabase();
  if (!supabase) return { error: new Error("Supabase não configurado") };
  const origin = env.siteUrl || window.location.origin;
  const redirectTo = new URL("/auth/callback", origin);
  redirectTo.searchParams.set("next", safeNextPath(next));
  return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo.toString() } });
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
  getQueryClient().clear();
}

export function displayNameFromSession(session: Session | null): string | null {
  const meta = (session?.user.user_metadata ?? {}) as Record<string, unknown>;
  const name = (typeof meta.full_name === "string" && meta.full_name) || (typeof meta.name === "string" && meta.name);
  return name || null;
}
