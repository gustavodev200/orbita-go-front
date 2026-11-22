"use client";

import { useCallback, useState } from "react";

/** Modo de seleção múltipla (excluir em lote): ativo + conjunto de ids marcados. */
export function useSelection<T extends string>() {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<Set<T>>(() => new Set());

  const start = useCallback(() => setActive(true), []);
  const clear = useCallback(() => setSelected(new Set()), []);
  const stop = useCallback(() => {
    setActive(false);
    setSelected(new Set());
  }, []);
  const toggle = useCallback(
    (id: T) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );
  const setMany = useCallback(
    (ids: T[], on: boolean) =>
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of ids) {
          if (on) next.add(id);
          else next.delete(id);
        }
        return next;
      }),
    [],
  );

  return { active, selected, start, stop, toggle, setMany, clear };
}
