import { expect, test } from "./fixtures/test";

test.describe("Início", () => {
  test("carrega saldo, semana, tarefas e contas sem erro de console", async ({ authedPage: page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByText(/saldo de/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tarefas de hoje" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Próximas contas" })).toBeVisible();
    await expect(page.getByText("Aluguel").first()).toBeVisible();
    // Nada de gamificação na tela.
    await expect(page.getByText(/XP|ofensiva|chefão|missões/i)).toHaveCount(0);

    expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("botão + oferece lançamento, tarefa e lembrete", async ({ authedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Adicionar", exact: true }).filter({ visible: true }).first().click();
    await expect(page.getByRole("menuitem", { name: /lançamento/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /tarefa/i })).toBeVisible();
    await page.getByRole("menuitem", { name: /lembrete/i }).click();
    await expect(page.getByRole("dialog")).toContainText("Novo lembrete");
  });
});
