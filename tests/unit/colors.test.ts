import { describe, expect, it } from "vitest";

import { accountColor } from "@/lib/colors";

describe("accountColor (fallback de `Account.color` — API_CONTRACT Pedidos do front)", () => {
  it("usa a cor do back quando presente", () => {
    expect(accountColor({ name: "Nubank", color: "#000000" })).toBe("#000000");
  });

  it("sem `color`, mapeia pelo nome das contas seed", () => {
    expect(accountColor({ name: "Nubank" })).toBe("#8A05BE");
    expect(accountColor({ name: "Itaú" })).toBe("#EC7000");
    expect(accountColor({ name: "Itau" })).toBe("#EC7000");
    expect(accountColor({ name: "Carteira" })).toBe("#20B878");
  });

  it("nome desconhecido sem cor cai num cinza neutro (nunca quebra)", () => {
    expect(accountColor({ name: "Conta nova qualquer" })).toBe("#9A8C7E");
  });

  it("ignora maiúsculas/espaços no nome", () => {
    expect(accountColor({ name: "  NUBANK  " })).toBe("#8A05BE");
  });
});
