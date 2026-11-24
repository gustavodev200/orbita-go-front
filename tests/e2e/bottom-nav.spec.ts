import { expect, test } from "./fixtures/test";

test.describe("Barra mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "barra só existe no mobile");

  test("menu Mais leva às telas que não cabem na barra", async ({ authedPage: page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    for (const label of ["Início", "Agenda", "Tarefas", "Finanças"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }

    await nav.getByRole("button", { name: "Mais" }).click();
    const menu = page.getByRole("menu");
    for (const label of ["Metas", "Hábitos", "Desafios", "Foco", "Linha do tempo", "Perfil"]) {
      await expect(menu.getByRole("menuitem", { name: label })).toBeVisible();
    }

    await menu.getByRole("menuitem", { name: "Hábitos" }).click();
    await expect(page).toHaveURL(/\/habitos$/);
    await expect(nav.getByRole("button", { name: "Mais: Hábitos" })).toBeVisible();
  });

  for (const width of [360, 390]) {
    test(`pílula cabe na tela em ${width}px`, async ({ authedPage: page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ["/", "/financas", "/habitos", "/linha-do-tempo"]) {
        await page.goto(path);
        const pill = page.getByRole("navigation", { name: "Navegação principal" }).locator("> div");
        const box = await pill.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        await page.screenshot({ path: `test-results/bottom-nav-${width}${path.replace(/\//g, "-") || "-home"}.png` });
      }
    });
  }
});
