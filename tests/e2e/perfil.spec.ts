import { expect, test } from "./fixtures/test";

/**
 * Substitui Service Worker/Push/Notification por dublês antes de qualquer
 * script da página rodar — evita que o teste tente registrar um push de
 * verdade (rede real do navegador até o serviço de push) só pra clicar num
 * switch. `usePushSubscription` só usa `Notification.requestPermission`,
 * `navigator.serviceWorker.ready` e `registration.pushManager`.
 */
async function stubPush(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    const fakeSubscription = {
      endpoint: "https://push.example/fake-endpoint",
      toJSON: () => ({ endpoint: "https://push.example/fake-endpoint", keys: { p256dh: "fake-p256dh", auth: "fake-auth" } }),
      unsubscribe: () => Promise.resolve(true),
    };
    const fakeRegistration = {
      pushManager: {
        getSubscription: () => Promise.resolve(null),
        subscribe: () => Promise.resolve(fakeSubscription),
      },
    };
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: { ready: Promise.resolve(fakeRegistration), register: () => Promise.resolve(fakeRegistration) },
    });
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "default", requestPermission: () => Promise.resolve("granted") },
    });
    Object.defineProperty(window, "PushManager", { configurable: true, value: function PushManager() {} });
  });
}

test.describe("Perfil", () => {
  test("ligar notificações assina push e grava a preferência", async ({ authedPage: page, apiCalls }) => {
    await stubPush(page);
    await page.goto("/perfil");

    const toggle = page.getByRole("switch", { name: "Notificações" });
    await expect(toggle).toHaveAttribute("data-state", "unchecked"); // fixture: notificationsEnabled = false
    await toggle.click();
    await expect(toggle).toHaveAttribute("data-state", "checked");

    const subscribe = apiCalls.find((c) => c.method === "POST" && c.pathname === "/push/subscribe");
    expect(subscribe?.body).toMatchObject({ endpoint: "https://push.example/fake-endpoint", keys: { p256dh: "fake-p256dh", auth: "fake-auth" } });

    const patchMe = apiCalls.find((c) => c.method === "PATCH" && c.pathname === "/me");
    expect(patchMe?.body).toMatchObject({ notificationsEnabled: true });
  });

  test("mostra conquistas, loja e comparativo do perfil", async ({ authedPage: page }) => {
    await page.goto("/perfil");
    await expect(page.getByText("Marina Alves")).toBeVisible();
    await expect(page.getByText("Conquistas")).toBeVisible();
    await expect(page.getByText("Primeiro passo")).toBeVisible();
    await expect(page.getByText("Loja")).toBeVisible();
    await expect(page.getByText("Você vs. mês passado")).toBeVisible();
  });
});
