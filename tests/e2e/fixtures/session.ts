import type { BrowserContext } from "@playwright/test";

// Deve bater com tests/e2e/fixtures/fake-supabase-server.mjs (FAKE_USER).
export const FAKE_USER_ID = "11111111-1111-4111-8111-111111111111";
export const FAKE_EMAIL = "marina@example.com";
export const FAKE_NAME = "Marina Alves";

function base64url(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * JWT "de mentira": header/payload válidos (o front só decodifica, nunca
 * verifica assinatura HS256 no client) com `exp` bem no futuro. A verificação
 * de verdade (fallback `getUser()`) acontece contra o fake-supabase-server.
 */
function buildFakeAccessToken(): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: FAKE_USER_ID,
    email: FAKE_EMAIL,
    aud: "authenticated",
    role: "authenticated",
    session_id: "22222222-2222-4222-8222-222222222222",
    iat: now,
    exp: now + 6 * 60 * 60,
  };
  return `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}.fake-signature`;
}

function buildFakeSession() {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: buildFakeAccessToken(),
    token_type: "bearer",
    expires_in: 6 * 60 * 60,
    expires_at: now + 6 * 60 * 60,
    refresh_token: "fake-refresh-token",
    user: {
      id: FAKE_USER_ID,
      aud: "authenticated",
      role: "authenticated",
      email: FAKE_EMAIL,
      phone: "",
      app_metadata: { provider: "google", providers: ["google"] },
      user_metadata: { full_name: FAKE_NAME, name: FAKE_NAME, avatar_url: null },
      identities: [],
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      is_anonymous: false,
    },
  };
}

/** Mesma fórmula do supabase-js: `sb-${hostname.split('.')[0]}-auth-token`. */
function storageKeyFor(supabaseUrl: string): string {
  const hostname = new URL(supabaseUrl).hostname;
  return `sb-${hostname.split(".")[0]}-auth-token`;
}

/**
 * Semeia o cookie de sessão do Supabase (formato `@supabase/ssr`:
 * `base64-` + base64url do JSON da sessão) direto no contexto do browser —
 * o client (`getSupabase()`) e o proxy (`getClaims()`) leem os dois a
 * sessão pelo cookie, sem precisar de um login real.
 */
export async function seedSupabaseSession(context: BrowserContext, baseURL: string, supabaseUrl: string) {
  const name = storageKeyFor(supabaseUrl);
  const value = `base64-${base64url(JSON.stringify(buildFakeSession()))}`;
  await context.addCookies([{ name, value, url: baseURL, httpOnly: false, sameSite: "Lax" }]);
}
