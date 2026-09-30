"use client";

import { RemindersScreen } from "@/features/reminders/reminders-screen";
import { useAppStore } from "@/stores/app-store";

export default function LembretesPage() {
  const streak = useAppStore((s) => s.me?.streak ?? 0);
  return <RemindersScreen streak={streak} />;
}
