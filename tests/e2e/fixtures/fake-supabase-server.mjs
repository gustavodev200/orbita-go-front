// Servidor Supabase falso, só para o e2e (Playwright).
//
// O middleware (src/proxy.ts) roda no processo Node do Next e chama
// `supabase.auth.getClaims()`. Para tokens HS256 (o padrão dos projetos
// Supabase), o @supabase/auth-js não consegue verificar a assinatura
// localmente (não tem o segredo) e cai no fallback `getUser()`, que faz um
// GET real em `${SUPABASE_URL}/auth/v1/user` a partir do processo do
// servidor — fora do alcance do `page.route()` do Playwright, que só
// intercepta requisições do browser. Por isso este processo à parte: os
// testes apontam `NEXT_PUBLIC_SUPABASE_URL` pra cá.
//
// CORS liberado pois o browser também bate aqui (ex.: verificação de sessão
// no boot do client Supabase).
import { createServer } from "node:http";

const PORT = Number(process.env.FAKE_SUPABASE_PORT || 4576);

export const FAKE_USER = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "marina@example.com",
  phone: "",
  app_metadata: { provider: "google", providers: ["google"] },
  user_metadata: { full_name: "Marina Alves", name: "Marina Alves", avatar_url: null },
  identities: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  is_anonymous: false,
};

function withCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

const server = createServer((req, res) => {
  withCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  // GoTrueClient._getUser(jwt) -> GET `${authUrl}/user`
  if (url.pathname === "/auth/v1/user") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(FAKE_USER));
    return;
  }

  // Não deveria ser preciso (o token fake tem validade longa), mas cobre um
  // eventual refresh: devolve uma "nova" sessão com o mesmo usuário fake.
  if (url.pathname === "/auth/v1/token") {
    const now = Math.floor(Date.now() / 1000);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        access_token: "fake-access-token-refreshed",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: now + 3600,
        refresh_token: "fake-refresh-token",
        user: FAKE_USER,
      }),
    );
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({}));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[fake-supabase] listening on http://127.0.0.1:${PORT}`);
});
