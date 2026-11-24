import { expect, test } from "./fixtures/test";

test.describe("Foco", () => {
  test("iniciar 15 min conta e mostra a pílula no header em outra tela", async ({ authedPage: page }) => {
    await page.goto("/foco");
    await page.getByRole("button", { name: "15 min" }).click();
    await page.getByRole("button", { name: "Iniciar" }).click();
    await expect(page.getByRole("timer")).toHaveText(/^14:5\d$/);

    await page.goto("/");
    await expect(page.getByRole("link", { name: /foco em andamento/i })).toBeVisible();
  });

  test("Focar numa tarefa leva ao timer com a tarefa escolhida", async ({ authedPage: page }) => {
    await page.goto("/tarefas");
    await page.getByRole("button", { name: "Opções", exact: true }).first().click();
    await page.getByRole("menuitem", { name: "Focar" }).click();
    await expect(page).toHaveURL(/\/foco$/);
    await expect(page.getByRole("timer")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Tarefa do foco" })).toHaveText(/Ligar pro dentista/);
    await expect(page.getByRole("timer")).toBeVisible();
  });

  test("música: estação pronta abre o mini-player que continua em outra tela", async ({ authedPage: page }) => {
    await page.route("https://www.youtube-nocookie.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<html></html>" }));
    await page.goto("/foco");
    await page.getByRole("button", { name: /Lofi beats para estudar/ }).click();
    const player = page.getByRole("complementary", { name: "Música tocando" });
    await expect(player.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/jfKfPfyJRdk/);

    // Navegação client-side (link do menu): o player segue montado no shell.
    await page.getByRole("link", { name: "Tarefas", exact: true }).locator("visible=true").first().click();
    await expect(page).toHaveURL(/\/tarefas$/);
    await expect(player.locator("iframe")).toHaveAttribute("src", /jfKfPfyJRdk/);
  });

  test("música: link inválido mostra erro, link válido toca", async ({ authedPage: page }) => {
    await page.route("https://www.youtube-nocookie.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<html></html>" }));
    await page.goto("/foco");
    await page.getByLabel("Link do YouTube").fill("https://vimeo.com/123");
    await page.getByRole("button", { name: "Tocar link" }).click();
    await expect(page.getByText("Não reconheci esse link")).toBeVisible();
    await page.getByLabel("Link do YouTube").fill("https://youtu.be/4xDzrJKXOOY");
    await page.getByRole("button", { name: "Tocar link" }).click();
    await expect(page.getByRole("complementary", { name: "Música tocando" }).locator("iframe")).toHaveAttribute("src", /4xDzrJKXOOY/);
  });
});
