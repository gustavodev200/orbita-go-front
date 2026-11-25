"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Note } from "@/lib/api/schemas";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import { createNote, deleteNote, getNotes, NOTE_INVALIDATE, noteKeys, updateNote, type NoteInput } from "./api";

export function useNotes() {
  return useQuery({ queryKey: noteKeys.all, queryFn: getNotes });
}

export function useCreateNote(onDone?: (n: Note) => void) {
  return useApiMutation({
    mutationFn: (input: NoteInput) => createNote(input),
    invalidate: NOTE_INVALIDATE,
    onSuccess: (n) => onDone?.(n),
  });
}

/**
 * Atualização otimista: fixar, marcar item, trocar cor aparecem na hora; se a
 * API falhar, a lista é recarregada do servidor.
 */
export function useUpdateNote() {
  const qc = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, input }: { id: string; input: NoteInput }) => {
      qc.setQueryData<Note[]>(noteKeys.all, (list) => list?.map((n) => (n.id === id ? { ...n, ...input } : n)));
      return updateNote(id, input);
    },
    invalidate: NOTE_INVALIDATE,
    onError: () => void qc.invalidateQueries({ queryKey: noteKeys.all }),
  });
}

export function useDeleteNote(onDone?: () => void) {
  return useApiMutation({
    mutationFn: (id: string) => deleteNote(id),
    invalidate: NOTE_INVALIDATE,
    message: () => "Nota excluída",
    onSuccess: () => onDone?.(),
  });
}
