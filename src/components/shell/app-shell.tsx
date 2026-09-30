"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Cobre } from "@/components/orbita/cobre";
import { ErrorState } from "@/components/orbita/states";
import { useSession } from "@/features/auth/use-session";
import { NewTransaction } from "@/features/finance/new-transaction/new-transaction";
import { useMe } from "@/features/me/hooks";
import { hasSupabaseEnv } from "@/lib/env";
import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";
import { RewardLayer } from "./reward-layer";
import { Sidebar } from "./sidebar";
import { useAdoptServerTheme } from "./use-theme";

function Splash() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center">
      <Cobre mood="feliz" size={96} />
    </div>
  );
}

/**
 * Shell autenticado. O proxy já barra quem não tem sessão; aqui garantimos o
 * `me` e mandamos para /onboarding quando `onboarded` é false.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, isPending } = useSession();
  const me = useMe(!!session);
  useAdoptServerTheme();

  useEffect(() => {
    if (!isPending && !session && hasSupabaseEnv()) router.replace("/login");
  }, [isPending, session, router]);

  useEffect(() => {
    if (me.data && !me.data.onboarded) router.replace("/onboarding");
  }, [me.data, router]);

  if (isPending || (session && me.isPending)) return <Splash />;
  if (me.isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <ErrorState className="w-full max-w-md" onRetry={() => me.refetch()} />
      </div>
    );
  }
  if (!me.data || !me.data.onboarded) return <Splash />;

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 pb-[78px] lg:pb-0">
          <div className="mx-auto max-w-[1160px] px-3.5 pt-4 pb-7 lg:px-8 lg:pt-7 lg:pb-12">{children}</div>
        </main>
        <BottomNav />
      </div>
      <NewTransaction />
      <RewardLayer />
    </div>
  );
}
