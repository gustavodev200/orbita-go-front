"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { createFlashcards, deleteFlashcard, getFlashcards, getReviewQueue, reviewFlashcard, vocabKeys, type FlashcardInput } from "./api";
import type { Rating } from "./review";

export function useFlashcards(q: string) {
  return useQuery({
    queryKey: vocabKeys.list(q),
    queryFn: () => getFlashcards(q),
  });
}

/** Fila da rodada: buscada uma vez e congelada até "Nova rodada" (refetch). */
export function useReviewQueue() {
  return useQuery({
    queryKey: vocabKeys.review,
    queryFn: () => getReviewQueue(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useCreateFlashcard(onDone?: () => void) {
  return useApiMutation({
    mutationFn: (input: FlashcardInput) => createFlashcards([input]),
    invalidate: [vocabKeys.all],
    message: (r) => (r.created.length ? "Card adicionado" : "Esse card já existe"),
    onSuccess: () => onDone?.(),
  });
}

export function useDeleteFlashcard() {
  return useApiMutation({
    mutationFn: (id: string) => deleteFlashcard(id),
    invalidate: [vocabKeys.all],
    message: () => "Card excluído",
  });
}

/** Registra a avaliação (o servidor agenda a próxima revisão) sem mexer na fila da rodada em andamento. */
export function useReviewFlashcard() {
  return useApiMutation({
    mutationFn: ({ id, rating }: { id: string; rating: Rating }) => reviewFlashcard(id, rating),
    invalidate: [["flashcards", "list"]],
  });
}
