import type { Session } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import { getQueryClient } from "@/lib/query-client";
import { getSupabase } from "@/lib/supabase/client";

const DEFAULT_NEXT = "/";

/** Só caminho interno: bloqueia open redirect (?next=https://… ou //host). */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT_NEXT;
  return raw;
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
