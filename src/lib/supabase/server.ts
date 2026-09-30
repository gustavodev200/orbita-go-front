import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env, hasSupabaseEnv } from "@/lib/env";

/** Client de servidor para Route Handlers. null sem envs. */
export async function getServerSupabase() {
  if (!hasSupabaseEnv()) return null;
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component não pode escrever cookie; o proxy renova a sessão.
        }
      },
    },
  });
}
