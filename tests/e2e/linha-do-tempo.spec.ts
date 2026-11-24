import { expect, test } from "./fixtures/test";

test.describe("Linha do tempo", () => {
  test("compara anos e registra um marco", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/linha-do-tempo");
    await expect(page.getByText("Comparação entre anos")).toBeVisible();
    await expect(page.getByRole("rowheader", { name: /Tarefas concluídas/ })).toBeVisible();

    await page.getByRole("button", { name: "Novo marco" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("radio", { name: "Projeto" }).click();
    await dialog.getByLabel("O que aconteceu").fill("Lancei meu app");
    await dialog.getByRole("button", { name: "Adicionar à linha do tempo" }).click();
    await expect(dialog).toBeHidden();

    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/timeline/events");
    expect(post?.body).toMatchObject({ kind: "project", title: "Lancei meu app" });
    await expect(page.getByText("Lancei meu app")).toBeVisible();
  });
});
