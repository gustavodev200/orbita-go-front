"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CategoryToggleChip } from "@/components/orbita/category-chip";
import { Icon } from "@/components/orbita/icon";
import { PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { QueryState } from "@/components/orbita/states";
import { useTheme } from "@/components/shell/use-theme";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/orbita/segmented-control";
import type { ThemePref } from "@/lib/api/schemas";
import { findCategory } from "@/lib/categories";
import { monthName } from "@/lib/dates";
import { formatBRL, MINUS } from "@/lib/format";
import { signOut } from "@/features/auth/auth";
import { useCategories, useCompare, useUpdateMe } from "@/features/me/hooks";
import { NotificationsCard } from "@/features/push/notifications-card";
import { useInstallPrompt } from "@/features/pwa/use-install-prompt";
import { useAppStore } from "@/stores/app-store";

function CompareCard() {
  const compare = useCompare();
  const categories = useCategories();
  const c = compare.data;
  const rows = c
    ? [...new Set([...c.previous.byCategory, ...c.current.byCategory].map((x) => x.key))]
        .map((key) => ({
          key,
          a: c.previous.byCategory.find((x) => x.key === key)?.cents ?? 0,
          b: c.current.byCategory.find((x) => x.key === key)?.cents ?? 0,
        }))
        .sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b))
        .slice(0, 5)
    : [];
  const max = Math.max(1, ...rows.flatMap((r) => [r.a, r.b]));
  const totalDelta =
    c && c.previous.totalCents > 0 ? Math.round(((c.current.totalCents - c.previous.totalCents) / c.previous.totalCents) * 100) : null;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <CardTitle>Gastos vs. mês passado</CardTitle>
        {totalDelta != null ? (
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] leading-none font-medium"
            style={{ background: totalDelta <= 0 ? "var(--oks)" : "var(--rs)", color: totalDelta <= 0 ? "var(--okd)" : "var(--rd)" }}
          >
            <Icon name={totalDelta <= 0 ? "trending_down" : "trending_up"} size={16} />
            {totalDelta <= 0 ? MINUS : "+"}
            {Math.abs(totalDelta)}%
          </span>
        ) : null}
      </div>
      <QueryState
        query={compare}
        rows={4}
        isEmpty={rows.length === 0}
        empty={<div className="text-sm text-mut">Ainda sem gastos para comparar.</div>}
      >
        <div className="flex flex-col gap-3.5">
          {rows.map((r) => {
            const cat = findCategory(categories, r.key);
            return (
              <div key={r.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm leading-none">
                  <span className="flex items-center gap-1.5">
                    <Icon name={cat.icon} size={18} style={{ color: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="num text-mut">{formatBRL(r.b, { compact: true })}</span>
                </div>
                <div className="relative h-2 rounded-full bg-sf2">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-bd" style={{ width: `${(r.a / max) * 100}%` }} />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
                    style={{ width: `${(r.b / max) * 100}%`, background: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </QueryState>
      {c ? (
        <div className="flex gap-4 text-xs leading-none text-mut">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded-full bg-bd" />
            {monthName(c.previous.month)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded-full bg-g" />
            {monthName(c.current.month)}
          </span>
        </div>
      ) : null}
    </Card>
  );
}

function CategoriesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const categories = useCategories().filter((c) => c.type === "expense");
  const enabled = useAppStore((s) => s.me?.enabledCategoryKeys ?? []);
  const [keys, setKeys] = useState<string[]>(enabled);
  const update = useUpdateMe();
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Categorias">
      <PanelHeader title="Categorias" onClose={() => onOpenChange(false)} />
      <PanelBody>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
          {categories.map((c) => {
            const on = keys.includes(c.key);
            return (
              <CategoryToggleChip
                key={c.key}
                name={c.name}
                icon={c.icon}
                color={c.color}
                on={on}
                showCheck
                onToggle={() => setKeys((k) => (on ? k.filter((x) => x !== c.key) : [...k, c.key]))}
              />
            );
          })}
        </div>
      </PanelBody>
      <PanelFooter>
        <Button
          size="lg"
          block
          disabled={update.isPending}
          onClick={() => update.mutate({ enabledCategoryKeys: keys }, { onSuccess: () => onOpenChange(false) })}
        >
          Salvar categorias
        </Button>
      </PanelFooter>
    </Dialog>
  );
}

function SettingRow({ icon, label, children, onClick }: { icon: string; label: string; children?: React.ReactNode; onClick?: () => void }) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sf2 text-ink">
        <Icon name={icon} size={20} />
      </span>
      <span className="flex-1 text-[15px] leading-none font-medium">{label}</span>
      {children}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 bg-transparent py-3 text-left text-ink">
      {content}
    </button>
  ) : (
    <div className="flex items-center gap-3 py-3">{content}</div>
  );
}

const THEMES: { value: ThemePref; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Auto" },
];

/** Perfil: dados da conta, comparativo de gastos, notificações e ajustes. */
export function ProfileScreen() {
  const router = useRouter();
  const me = useAppStore((s) => s.me);
  const { theme, setThemePref } = useTheme();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [catsOpen, setCatsOpen] = useState(false);
  if (!me) return null;

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <Card className="flex items-center gap-4">
          <Avatar src={me.avatarUrl} name={me.name ?? me.email} size={64} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl leading-[1.2] font-semibold">{me.name ?? "Você"}</div>
            <div className="mt-1 truncate text-sm text-mut">{me.email}</div>
            {me.monthlyIncomeCents ? (
              <div className="mt-2 text-[13px] text-mut">Renda mensal: {formatBRL(me.monthlyIncomeCents)}</div>
            ) : null}
          </div>
        </Card>
        <CompareCard />
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <NotificationsCard />
        <Card padding="none" className="flex flex-col [&>*+*]:border-t [&>*+*]:border-sf2 px-5 py-1">
          <SettingRow icon="contrast" label="Tema">
            <SegmentedControl value={theme} onChange={setThemePref} options={THEMES} ariaLabel="Tema" className="w-[200px]" itemClassName="h-8 text-[13px]" />
          </SettingRow>
          <SettingRow icon="category" label="Categorias de gasto" onClick={() => setCatsOpen(true)}>
            <Icon name="chevron_right" className="text-mut" />
          </SettingRow>
          {canInstall ? (
            <SettingRow icon="install_mobile" label="Instalar app" onClick={promptInstall}>
              <Icon name="chevron_right" className="text-mut" />
            </SettingRow>
          ) : null}
          <SettingRow
            icon="logout"
            label="Sair"
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
          />
        </Card>
      </div>
      {catsOpen ? <CategoriesDialog open={catsOpen} onOpenChange={setCatsOpen} /> : null}
    </div>
  );
}
