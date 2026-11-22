import { expect, test } from "./fixtures/test";

test.describe("Foco", () => {
  test("iniciar 15 min conta e mostra a pílula no header em outra tela", async ({ authedPage: page }) => {
    await page.goto("/foco");
    await page.getByRole("button", { name: "15 min" }).click();
    await page.getByRole("button", { name: "Iniciar" }).click();
    await expect(page.getByRole("timer")).toHaveText(/^14:5\d$/);

    await page.goto("/");
    await expect(page.getByRole("link", { name: /foco em andamento/i })).toBeVisible();
  });

  test("Focar numa tarefa leva ao timer com a tarefa escolhida", async ({ authedPage: page }) => {
    await page.goto("/tarefas");
    await page.getByRole("button", { name: "Opções", exact: true }).first().click();
    await page.getByRole("menuitem", { name: "Focar" }).click();
    await expect(page).toHaveURL(/\/foco$/);
    await expect(page.getByRole("timer")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Tarefa do foco" })).toHaveText(/Ligar pro dentista/);
    await expect(page.getByRole("timer")).toBeVisible();
  });
});
