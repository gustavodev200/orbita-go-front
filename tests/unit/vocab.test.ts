import { describe, expect, it } from "vitest";

import { claudeMcpCommand } from "@/features/api-tokens/api";
import { accuracy, dueLabel, formatInterval, nextDue, summarize } from "@/features/vocab/review";
import type { Flashcard } from "@/lib/api/schemas";

const card = (id: string, extra: Partial<Flashcard> = {}): Flashcard => ({
  id,
  pt: `pt-${id}`,
  en: `en-${id}`,
  example: null,
  note: null,
  correctCount: 0,
  wrongCount: 0,
  lastReviewedAt: null,
  state: "new",
  intervalDays: 0,
  dueAt: null,
  nextIntervals: { again: 1, hard: 6, good: 10, easy: 5760 },
  createdAt: "2026-11-23T12:00:00Z",
  ...extra,
});

describe("accuracy", () => {
  it("null quando nunca revisado", () => {
    expect(accuracy(card("a"))).toBeNull();
  });
  it("percentual arredondado", () => {
    expect(accuracy(card("a", { correctCount: 2, wrongCount: 1 }))).toBe(67);
  });
});

describe("summarize", () => {
  it("conta respostas e lista cada esquecido uma vez, na ordem da rodada", () => {
    const cards = [card("a"), card("b"), card("c")];
    const result = summarize(
      [
        { id: "a", rating: "again" },
        { id: "b", rating: "good" },
        { id: "a", rating: "hard" },
        { id: "a", rating: "again" },
      ],
      cards,
    );
    expect(result.total).toBe(4);
    expect(result.remembered).toBe(2);
    expect(result.missed.map((c) => c.id)).toEqual(["a"]);
  });
});

describe("formatInterval", () => {
  it.each([
    [1, "1 min"],
    [6, "6 min"],
    [90, "2 h"],
    [1440, "1 dia"],
    [5760, "4 dias"],
    [60 * 1440, "2 meses"],
    [547 * 1440, "1,5 ano"],
    [730 * 1440, "2 anos"],
  ])("%i min → %s", (minutes, label) => {
    expect(formatInterval(minutes)).toBe(label);
  });
});

describe("dueLabel / nextDue", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");
  it("novo, vencido e futuro", () => {
    expect(dueLabel({ dueAt: null }, now)).toBe("novo");
    expect(dueLabel({ dueAt: "2026-11-24T11:00:00Z" }, now)).toBe("agora");
    expect(dueLabel({ dueAt: "2026-11-27T12:00:00Z" }, now)).toBe("em 3 dias");
  });
  it("pega o próximo card no futuro, ignorando novos e vencidos", () => {
    const due = nextDue([{ dueAt: null }, { dueAt: "2026-11-24T11:00:00Z" }, { dueAt: "2026-11-30T00:00:00Z" }, { dueAt: "2026-11-24T12:10:00Z" }], now);
    expect(due).toBe("2026-11-24T12:10:00.000Z");
  });
});

describe("claudeMcpCommand", () => {
  it("aponta para /mcp sem barra dupla e leva o token no header", () => {
    expect(claudeMcpCommand("orb_x", "https://api.example.com/")).toBe(
      'claude mcp add --transport http --scope user orbitago https://api.example.com/mcp --header "Authorization: Bearer orb_x"',
    );
  });
});
