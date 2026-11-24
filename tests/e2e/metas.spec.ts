import { expect, test } from "./fixtures/test";

test.describe("Metas", () => {
  test("lista mostra horizonte, resultado esperado e progresso", async ({ authedPage: page }) => {
    await page.goto("/metas");
    await expect(page.getByRole("button", { name: "Alcançar inglês B1" })).toBeVisible();
    await expect(page.getByText("Conversar 30 min sem travar")).toBeVisible();
    await expect(page.getByText("1/3 etapas")).toBeVisible();
    await expect(page.getByText("33%")).toBeVisible();
  });

  test("criar meta com prazo e etapas envia horizonte e etapas", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/metas");
    await page.getByRole("button", { name: "Nova meta" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nome da meta").fill("Correr 10 km");
    await dialog.getByRole("button", { name: "3 meses", exact: true }).click();
    await dialog.getByLabel("Resultado esperado").fill("10 km abaixo de 60 min");
    await dialog.getByLabel("Etapas iniciais").fill("Correr 3 km\nCorrer 5 km");
    await dialog.getByRole("button", { name: "Criar meta" }).click();
    await expect(dialog).toBeHidden();

    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/objectives");
    expect(post?.body).toMatchObject({ title: "Correr 10 km", horizon: "short", expectedResult: "10 km abaixo de 60 min", milestones: ["Correr 3 km", "Correr 5 km"] });
    await expect(page.getByRole("button", { name: "Correr 10 km" })).toBeVisible();
  });

  test("marcar etapa no detalhe atualiza o progresso", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/metas");
    await page.getByRole("button", { name: "Alcançar inglês B1" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("checkbox", { name: "20 aulas de conversação" }).click();
    await expect
      .poll(() => apiCalls.some((c) => c.method === "PATCH" && c.pathname === "/objectives/obj-1/milestones/ms-2"))
      .toBe(true);
    await expect(dialog.getByText("67%")).toBeVisible();
  });
});
