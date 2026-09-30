import { expect, test } from "./fixtures/test";

test.describe("Tarefas", () => {
  test("concluir uma tarefa mostra o toast de recompensa", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/tarefas");
    await expect(page.getByText("Ligar pro dentista")).toBeVisible();

    await page.getByRole("checkbox", { name: "Concluir Ligar pro dentista" }).click();

    await expect(page.getByRole("status")).toContainText("+5 XP");
    await expect(page.getByRole("status")).toContainText("Tarefa concluída");

    const complete = apiCalls.find((c) => c.method === "POST" && c.pathname === "/tasks/task-1/complete");
    expect(complete).toBeTruthy();
  });
});
