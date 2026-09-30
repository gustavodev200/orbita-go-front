import { expect, test } from "./fixtures/test";

test.describe("Lembretes", () => {
  test("linguagem natural → prévia → criar", async ({ authedPage: page, apiCalls }) => {
    await page.goto("/lembretes");

    await page.getByLabel("Descreva o lembrete").fill("me lembra de pagar o aluguel todo dia 5 às 9h");
    await page.getByRole("button", { name: "Entender" }).click();

    const preview = page.getByTestId("reminder-ai-preview");
    await expect(preview).toBeVisible();
    await expect(preview).toContainText("Entendi assim");
    await expect(preview).toContainText("Pagar o aluguel");
    await expect(preview).toContainText("Todo dia 5");
    await expect(preview).toContainText("09:00");

    await preview.getByRole("button", { name: "Criar lembrete" }).click();
    await expect(preview).toBeHidden();

    const post = apiCalls.find((c) => c.method === "POST" && c.pathname === "/reminders");
    expect(post?.body).toMatchObject({ title: "Pagar o aluguel", kind: "finance", time: "09:00", repeat: "monthly", dayOfMonth: 5 });
  });
});
