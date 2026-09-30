"use client";

import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useAppStore } from "@/stores/app-store";
import { NewTransactionForm } from "./new-transaction-form";

/** Novo lançamento: Sheet de baixo no mobile, Dialog 580px no desktop. */
export function NewTransaction() {
  const desktop = useIsDesktop();
  const sheet = useAppStore((s) => s.txSheet);
  const close = useAppStore((s) => s.closeTxSheet);
  const title = sheet.editing ? "Editar lançamento" : "Novo lançamento";
  const form = (
    <NewTransactionForm
      key={sheet.editing?.id ?? (sheet.recurring ? "rec" : "new")}
      desktop={desktop}
      editing={sheet.editing}
      startRecurring={sheet.recurring}
      title={title}
      onClose={close}
    />
  );
  const onOpenChange = (o: boolean) => !o && close();
  return desktop ? (
    <Dialog open={sheet.open} onOpenChange={onOpenChange} title={title}>
      {form}
    </Dialog>
  ) : (
    <Sheet open={sheet.open} onOpenChange={onOpenChange} title={title}>
      {form}
    </Sheet>
  );
}
