import { expect, test } from "./fixtures/test";
import { stubPush } from "./fixtures/push-stub";

test.describe("Perfil", () => {
  test("ativar notificações assina push e grava a preferência", async ({ authedPage: page, apiCalls }) => {
    await stubPush(page);
    await page.goto("/perfil");

    await page.getByRole("button", { name: "Ativar notificações" }).click();
    await expect(page.getByText("Notificações ativas")).toBeVisible();

    const subscribe = apiCalls.find((c) => c.method === "POST" && c.pathname === "/push/subscribe");
    expect(subscribe?.body).toMatchObject({ endpoint: "https://push.example/fake-endpoint", keys: { p256dh: "fake-p256dh", auth: "fake-auth" } });
  });

  test("mostra dados, comparativo e ajustes — sem conquistas nem loja", async ({ authedPage: page }) => {
    await page.goto("/perfil");
    await expect(page.getByText("Marina Alves")).toBeVisible();
    await expect(page.getByText("Gastos vs. mês passado")).toBeVisible();
    await expect(page.getByText("Categorias de gasto")).toBeVisible();
    await expect(page.getByText("Conquistas")).toHaveCount(0);
    await expect(page.getByText("Loja")).toHaveCount(0);
  });
});
