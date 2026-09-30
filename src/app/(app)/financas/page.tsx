import { Suspense } from "react";

import { FinanceScreen } from "@/features/finance/finance-screen";

export default function FinancasPage() {
  return (
    <Suspense>
      <FinanceScreen />
    </Suspense>
  );
}
