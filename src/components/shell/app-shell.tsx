"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LogoMark } from "@/components/orbita/logo";
import { ErrorState } from "@/components/orbita/states";
import { useSession } from "@/features/auth/use-session";
import { NewTransaction } from "@/features/finance/new-transaction/new-transaction";
import { useMe } from "@/features/me/hooks";
import { ReminderDialog } from "@/features/reminders/reminder-dialog";
import { TaskDialog } from "@/features/tasks/task-dialog";
import { hasSupabaseEnv } from "@/lib/env";
import { useAppStore } from "@/stores/app-store";
import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { useAdoptServerTheme } from "./use-theme";

function Splash() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center">
      <LogoMark size={56} className="animate-pulse" />
    </div>
  );
}

/** Diálogos globais de criação rápida (botão + e agenda). */
function QuickAddLayer() {
  const quickAdd = useAppStore((s) => s.quickAdd);
  const close = useAppStore((s) => s.closeQuickAdd);
  const onOpenChange = (o: boolean) => !o && close();
  return (
    <>
      {quickAdd.kind === "task" ? (
        <TaskDialog
          key={quickAdd.editing?.id ?? `new-${quickAdd.date}`}
          open
          onOpenChange={onOpenChange}
          task={quickAdd.editing}
          initialDate={quickAdd.date}
        />
      ) : null}
      {quickAdd.kind === "reminder" ? (
        <ReminderDialog key={`r-${quickAdd.date}`} open onOpenChange={onOpenChange} initialDate={quickAdd.date} />
      ) : null}
    </>
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
        <main className="flex-1 pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-0">
          <div className="mx-auto max-w-[1120px] px-4 pt-2 pb-6 lg:px-8 lg:pt-4 lg:pb-12">{children}</div>
        </main>
        <BottomNav />
      </div>
      <NewTransaction />
      <QuickAddLayer />
    </div>
  );
}
