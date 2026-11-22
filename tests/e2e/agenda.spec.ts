import { expect, test } from "./fixtures/test";
import { stubPush } from "./fixtures/push-stub";

test.describe("Agenda", () => {
  test("mostra o calendário, os lembretes e redireciona /lembretes", async ({ authedPage: page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/lembretes");
    await expect(page).toHaveURL(/\/agenda$/);
    await expect(page.locator(".orbita-calendar")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Meus lembretes" })).toBeVisible();
    await expect(page.getByText("Pagar o aluguel").first()).toBeVisible();
    expect(errors, `console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("texto livre preenche o lembrete e criar envia o POST certo", async ({ authedPage: page, apiCalls }) => {
    await stubPush(page);
    await page.goto("/agenda");
    await page.getByRole("button", { name: "Lembrete", exact: true }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Descreva o lembrete").fill("me lembra de pagar o aluguel todo dia 5 às 9h");
    await dialog.getByRole("button", { name: "Preencher" }).click();
    await expect(dialog.getByLabel("Título do lembrete")).toHaveValue("Pagar o aluguel");

    await dialog.getByRole("button", { name: "Criar lembrete" }).click();
    await expect(dialog).toBeHidden();

    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/reminders");
    expect(post?.body).toMatchObject({ title: "Pagar o aluguel", kind: "finance", time: "09:00", repeat: "monthly", dayOfMonth: 5 });
    // Criar um lembrete já garante a inscrição de push neste aparelho.
    await expect.poll(() => apiCalls.some((c) => c.method === "POST" && c.pathname === "/push/subscribe")).toBe(true);
  });

  test("ativar notificações e enviar teste", async ({ authedPage: page, apiCalls }) => {
    await stubPush(page);
    await page.goto("/agenda");
    await page.getByRole("button", { name: "Ativar notificações" }).click();
    await expect(page.getByText("Notificações ativas")).toBeVisible();

    const patchMe = apiCalls.find((c) => c.method === "PATCH" && c.pathname === "/me");
    expect(patchMe?.body).toMatchObject({ notificationsEnabled: true });

    await page.getByRole("button", { name: "Enviar teste" }).click();
    await expect.poll(() => apiCalls.some((c) => c.method === "POST" && c.pathname === "/push/test")).toBe(true);
  });

  test("visão Dia mostra as horas e tocar num horário abre lembrete naquela hora", async ({ authedPage: page }) => {
    await page.goto("/agenda");
    await page.getByRole("tab", { name: "Ver dia" }).click();
    const calendar = page.locator(".orbita-calendar");
    // Duas células por horário: rótulo e faixa — a faixa é a última.
    const slot = calendar.locator('[data-time="10:00:00"]').last();
    await expect(slot).toBeVisible();
    // A coluna do dia fica por cima da faixa (é ela que recebe o toque real):
    // clica pela coordenada, como o dedo do usuário.
    await slot.scrollIntoViewIfNeeded();
    const box = await slot.boundingBox();
    if (!box) throw new Error("faixa das 10:00 sem caixa");
    await page.mouse.click(box.x + box.width / 2, box.y + 6);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Novo lembrete");
    await expect(dialog.getByLabel("Horário do lembrete")).toHaveValue("10:00");
  });

  test("selecionar lembretes e excluir em lote", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/agenda");
    await page.getByRole("button", { name: "Selecionar" }).click();
    await page.getByRole("button", { name: "Selecionar todos" }).click();
    await page.getByRole("button", { name: "Excluir (1)" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Excluir" }).click();

    await expect
      .poll(() => apiCalls.find((c) => c.method === "POST" && c.pathname === "/reminders/bulk-delete")?.body)
      .toEqual({ ids: ["rem-1"] });
  });
});
