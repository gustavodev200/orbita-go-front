"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Icon } from "@/components/orbita/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetsTab } from "./budgets-tab";
import { GoalsTab } from "./goals-tab";
import { RecurringsTab } from "./recurrings-tab";
import { StatementTab } from "./statement-tab";

const TABS = [
  { value: "extrato", label: "Extrato", icon: "receipt_long" },
  { value: "recorrentes", label: "Recorrentes", icon: "event_repeat" },
  { value: "orcamento", label: "Orçamento", icon: "shield_with_heart" },
  { value: "metas", label: "Metas", icon: "flag" },
] as const;
type TabValue = (typeof TABS)[number]["value"];

/** Finanças: Tabs segmented 3D Extrato | Recorrentes | Orçamento | Metas (aba na URL). */
export function FinanceScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: TabValue = TABS.some((t) => t.value === raw) ? (raw as TabValue) : "extrato";

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => router.replace(`${pathname}?tab=${v}`, { scroll: false })}
      className="flex flex-col gap-[18px]"
    >
      <TabsList className="max-w-[620px]">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            <Icon name={t.icon} />
            <span className="sr-only min-w-0 truncate group-data-[state=active]:not-sr-only">{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="extrato">
        <StatementTab />
      </TabsContent>
      <TabsContent value="recorrentes">
        <RecurringsTab />
      </TabsContent>
      <TabsContent value="orcamento">
        <BudgetsTab />
      </TabsContent>
      <TabsContent value="metas">
        <GoalsTab startCreating={params.get("nova") === "1"} />
      </TabsContent>
    </Tabs>
  );
}
