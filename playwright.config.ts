import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

const FAKE_SUPABASE_PORT = process.env.FAKE_SUPABASE_PORT ?? "4576";
const FAKE_SUPABASE_URL = `http://127.0.0.1:${FAKE_SUPABASE_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    {
      name: "Mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    { name: "Desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  // Rede 100% mockada: nenhum teste toca o Supabase ou o back de verdade.
  // - fake-supabase-server: só o auth do Supabase (proxy.ts roda no processo
  //   do Next e chama getClaims()/getUser() por fora do browser — page.route
  //   não alcança essa chamada, daí o servidor HTTP à parte).
  // - next: aponta pro fake-supabase acima; as chamadas ao back
  //   (NEXT_PUBLIC_API_URL) rodam no browser e são interceptadas por
  //   tests/e2e/fixtures/mock-api.ts via page.route.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: `node tests/e2e/fixtures/fake-supabase-server.mjs`,
          url: `${FAKE_SUPABASE_URL}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 20_000,
          env: { FAKE_SUPABASE_PORT },
        },
        {
          command: "npm run dev",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            NEXT_PUBLIC_SUPABASE_URL: FAKE_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-anon-key-not-real",
            NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
            NEXT_PUBLIC_API_URL: "http://127.0.0.1:3333",
          },
        },
      ],
});
