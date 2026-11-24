import { expect, test } from "./fixtures/test";
import { stubPush } from "./fixtures/push-stub";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

test.describe("Hábitos", () => {
  test("marcar o hábito de hoje", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/habitos");
    await expect(page.getByText("Beber água").first()).toBeVisible();
    await page.getByRole("checkbox", { name: `Beber água em ${today}` }).click();
    await expect
      .poll(() => apiCalls.some((c) => c.method === "PUT" && c.pathname === `/habits/hab-1/checks/${today}`))
      .toBe(true);
  });

  test("criar hábito com dias e lembrete", async ({ authedPage: page, apiCalls }) => {
    await stubPush(page);
    await page.goto("/habitos");
    await page.getByRole("button", { name: "Novo hábito" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nome do hábito").fill("Ler 10 páginas");
    await dialog.getByRole("button", { name: "Dom", exact: true }).click();
    await dialog.getByRole("switch", { name: "Lembrar" }).click();
    await dialog.getByLabel("Horário do lembrete").fill("07:30");
    await dialog.getByRole("button", { name: "Criar hábito" }).click();
    await expect(dialog).toBeHidden();

    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/habits");
    expect(post?.body).toMatchObject({ name: "Ler 10 páginas", weekdays: [1, 2, 3, 4, 5, 6], reminderTime: "07:30" });
  });

  test("mostra consistência, recorde e heatmap", async ({ authedPage: page }) => {
    await page.goto("/habitos");
    await expect(page.getByText("Consistência por semana")).toBeVisible();
    await expect(page.getByText("Recorde").first()).toBeVisible();
    await expect(page.getByText("4 dias")).toBeVisible();
    await expect(page.getByRole("img", { name: "Últimas 13 semanas de Beber água" })).toBeVisible();
  });

  test("Início mostra os hábitos de hoje", async ({ authedPage: page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Hábitos de hoje" })).toBeVisible();
    await expect(page.getByText("Beber água")).toBeVisible();
  });
});
