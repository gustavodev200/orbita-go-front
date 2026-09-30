import { test as base } from "@playwright/test";
export { expect } from "@playwright/test";

import { mockApi, type RecordedCall } from "./mock-api";
import { seedSupabaseSession } from "./session";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:4576";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3333";

/**
 * `authedPage`: página já "logada" (cookie de sessão Supabase semeado, sem
 * passar pela tela de login) e com toda chamada a `NEXT_PUBLIC_API_URL`
 * interceptada por fixtures batendo com o API_CONTRACT.md — nenhuma rede de
 * verdade (nem Supabase, nem back) é tocada.
 */
// `runFixture` em vez de `use` (nome que o Playwright aceita em qualquer
// callback de fixture) só pra não colidir com a regra `react-hooks/rules-of-hooks`
// do eslint, que trata qualquer chamada a uma função chamada `use(...)` como
// um React Hook fora de lugar.
export const test = base.extend<{ authedPage: import("@playwright/test").Page; apiCalls: RecordedCall[] }>({
  apiCalls: async ({ page }, runFixture) => {
    const calls = await mockApi(page, API_URL);
    await runFixture(calls);
  },
  // Depende de `apiCalls` só pra garantir que o mock de API já está
  // registrado antes da navegação (ordem de resolução de fixtures).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dependência de ordem, não de valor
  authedPage: async ({ page, context, apiCalls, baseURL }, runFixture) => {
    await seedSupabaseSession(context, baseURL ?? "http://localhost:3000", SUPABASE_URL);
    await runFixture(page);
  },
});
