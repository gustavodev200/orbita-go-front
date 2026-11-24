import { z } from "zod";

import { get, send } from "@/lib/api/client";
import { createFlashcardsResultSchema, flashcardSchema, type FlashcardRating } from "@/lib/api/schemas";

export const vocabKeys = {
  all: ["flashcards"] as const,
  list: (q: string) => ["flashcards", "list", q] as const,
  review: ["flashcards", "review"] as const,
};

export type FlashcardInput = {
  pt: string;
  en: string;
  example?: string | null;
};

export const getFlashcards = (q: string) => get("/flashcards", z.array(flashcardSchema), q ? { q } : undefined);
export const getReviewQueue = (limit = 20) => get("/flashcards/review", z.array(flashcardSchema), { limit });
export const createFlashcards = (cards: FlashcardInput[]) => send("post", "/flashcards", createFlashcardsResultSchema, { cards });
export const reviewFlashcard = (id: string, rating: FlashcardRating) => send("post", `/flashcards/${id}/review`, flashcardSchema, { rating });
export const deleteFlashcard = (id: string) => send("delete", `/flashcards/${id}`, flashcardSchema);
