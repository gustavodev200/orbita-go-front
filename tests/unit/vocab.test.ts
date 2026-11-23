import { describe, expect, it } from "vitest";

import { claudeMcpCommand } from "@/features/api-tokens/api";
import { accuracy, summarize } from "@/features/vocab/review";
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
  it("conta só os respondidos e lista os errados na ordem da rodada", () => {
    const cards = [card("a"), card("b"), card("c")];
    const result = summarize({ a: "wrong", b: "correct" }, cards);
    expect(result.correct).toBe(1);
    expect(result.total).toBe(2);
    expect(result.missed.map((c) => c.id)).toEqual(["a"]);
  });
});

describe("claudeMcpCommand", () => {
  it("aponta para /mcp sem barra dupla e leva o token no header", () => {
    expect(claudeMcpCommand("orb_x", "https://api.example.com/")).toBe(
      'claude mcp add --transport http --scope user orbitago https://api.example.com/mcp --header "Authorization: Bearer orb_x"',
    );
  });
});
