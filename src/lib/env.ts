// Envs públicas. Ausência não quebra o build: o client do Supabase só é
// criado quando URL e key existem (ver lib/supabase/client.ts).
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
};

export const hasSupabaseEnv = () => Boolean(env.supabaseUrl && env.supabaseKey);
