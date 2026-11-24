import { expect, test } from "./fixtures/test";

test.describe("Quadro Kanban — celular", () => {
  test.skip(({ isMobile }) => !isMobile, "layout de abas + carrossel é do celular");

  test("abas com contagem, mover pelo menu e detalhes no bottom sheet", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas/quadro");
    const tabs = page.getByRole("tablist", { name: "Colunas do quadro" });
    const todoTab = tabs.getByRole("tab", { name: /A fazer/ });
    await expect(todoTab).toHaveAttribute("aria-selected", "true");
    await expect(todoTab).toContainText("2");

    // Menu do card → Fazendo
    await page.getByRole("button", { name: "Mover Ligar pro dentista" }).click();
    await page.getByRole("menuitem", { name: "Fazendo" }).click();
    await expect
      .poll(() => apiCalls.find((c) => c.method === "POST" && c.pathname === "/tasks/task-1/move")?.body)
      .toMatchObject({ status: "doing" });
    await expect(tabs.getByRole("tab", { name: /Fazendo/ })).toContainText("1");
    await expect(todoTab).toContainText("1");

    // Aba troca de coluna (o carrossel rola até ela)
    await tabs.getByRole("tab", { name: /Fazendo/ }).click();
    await expect(tabs.getByRole("tab", { name: /Fazendo/ })).toHaveAttribute("aria-selected", "true");
    const doing = page.locator("#col-doing");
    await expect(doing.getByText("Ligar pro dentista")).toBeInViewport();

    // Detalhes no bottom sheet → concluir pela coluna "Feito"
    await doing.getByRole("button", { name: "Ligar pro dentista", exact: true }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("heading", { name: "Ligar pro dentista" })).toBeVisible();
    await sheet.getByRole("radio", { name: "Feito" }).click();
    await expect(sheet.getByRole("radio", { name: "Feito" })).toHaveAttribute("aria-checked", "true");
    await expect
      .poll(() => apiCalls.filter((c) => c.pathname === "/tasks/task-1/move").map((c) => (c.body as { status: string }).status))
      .toEqual(["doing", "done"]);
  });

  test("botão flutuante cria na coluna aberta", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas/quadro");
    await page.getByRole("tablist", { name: "Colunas do quadro" }).getByRole("tab", { name: /Depois/ }).click();
    await page.getByRole("button", { name: "Nova tarefa em Para depois" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Nome da tarefa").fill("Aprender violão");
    await dialog.getByRole("button", { name: "Criar tarefa" }).click();
    await expect(dialog).toBeHidden();
    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/tasks");
    expect(post?.body).toMatchObject({ title: "Aprender violão", status: "backlog", dueDate: null });
  });
});

test.describe("Quadro Kanban — desktop", () => {
  test.skip(({ isMobile }) => !!isMobile, "colunas lado a lado e arrastar são do desktop");

  test("4 colunas, arrastar entre colunas e painel lateral", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas/quadro");
    for (const name of ["Para depois", "A fazer", "Fazendo", "Feito"]) {
      await expect(page.getByRole("region", { name })).toBeVisible();
    }
    const card = page.locator('[data-card="task-2"]');
    await card.dragTo(page.getByRole("region", { name: "Fazendo" }));
    await expect
      .poll(() => apiCalls.find((c) => c.method === "POST" && c.pathname === "/tasks/task-2/move")?.body)
      .toMatchObject({ status: "doing", position: 1 });
    await expect(page.getByRole("region", { name: "Fazendo" }).getByText("Revisar orçamento")).toBeVisible();

    await page.getByRole("region", { name: "Fazendo" }).getByRole("button", { name: "Revisar orçamento", exact: true }).click();
    const panel = page.getByRole("dialog");
    await expect(panel.getByRole("heading", { name: "Revisar orçamento" })).toBeVisible();
    await expect(panel.getByRole("radio", { name: "Fazendo" })).toHaveAttribute("aria-checked", "true");
    await panel.getByRole("button", { name: "Fechar detalhes" }).click();
    await expect(panel).toBeHidden();
  });

  test("reordenar dentro da coluna", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas/quadro");
    // "Revisar orçamento" (posição 2) vai para cima de "Ligar pro dentista" (posição 1)
    await page.locator('[data-card="task-2"]').dragTo(page.locator('[data-card="task-1"]'), { targetPosition: { x: 40, y: 4 } });
    await expect
      .poll(() => apiCalls.find((c) => c.pathname === "/tasks/task-2/move")?.body)
      .toEqual({ status: "todo", position: 0 });
    const titles = page.getByRole("region", { name: "A fazer" }).locator("[data-card]");
    await expect(titles.first()).toHaveAttribute("data-card", "task-2");
  });

  test("adicionar direto na coluna e buscar", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas/quadro");
    const backlog = page.getByRole("region", { name: "Para depois" });
    await backlog.getByRole("button", { name: "Adicionar tarefa" }).click();
    await backlog.getByLabel("Nova tarefa em Para depois").fill("Planejar viagem");
    await backlog.getByLabel("Nova tarefa em Para depois").press("Enter");
    await expect
      .poll(() => apiCalls.find((c) => c.method === "POST" && c.pathname === "/tasks")?.body)
      .toMatchObject({ title: "Planejar viagem", status: "backlog", dueDate: null });

    await page.getByLabel("Buscar tarefa").fill("dentista");
    await expect(page.getByText("Ligar pro dentista")).toBeVisible();
    await expect(page.getByText("Revisar orçamento")).toBeHidden();
  });

  test("lista e quadro alternam pelo seletor", async ({ authedPage: page }) => {
    await page.goto("/tarefas");
    await page.getByRole("link", { name: "Quadro" }).click();
    await expect(page).toHaveURL(/\/tarefas\/quadro$/);
    await expect(page.getByRole("region", { name: "A fazer" })).toBeVisible();
    await page.getByRole("link", { name: "Lista" }).click();
    await expect(page).toHaveURL(/\/tarefas$/);
  });
});
