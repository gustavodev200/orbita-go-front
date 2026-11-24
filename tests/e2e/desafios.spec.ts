import { expect, test } from "./fixtures/test";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

test.describe("Desafios", () => {
  test("Cumpri hoje marca o dia", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/desafios");
    await expect(page.getByText("Ler 10 páginas por dia")).toBeVisible();
    await page.getByRole("button", { name: "Cumpri hoje" }).click();
    await expect
      .poll(() => apiCalls.some((c) => c.method === "PUT" && c.pathname === `/challenges/chl-1/checks/${today}`))
      .toBe(true);
    await expect(page.getByRole("button", { name: "Cumprido hoje" })).toBeVisible();
  });

  test("criar desafio de 7 dias a partir de uma ideia", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/desafios");
    await page.getByRole("button", { name: "Novo desafio" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Sem açúcar" }).click();
    await expect(dialog.getByRole("radio", { name: "7 dias" })).toHaveAttribute("aria-checked", "true");
    await dialog.getByRole("button", { name: "Começar desafio de 7 dias" }).click();
    await expect(dialog).toBeHidden();
    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/challenges");
    expect(post?.body).toMatchObject({ title: "Sem açúcar", durationDays: 7, startDate: today });
  });
});
