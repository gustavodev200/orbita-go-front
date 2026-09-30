import { expect, test } from "./fixtures/test";
import { BOSS } from "./fixtures/fixtures-data";

test.describe("Hoje", () => {
  test("carrega missões, ofensiva, resumo e chefão sem erro de console", async ({ authedPage: page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /bom dia|boa tarde|boa noite/i })).toBeVisible();

    // Missões diárias: 3 tiles, uma delas sem `unit` do back e alvo em
    // centavos — cobre o fallback (target >= 1000) de missions-section.tsx.
    await expect(page.getByText("Registre 3 lançamentos")).toBeVisible();
    await expect(page.getByText("Gaste menos de R$ 80 hoje")).toBeVisible();
    await expect(page.getByText(/R\$\s*45\s*\/\s*80/)).toBeVisible();

    // Ofensiva
    await expect(page.getByText(/dias de ofensiva/)).toBeVisible();

    // Chefão do mês
    await expect(page.getByText(BOSS.name).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /atacar/i })).toBeVisible();

    expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("resgatar missão completa mostra o toast de XP", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /resgatar/i }).first().click();
    await expect(page.getByRole("status")).toContainText("XP");
    expect(apiCalls.some((c) => c.method === "POST" && /\/missions\/.+\/claim$/.test(c.pathname))).toBe(true);
  });
});
