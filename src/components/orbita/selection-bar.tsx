"use client";

import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Caixa de seleção quadrada usada no modo "Selecionar". */
export function SelectBox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
        checked ? "bg-ink text-bg" : "border-2 border-bd bg-transparent hover:border-mut",
      )}
    >
      {checked ? <Icon name="check" size={18} /> : null}
    </button>
  );
}

/** Barra flutuante do modo de seleção: contagem, selecionar todos, cancelar, excluir. */
export function SelectionBar({
  count,
  allSelected,
  onSelectAll,
  onCancel,
  onDelete,
}: {
  count: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 lg:bottom-6">
      <div className="flex w-full max-w-[520px] items-center gap-2 rounded-full bg-sf p-2 pl-4 shadow-[0_12px_32px_rgba(0,0,0,.18)]">
        <span className="text-sm leading-none font-medium whitespace-nowrap">
          {count} {count === 1 ? "selecionada" : "selecionadas"}
        </span>
        <div className="flex-1" />
        <Button size="xs" variant="ghost" onClick={onSelectAll}>
          {allSelected ? "Limpar" : "Selecionar todos"}
        </Button>
        <Button size="xs" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="xs" variant="danger" disabled={count === 0} onClick={onDelete}>
          <Icon name="delete" size={16} />
          Excluir ({count})
        </Button>
      </div>
    </div>
  );
}
