import { describe, expect, it } from "vitest";

import { claudeMcpCommand } from "@/features/api-tokens/api";
import { accuracy, dueLabel, formatDays, formatMinutes, intervalLabel, nextDue, summarize } from "@/features/vocab/review";
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
  nextIntervalMinutes: null,
  nextIntervalDays: { again: 1, hard: 2, good: 3, easy: 4 },
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

describe("formatDays", () => {
  it.each([
    [1, "1 dia"],
    [8, "8 dias"],
    [60, "2 meses"],
    [547, "1,5 ano"],
    [730, "2 anos"],
  ])("%i → %s", (days, label) => {
    expect(formatDays(days)).toBe(label);
  });
});

describe("formatMinutes / intervalLabel", () => {
  it.each([
    [1, "1 min"],
    [10, "10 min"],
    [60, "1 h"],
    [600, "10 h"],
    [1440, "1 dia"],
    [4320, "3 dias"],
  ])("%i → %s", (minutes, label) => {
    expect(formatMinutes(minutes)).toBe(label);
  });
  it("usa minutos da API e cai para dias se não vierem", () => {
    const learning = card("a", { nextIntervalMinutes: { again: 1, hard: 3, good: 5, easy: 10 } });
    expect(intervalLabel(learning, "good")).toBe("5 min");
    expect(intervalLabel(card("b"), "good")).toBe("3 dias");
  });
});

describe("dueLabel / nextDue", () => {
  const now = Date.parse("2026-11-24T12:00:00Z");
  it("novo, vencido e futuro", () => {
    expect(dueLabel({ dueAt: null }, now)).toBe("novo");
    expect(dueLabel({ dueAt: "2026-11-24T11:00:00Z" }, now)).toBe("agora");
    expect(dueLabel({ dueAt: "2026-11-24T12:05:00Z" }, now)).toBe("em 5 min");
    expect(dueLabel({ dueAt: "2026-11-24T15:00:00Z" }, now)).toBe("em 3 h");
    expect(dueLabel({ dueAt: "2026-11-25T07:00:00Z" }, now)).toBe("amanhã");
    expect(dueLabel({ dueAt: "2026-11-27T07:00:00Z" }, now)).toBe("em 3 dias");
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
