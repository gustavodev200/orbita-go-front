import { describe, expect, it } from "vitest";

import { formatBRL, formatSigned, maskBRLInput, parseBRLToCents } from "@/lib/format";
import { dayGroupLabel, formatDM, relativeDays } from "@/lib/dates";

// Intl pode emitir NBSP entre "R$" e o número em alguns runtimes.
const norm = (s: string) => s.replace(/ /g, " ");

describe("formatBRL", () => {
  it("formata centavos em BRL pt-BR", () => {
    expect(norm(formatBRL(123456))).toBe("R$ 1.234,56");
    expect(norm(formatBRL(0))).toBe("R$ 0,00");
    expect(norm(formatBRL(5))).toBe("R$ 0,05");
  });

  it("usa o sinal tipográfico de menos para negativos", () => {
    expect(norm(formatBRL(-4500))).toBe("−R$ 45,00");
  });

  it("aceita sinal sempre e modo compacto", () => {
    expect(norm(formatBRL(620000, { sign: "always" }))).toBe("+R$ 6.200,00");
    expect(norm(formatBRL(80000, { compact: true }))).toBe("R$ 800");
    expect(norm(formatBRL(-100, { sign: "never" }))).toBe("R$ 1,00");
  });

  it("formatSigned usa o tipo do lançamento", () => {
    expect(norm(formatSigned(2240, "expense"))).toBe("−R$ 22,40");
    expect(norm(formatSigned(45000, "income"))).toBe("+R$ 450,00");
  });
});

describe("parse/mask BRL", () => {
  it("converte texto em centavos", () => {
    expect(parseBRLToCents("1.234,56")).toBe(123456);
    expect(parseBRLToCents("8.000,00")).toBe(800000);
    expect(parseBRLToCents("12.5")).toBe(1250);
    expect(parseBRLToCents("")).toBe(0);
  });

  it("máscara caixa registradora", () => {
    expect(maskBRLInput("749")).toBe("7,49");
    expect(maskBRLInput("123456")).toBe("1.234,56");
    expect(maskBRLInput("abc")).toBe("");
  });
});

describe("datas dd/mm", () => {
  it("formata e rotula dias", () => {
    expect(formatDM("2026-09-29")).toBe("29/09");
    expect(dayGroupLabel("2026-09-29", "2026-09-29")).toBe("Hoje, 29/09");
    expect(dayGroupLabel("2026-09-28", "2026-09-29")).toBe("Ontem, 28/09");
    expect(dayGroupLabel("2026-09-26", "2026-09-29")).toBe("Sáb, 26/09");
    expect(relativeDays("2026-09-30", "2026-09-29")).toBe("amanhã");
    expect(relativeDays("2026-10-02", "2026-09-29")).toBe("em 3 dias");
  });
});
