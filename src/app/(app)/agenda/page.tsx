import { Suspense } from "react";

import { AgendaScreen } from "@/features/agenda/agenda-screen";

export default function AgendaPage() {
  return (
    <Suspense>
      <AgendaScreen />
    </Suspense>
  );
}
