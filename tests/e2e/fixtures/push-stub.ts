import type { Page } from "@playwright/test";

/**
 * Substitui Service Worker/Push/Notification por dublês antes de qualquer
 * script da página rodar — evita registrar um push de verdade (rede real do
 * navegador até o serviço de push) só para clicar num botão.
 */
export async function stubPush(page: Page) {
  await page.addInitScript(() => {
    let current: unknown = null;
    const fakeSubscription = {
      endpoint: "https://push.example/fake-endpoint",
      toJSON: () => ({ endpoint: "https://push.example/fake-endpoint", keys: { p256dh: "fake-p256dh", auth: "fake-auth" } }),
      unsubscribe: () => {
        current = null;
        return Promise.resolve(true);
      },
    };
    const fakeRegistration = {
      pushManager: {
        getSubscription: () => Promise.resolve(current),
        subscribe: () => {
          current = fakeSubscription;
          return Promise.resolve(fakeSubscription);
        },
      },
      showNotification: () => Promise.resolve(),
    };
    const permission = { value: "default" };
    Object.defineProperty(window.navigator, "serviceWorker", {
      configurable: true,
      value: {
        ready: Promise.resolve(fakeRegistration),
        register: () => Promise.resolve(fakeRegistration),
        getRegistration: () => Promise.resolve(fakeRegistration),
      },
    });
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: {
        get permission() {
          return permission.value;
        },
        requestPermission: () => {
          permission.value = "granted";
          return Promise.resolve("granted");
        },
      },
    });
    Object.defineProperty(window, "PushManager", { configurable: true, value: function PushManager() {} });
  });
}
