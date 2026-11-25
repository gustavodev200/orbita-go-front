import { describe, expect, it } from "vitest";

import type { Note } from "@/lib/api/schemas";
import { allLabels, bodyToItems, filterNotes, isEmptyNote, itemsToBody, reminderLabel } from "@/features/notes/note-utils";

function note(p: Partial<Note> = {}): Note {
  return {
    id: "n1",
    title: "",
    body: "",
    color: "default",
    labels: [],
    checklist: false,
    items: [],
    pinned: false,
    reminderAt: null,
    createdAt: "2026-11-24T12:00:00Z",
    updatedAt: "2026-11-24T12:00:00Z",
    ...p,
  };
}

describe("note-utils", () => {
  it("texto ↔ checklist preserva as linhas com conteúdo", () => {
    const items = bodyToItems("leite\n\n  ovos \npão");
    expect(items.map((i) => i.text)).toEqual(["leite", "ovos", "pão"]);
    expect(items.every((i) => !i.done)).toBe(true);
    expect(itemsToBody([...items, { id: "x", text: "  ", done: false }])).toBe("leite\novos\npão");
  });

  it("nota vazia ignora espaços e itens em branco", () => {
    expect(isEmptyNote(note({ title: " ", items: [{ id: "a", text: " ", done: false }] }))).toBe(true);
    expect(isEmptyNote(note({ items: [{ id: "a", text: "x", done: false }] }))).toBe(false);
  });

  it("busca ignora acento e maiúscula e olha itens e etiquetas", () => {
    const notes = [
      note({ id: "a", title: "Reunião", labels: ["trabalho"] }),
      note({ id: "b", checklist: true, items: [{ id: "i", text: "Feijão", done: false }] }),
      note({ id: "c", body: "ideia de app", labels: ["ideias"] }),
    ];
    expect(filterNotes(notes, "reuniao", null).map((n) => n.id)).toEqual(["a"]);
    expect(filterNotes(notes, "FEIJAO", null).map((n) => n.id)).toEqual(["b"]);
    expect(filterNotes(notes, "", "ideias").map((n) => n.id)).toEqual(["c"]);
    expect(filterNotes(notes, "trab", null).map((n) => n.id)).toEqual(["a"]);
  });

  it("lista etiquetas únicas em ordem alfabética", () => {
    expect(allLabels([note({ labels: ["b", "a"] }), note({ labels: ["a", "ç"] })])).toEqual(["a", "b", "ç"]);
  });

  it("rótulo do lembrete: hoje, amanhã ou dd/mm", () => {
    expect(reminderLabel("2026-11-24T09:00:00-03:00", "2026-11-24", "2026-11-25")).toBe("Hoje 09:00");
    expect(reminderLabel("2026-11-25T18:30:00-03:00", "2026-11-24", "2026-11-25")).toBe("Amanhã 18:30");
    expect(reminderLabel("2026-12-03T07:05:00-03:00", "2026-11-24", "2026-11-25")).toBe("03/12 07:05");
  });
});
