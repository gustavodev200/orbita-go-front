import { Suspense } from "react";

import { ChallengesScreen } from "@/features/challenges/challenges-screen";

export default function DesafiosPage() {
  return (
    <Suspense>
      <ChallengesScreen />
    </Suspense>
  );
}
