import { expect, test } from "@playwright/test";

test("login mostra apenas o botão do Google", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /continuar com google/i })).toBeVisible();
  await expect(page.getByText("Sua vida, subindo de nível.")).toBeVisible();
});
