import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env, hasSupabaseEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Client do browser (sessão em cookie, PKCE). Retorna null no servidor ou sem
 * envs — build e preview sem .env continuam funcionando.
 */
export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined" || !hasSupabaseEnv()) return null;
  if (!client) client = createBrowserClient(env.supabaseUrl, env.supabaseKey);
  return client;
}
