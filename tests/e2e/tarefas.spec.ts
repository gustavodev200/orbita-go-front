import { expect, test } from "./fixtures/test";

test.describe("Tarefas", () => {
  test("concluir uma tarefa chama a API sem mostrar XP", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas");
    await expect(page.getByText("Ligar pro dentista")).toBeVisible();

    await page.getByRole("checkbox", { name: "Concluir Ligar pro dentista" }).click();
    // Concluída sai da lista de pendentes e vai para o grupo recolhido.
    await page.getByRole("button", { name: "Concluídas (1)" }).click();
    await expect(page.getByRole("checkbox", { name: "Concluir Ligar pro dentista" })).toHaveAttribute("aria-checked", "true");

    await expect.poll(() => apiCalls.some((c) => c.method === "POST" && c.pathname === "/tasks/task-1/complete")).toBe(true);
    await expect(page.getByText(/XP/)).toHaveCount(0);
  });

  test("criar tarefa rápida para hoje", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas");
    await page.getByLabel("Nova tarefa").fill("Comprar pão");
    await page.getByLabel("Nova tarefa").press("Enter");
    await expect.poll(() => apiCalls.find((c) => c.method === "POST" && c.pathname === "/tasks")?.body).toMatchObject({
      title: "Comprar pão",
      priority: "medium",
    });
  });
});
