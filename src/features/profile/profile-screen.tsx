"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { XpBar } from "@/components/orbita/bars";
import { CategoryToggleChip } from "@/components/orbita/category-chip";
import { Cobre } from "@/components/orbita/cobre";
import { Icon } from "@/components/orbita/icon";
import { Medal } from "@/components/orbita/medal";
import { PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { Coin, LevelBadge } from "@/components/orbita/stat-pill";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { useTheme } from "@/components/shell/use-theme";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { Achievement, ShopItem } from "@/lib/api/schemas";
import { findCategory } from "@/lib/categories";
import { monthName } from "@/lib/dates";
import { formatNumber, MINUS } from "@/lib/format";
import { signOut } from "@/features/auth/auth";
import { useAchievements, useBuyItem, useCategories, useCompare, useShop, useUpdateMe } from "@/features/me/hooks";
import { usePushSubscription } from "@/features/push/use-push-subscription";
import { useInstallPrompt } from "@/features/pwa/use-install-prompt";
import { useAppStore } from "@/stores/app-store";

/** Cores das medalhas por key (Tela Perfil). */
const MEDAL_COLORS: Record<string, [string, string]> = {
  "primeiro-passo": ["#20B878", "#149160"],
  "fogo-aceso": ["#FF8A1E", "#D96A00"],
  "cacador-de-chefao": ["#8B5CF6", "#6A3FD6"],
  "olho-no-extrato": ["#2E8BEF", "#1B6AC6"],
  cofrinho: ["#EC4E9C", "#C23579"],
  "mao-de-vaca": ["#20B878", "#149160"],
  "fogo-eterno": ["#FF8A1E", "#D96A00"],
  "zerou-a-trilha": ["#FFC21F", "#D39500"],
  madrugador: ["#8B5CF6", "#6A3FD6"],
  "sem-dividas": ["#2E8BEF", "#1B6AC6"],
  colecionador: ["#B5703A", "#8A5226"],
  lenda: ["#12B3C4", "#0C8794"],
};

const TITLES = ["Iniciante", "Aprendiz da Grana", "Organizada", "Poupadora Esperta", "Estrategista do Mês", "Mestre da Órbita", "Lenda"];
function levelTitle(level: number) {
  return TITLES[Math.min(TITLES.length - 1, Math.floor((level - 1) / 3))];
}

const SHOP_LOOK: Record<string, { desc: string; bg: string; icon?: string; cobre?: "comemorando" | "dormindo" }> = {
  escudo: { desc: "Protege 1 dia sem registro", bg: "var(--b)", icon: "shield" },
  "tema-noite-estrelada": { desc: "Roxo profundo com estrelas", bg: "var(--p)", icon: "palette" },
  "cobre-festa": { desc: "Roupinha comemorativa", bg: "var(--ys)", cobre: "comemorando" },
  "cobre-soneca": { desc: "Pijama para as noites", bg: "var(--ps)", cobre: "dormindo" },
};

function AchievementsGrid() {
  const achievements = useAchievements();
  const openModal = useAppStore((s) => s.openModal);
  const list = achievements.data ?? [];
  const open = (a: Achievement) =>
    a.unlocked && openModal({ kind: "conquista", achievement: { key: a.key, title: a.title, description: a.description, icon: a.icon } });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between px-1.5">
        <div className="font-display text-xl leading-[1.2] font-black">Conquistas</div>
        <div className="text-[13px] leading-none font-bold text-mut">toque para ver</div>
      </div>
      <QueryState
        query={achievements}
        rows={3}
        isEmpty={list.length === 0}
        frame={(node) => (
          <Card radius="lg" padding="lg">
            {node}
          </Card>
        )}
        empty={<EmptyState mood="feliz" title="Sua estante está vazia" text="A primeira medalha sai no primeiro lançamento. Vamos?" />}
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,104px),1fr))] gap-2.5 lg:grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
          {list.map((a) => {
            const [c, d] = MEDAL_COLORS[a.key] ?? ["#20B878", "#149160"];
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => open(a)}
                className="flex flex-col items-center gap-2 rounded-[20px] border-2 border-b-[5px] border-bd bg-sf px-2 pt-3.5 pb-3 text-center text-ink"
              >
                <Medal icon={a.icon} color={c} shadow={d} locked={!a.unlocked} />
                <div className="font-display text-[13px] leading-[1.2] font-extrabold">{a.title}</div>
                <div className="text-[11px] leading-[1.3] font-semibold text-mut">{a.unlocked ? a.description : (a.hint ?? a.description)}</div>
              </button>
            );
          })}
        </div>
      </QueryState>
    </div>
  );
}

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
        .slice(0, 4)
    : [];
  const max = Math.max(1, ...rows.flatMap((r) => [r.a, r.b]));
  const totalDelta = c && c.previous.totalCents > 0 ? Math.round(((c.current.totalCents - c.previous.totalCents) / c.previous.totalCents) * 100) : null;

  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <CardTitle>Você vs. mês passado</CardTitle>
        {totalDelta != null ? (
          <div
            className="flex items-center gap-1 rounded-[10px] px-2.5 py-1.5 font-display text-[13px] leading-none font-black"
            style={{ background: totalDelta <= 0 ? "var(--gs)" : "var(--rs)", color: totalDelta <= 0 ? "var(--gd)" : "var(--rd)" }}
          >
            <Icon name={totalDelta <= 0 ? "trending_down" : "trending_up"} size={18} />
            {totalDelta <= 0 ? MINUS : "+"}
            {Math.abs(totalDelta)}% em gastos
          </div>
        ) : null}
      </div>
      <QueryState query={compare} rows={4} isEmpty={rows.length === 0} empty={<div className="text-sm font-semibold text-mut">Ainda sem gastos para comparar.</div>}>
        {rows.map((r) => {
          const cat = findCategory(categories, r.key);
          const d = r.a > 0 ? Math.round(((r.b - r.a) / r.a) * 100) : r.b > 0 ? 100 : 0;
          return (
            <div key={r.key} className="grid grid-cols-[110px_minmax(0,1fr)_64px] items-center gap-2.5">
              <div className="flex items-center gap-1.5 font-display text-sm leading-[1.2] font-extrabold">
                <Icon name={cat.icon} size={20} style={{ color: cat.color }} />
                <span className="truncate">{cat.name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-2.5 rounded-md bg-sf2 transition-[width] duration-700" style={{ width: `${(r.a / max) * 100}%` }} />
                <div
                  className="h-3.5 rounded-[7px] shadow-[inset_0_-3px_0_rgba(0,0,0,.12)] transition-[width] duration-700"
                  style={{ width: `${(r.b / max) * 100}%`, background: cat.color }}
                />
              </div>
              <div className="text-right font-display text-sm leading-none font-black" style={{ color: d > 0 ? "var(--r)" : "var(--g)" }}>
                {d > 0 ? "+" : MINUS}
                {Math.abs(d)}%
              </div>
            </div>
          );
        })}
      </QueryState>
      {c ? (
        <div className="flex gap-4 text-xs leading-none font-bold text-mut">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded border border-bd bg-sf2" />
            {monthName(c.previous.month)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-3.5 rounded bg-g" />
            {monthName(c.current.month)}
          </span>
        </div>
      ) : null}
    </Card>
  );
}

function ShopRow({ item, coins }: { item: ShopItem; coins: number }) {
  const buy = useBuyItem();
  const look = SHOP_LOOK[item.key] ?? { desc: "", bg: "var(--g)", icon: item.icon };
  const owned = item.owned;
  const can = coins >= item.price;
  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-sf2 p-2.5">
      <div className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-2xl" style={{ background: look.bg }}>
        {look.cobre ? <Cobre mood={look.cobre} size={54} /> : <Icon name={look.icon ?? item.icon} size={34} className="text-white" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[15px] leading-[1.2] font-extrabold">{item.name}</div>
        <div className="mt-0.5 text-xs leading-[1.3] font-semibold text-mut">{look.desc}</div>
      </div>
      {owned ? (
        <span className="flex h-10 items-center rounded-xl bg-gs px-3 font-display text-[13px] leading-none font-black text-gd">Seu!</span>
      ) : (
        <Button
          variant="gold"
          size="sm"
          className="px-3 tracking-normal normal-case"
          disabled={!can || buy.isPending}
          onClick={() => buy.mutate(item.key)}
        >
          {item.price} moedas
        </Button>
      )}
    </div>
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

/** Linha "Instalar app" (só aparece quando o navegador disparou `beforeinstallprompt`). */
function InstallAppRow() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  if (!canInstall || dismissed) return null;
  return (
    <div className="flex items-center gap-3 border-t-2 border-sf2 py-3">
      <Icon name="install_mobile" className="text-g" />
      <div className="flex-1 font-display text-[15px] leading-none font-extrabold">Instalar app</div>
      <button
        type="button"
        onClick={promptInstall}
        className="h-8 rounded-[10px] border-2 border-bd bg-sf px-2.5 font-display text-xs leading-none font-extrabold text-ink"
      >
        Instalar
      </button>
      <button
        type="button"
        aria-label="Dispensar"
        onClick={() => setDismissed(true)}
        className="flex size-8 shrink-0 items-center justify-center bg-transparent text-mut"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}

/** Perfil: avatar + nível + stats, conquistas, comparativo, loja e configurações. */
export function ProfileScreen() {
  const router = useRouter();
  const me = useAppStore((s) => s.me);
  const openModal = useAppStore((s) => s.openModal);
  const achievements = useAchievements();
  const shop = useShop();
  const { isDark, setThemePref } = useTheme();
  const updateMe = useUpdateMe();
  const push = usePushSubscription();
  const [catsOpen, setCatsOpen] = useState(false);
  if (!me) return null;

  const unlocked = achievements.data?.filter((a) => a.unlocked).length ?? 0;
  const total = achievements.data?.length ?? 0;
  const xpToNext = me.xpToNext || 1500;

  // Liga: pede permissão e assina push antes de gravar a preferência (se a
  // permissão for negada, `me.notificationsEnabled` não muda e o switch
  // volta sozinho). Desliga: cancela a assinatura e só então grava.
  async function handleNotificationsToggle(next: boolean) {
    const ok = next ? await push.subscribe() : await push.unsubscribe();
    if (!ok) return;
    updateMe.mutate({ notificationsEnabled: next });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-[18px]">
        <Card padding="xl" className="flex flex-wrap items-center gap-[18px]">
          <div className="relative shrink-0">
            <Avatar src={me.avatarUrl} name={me.name ?? me.email} size={96} />
            <LevelBadge level={me.level} size={40} className="absolute -right-1.5 -bottom-1 border-[3px] border-sf" />
          </div>
          <div className="flex min-w-[200px] flex-1 flex-col gap-2">
            <div className="font-display text-[26px] leading-[1.1] font-black">{me.name ?? me.email}</div>
            <div className="text-sm leading-none font-bold text-p">
              Nível {me.level} · {levelTitle(me.level)}
            </div>
            <XpBar xp={me.xp} xpToNext={xpToNext} showLabel={false} />
            <div className="num text-[13px] leading-none font-bold text-mut">
              {formatNumber(me.xp)} / {formatNumber(xpToNext)} XP · faltam {formatNumber(Math.max(0, xpToNext - me.xp))} para o nível {me.level + 1}
            </div>
          </div>
          <div className="grid w-full grid-cols-3 gap-2.5">
            <div className="flex items-center gap-2 rounded-2xl border-2 border-bd p-3">
              <Icon name="local_fire_department" size={28} className="text-o" />
              <div>
                <div className="font-display text-xl leading-none font-black">{me.streakRecord}</div>
                <div className="text-[11px] leading-[1.2] font-bold text-mut">recorde</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-bd p-3">
              <Icon name="military_tech" size={28} className="text-y" />
              <div>
                <div className="font-display text-xl leading-none font-black">
                  {unlocked}/{total || "–"}
                </div>
                <div className="text-[11px] leading-[1.2] font-bold text-mut">medalhas</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-bd p-3">
              <Coin size={26} />
              <div>
                <div className="font-display text-xl leading-none font-black">{formatNumber(me.coins)}</div>
                <div className="text-[11px] leading-[1.2] font-bold text-mut">moedas</div>
              </div>
            </div>
          </div>
        </Card>
        <AchievementsGrid />
        <CompareCard />
      </div>

      <div className="flex min-w-0 flex-col gap-[18px]">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle>Loja</CardTitle>
            <div className="flex items-center gap-[5px] font-display text-base leading-none font-black text-yd">
              <Coin size={20} withSign={false} />
              {formatNumber(me.coins)}
            </div>
          </div>
          <QueryState query={shop} rows={4} isEmpty={(shop.data ?? []).length === 0} empty={<div className="text-sm font-semibold text-mut">A loja abre em breve.</div>}>
            {(shop.data ?? []).map((item) => (
              <ShopRow key={item.key} item={item} coins={me.coins} />
            ))}
          </QueryState>
        </Card>

        <Card padding="none" className="flex flex-col px-5 py-2">
          <div className="flex items-center gap-3 py-3">
            <Icon name="dark_mode" className="text-p" />
            <div className="flex-1 font-display text-[15px] leading-none font-extrabold">Tema escuro</div>
            <Switch checked={isDark} onCheckedChange={(v) => setThemePref(v ? "dark" : "light")} aria-label="Tema escuro" />
          </div>
          <div className="flex items-center gap-3 border-t-2 border-sf2 py-3">
            <Icon name="notifications" className="text-b" />
            <div className="flex-1 font-display text-[15px] leading-none font-extrabold">Notificações</div>
            <Switch
              checked={me.notificationsEnabled}
              disabled={updateMe.isPending || push.isPending}
              onCheckedChange={handleNotificationsToggle}
              aria-label="Notificações"
            />
          </div>
          <button type="button" onClick={() => setCatsOpen(true)} className="flex items-center gap-3 border-t-2 border-sf2 bg-transparent py-3 text-left text-ink">
            <Icon name="category" className="text-o" />
            <div className="flex-1 font-display text-[15px] leading-none font-extrabold">Categorias</div>
            <Icon name="chevron_right" className="text-mut" />
          </button>
          <div className="flex items-center gap-3 border-t-2 border-sf2 py-3">
            <Icon name="celebration" className="text-mut" />
            <div className="flex-1 font-display text-[15px] leading-none font-extrabold">Ver celebrações</div>
            <button
              type="button"
              onClick={() => openModal({ kind: "nivel", level: me.level })}
              className="h-8 rounded-[10px] border-2 border-bd bg-sf px-2.5 font-display text-xs leading-none font-extrabold text-ink"
            >
              Nível
            </button>
            <button
              type="button"
              onClick={() => openModal({ kind: "ofensiva", streak: me.streak })}
              className="h-8 rounded-[10px] border-2 border-bd bg-sf px-2.5 font-display text-xs leading-none font-extrabold text-ink"
            >
              Ofensiva
            </button>
          </div>
          <InstallAppRow />
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
            className="flex items-center gap-3 border-t-2 border-sf2 bg-transparent py-3.5 text-left font-display text-[15px] leading-none font-extrabold text-r"
          >
            <Icon name="logout" />
            Sair
          </button>
        </Card>
      </div>
      {catsOpen ? <CategoriesDialog open={catsOpen} onOpenChange={setCatsOpen} /> : null}
    </div>
  );
}
