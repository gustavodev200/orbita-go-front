import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures/test";

/** Mobile usa o teclado numérico próprio; desktop usa as teclas físicas
 * (o listener ignora teclas com foco em input/textarea — por isso tira o
 * foco clicando no segmented control "Saída" antes de digitar). */
async function enterAmount(page: Page, digits: string) {
  const keypadDigit = page.getByRole("button", { name: digits[0], exact: true });
  const hasKeypad = await keypadDigit.isVisible().catch(() => false);
  if (hasKeypad) {
    for (const d of digits) await page.getByRole("button", { name: d, exact: true }).click();
    return;
  }
  await page.getByRole("radio", { name: "Saída" }).click();
  for (const d of digits) await page.keyboard.press(d);
}

test.describe("Finanças", () => {
  test("alterna as 4 abas (Extrato, Recorrentes, Orçamento, Metas)", async ({ authedPage: page }) => {
    await page.goto("/financas");
    await expect(page.getByRole("tab", { name: /extrato/i })).toHaveAttribute("data-state", "active");
    await expect(page.getByText("iFood — almoço")).toBeVisible();

    await page.getByRole("tab", { name: /recorrentes/i }).click();
    await expect(page.getByText("Comprometido em")).toBeVisible();
    await expect(page.getByText("Aluguel")).toBeVisible();

    await page.getByRole("tab", { name: /orçamento/i }).click();
    await expect(page.getByText("Vida das categorias")).toBeVisible();
    await expect(page.getByText("Alimentação")).toBeVisible();

    await page.getByRole("tab", { name: /metas/i }).click();
    await expect(page.getByRole("button", { name: "Viagem" })).toBeVisible();
  });

  test("Novo lançamento: valor pelo teclado, categoria, conta e salvar envia o POST certo", async ({
    authedPage: page,
    apiCalls,
  }) => {
    await page.goto("/financas");
    await page.getByRole("button", { name: /novo lançamento|adicionar lançamento/i }).first().click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    // Valor escolhido de propósito pra não bater com nenhum lançamento da
    // fixture (evita ambiguidade de locator com o extrato ao fundo).
    await enterAmount(page, "1299");
    await expect(sheet.getByText("R$ 12,99")).toBeVisible();

    await page.getByRole("button", { name: "Transporte" }).click();
    // "Carteira" não vem com `color` do back (fixture de propósito) — se o
    // fallback de src/lib/colors.ts:accountColor não existisse, o parse do
    // zod teria quebrado a lista inteira de contas antes de chegar aqui.
    await page.getByRole("button", { name: /carteira/i }).click();
    await page.getByLabel("Descrição").fill("Uber pro trabalho");

    await page.getByRole("button", { name: /salvar lançamento/i }).click();
    await expect(sheet).toBeHidden();

    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/transactions");
    expect(post?.body).toMatchObject({
      type: "expense",
      amountCents: 1299,
      categoryKey: "tra",
      accountId: "acc-cart",
      description: "Uber pro trabalho",
    });
  });
});
