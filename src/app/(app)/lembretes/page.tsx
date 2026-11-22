import { redirect } from "next/navigation";

/** Lembretes agora vivem na Agenda (calendário + lista + notificações). */
export default function LembretesPage() {
  redirect("/agenda");
}
