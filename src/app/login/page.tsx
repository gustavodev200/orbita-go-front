import { Suspense } from "react";

import { LoginScreen } from "@/features/auth/login-screen";

export const metadata = { title: "Entrar · órbitaGO" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
