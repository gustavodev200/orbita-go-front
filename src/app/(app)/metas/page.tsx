import { Suspense } from "react";

import { ObjectivesScreen } from "@/features/objectives/objectives-screen";

export default function MetasPage() {
  return (
    <Suspense>
      <ObjectivesScreen />
    </Suspense>
  );
}
