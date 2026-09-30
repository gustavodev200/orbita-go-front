"use client";

import { useState } from "react";

import {
  AmountDisplay,
  CategoryToggleChip,
  CelebrationModal,
  Checkbox3D,
  ChoiceChip,
  Cobre,
  CoinPill,
  EmptyState,
  ErrorState,
  GoogleButton,
  HpBar,
  Icon,
  IconTile,
  LevelBadge,
  LoadingState,
  LogoMark,
  Medal,
  NumericKeypad,
  ProgressRing,
  SegmentedControl,
  SpeechBubble,
  Stamp,
  StreakPill,
  Wordmark,
  XpBar,
  XpChip,
  XpToastCard,
  applyKey,
  type CobreMood,
} from "@/components/orbita";
import { useTheme } from "@/components/shell/use-theme";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonTag } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FALLBACK_CATEGORIES } from "@/lib/categories";
import type { CelebrationKind, ModalState } from "@/stores/app-store";

const MOODS: { id: CobreMood; name: string; use: string; bg: string }[] = [
  { id: "feliz", name: "Feliz", use: "Saudação, finanças saudáveis, onboarding", bg: "var(--gs)" },
  { id: "preocupado", name: "Preocupado", use: "Orçamento no fim, contas atrasadas, erros", bg: "var(--rs)" },
  { id: "dormindo", name: "Dormindo", use: "Estados vazios, dias sem registro", bg: "var(--ps)" },
  { id: "comemorando", name: "Comemorando", use: "Nível, conquistas, metas concluídas", bg: "var(--ys)" },
];

const BUTTONS = [
  { variant: "primary", label: "Salvar", icon: "check" },
  { variant: "orange", label: "Fechar o dia", icon: "local_fire_department" },
  { variant: "gold", label: "Atacar", icon: "swords" },
  { variant: "blue", label: "Entrada", icon: "south_west" },
  { variant: "danger", label: "Saída", icon: "north_east" },
  { variant: "ai", label: "IA", icon: "auto_awesome" },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 font-display text-2xl leading-none font-black">{title}</h2>
      {children}
    </section>
  );
}

/** Biblioteca viva (espelha Orbita Componentes.dc.html). */
export function DesignSystemView() {
  const { isDark, toggle } = useTheme();
  const [xp, setXp] = useState(1240);
  const [stamped, setStamped] = useState(false);
  const [sw, setSw] = useState(true);
  const [ck, setCk] = useState(false);
  const [off, setOff] = useState<string[]>(["laz", "edu"]);
  const [seg, setSeg] = useState<"expense" | "income">("expense");
  const [cents, setCents] = useState(0);
  const [modal, setModal] = useState<ModalState | null>(null);

  const openKind = (kind: CelebrationKind) =>
    setModal({
      kind,
      level: 8,
      streak: 12,
      achievement: { key: "primeiro-passo", title: "Primeiro passo", description: "Você começou a organizar a vida.", icon: "flag" },
      goal: { name: "Viagem pro Chile", targetCents: 800000, steps: 10 },
    });

  return (
    <div className="min-h-dvh bg-bg px-[clamp(16px,4vw,56px)] pt-10 pb-20 text-ink">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-9">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Cobre mood="feliz" size={72} />
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark />
                <Wordmark size={40} />
              </div>
              <div className="mt-1.5 text-[15px] leading-[1.3] font-bold text-mut">
                Biblioteca de componentes · shadcn/ui + Tailwind + framer-motion
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="h-11 rounded-[14px] px-4 text-sm" onClick={toggle}>
            <Icon name="contrast" />
            Tema {isDark ? "escuro" : "claro"}
          </Button>
        </header>

        <Section title="Mascote · Cobre">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
            {MOODS.map((m) => (
              <Card key={m.id} padding="xl" className="flex flex-col items-center gap-2.5 text-center">
                <div className="flex size-[150px] items-center justify-center rounded-full" style={{ background: m.bg }}>
                  <Cobre mood={m.id} size={130} />
                </div>
                <div className="font-display text-lg leading-none font-black">{m.name}</div>
                <div className="text-[13px] leading-[1.4] font-semibold text-mut">{m.use}</div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Botões 3D">
          <Card padding="xl" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3.5">
              {BUTTONS.map((b) => (
                <Button key={b.variant} variant={b.variant}>
                  <Icon name={b.icon} size={22} />
                  {b.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              <Button variant="secondary" className="text-b">
                Secundário
              </Button>
              <Button disabled>Desativado</Button>
              <Button size="sm">Pequeno</Button>
              <Button size="fab" aria-label="Adicionar">
                <Icon name="add" />
              </Button>
              <Button variant="orange">
                Fechar o dia <ButtonTag>+15 XP</ButtonTag>
              </Button>
              <GoogleButton />
            </div>
            <div className="text-[13px] leading-normal font-semibold text-mut">
              Receita:{" "}
              <code className="rounded-md bg-sf2 px-1.5 py-0.5 font-mono text-xs">
                {'<Button variant="primary|orange|gold|blue|danger|ai|secondary" size="lg|md|sm|xs|fab|icon">'}
              </code>
            </div>
          </Card>
        </Section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-[18px]">
          <Section title="Barras">
            <Card padding="xl" className="flex flex-col gap-[18px]">
              <XpBar xp={xp} level={7} />
              <div>
                <div className="mb-2 font-display text-[13px] leading-none font-extrabold">Progresso de missão</div>
                <Progress value={66} tone="b" />
              </div>
              <HpBar value={72} trailing="Saúde · R$ 170 restam" />
              <HpBar value={32} trailing="Alimentação · R$ 260" />
              <HpBar value={4} trailing="Lazer · R$ 15" />
              <Button variant="gold" size="sm" className="self-start" onClick={() => setXp((v) => (v >= 1500 ? 200 : Math.min(1500, v + 60)))}>
                Testar +60 XP
              </Button>
            </Card>
          </Section>
          <Section title="Badges">
            <Card padding="xl" className="flex flex-col gap-[18px]">
              <div className="flex flex-wrap items-center gap-3">
                <StreakPill value={12} tinted />
                <CoinPill value={340} tinted />
                <XpChip xp={20} className="px-2.5 py-1.5 text-sm" />
                <LevelBadge level={7} size={36} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="paid">Pago</Badge>
                <Badge tone="pending">Pendente</Badge>
                <Badge tone="overdue">Atrasado</Badge>
                <Badge tone="info">Finanças</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <AmountDisplay cents={620000} type="income" size="xl" />
                <AmountDisplay cents={4500} type="expense" size="xl" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Medal icon="swords" color="#8B5CF6" shadow="#6A3FD6" />
                <Medal icon="diamond" color="" locked />
                <IconTile icon="savings" color="var(--g)" size={52} radius={16} />
                <ProgressRing value={66} size={72} thickness={8}>
                  <span className="font-display text-sm font-black">2/3</span>
                </ProgressRing>
              </div>
            </Card>
          </Section>
        </section>

        <Section title="Chips de categoria">
          <Card padding="xl" className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
            {FALLBACK_CATEGORIES.slice(0, 8).map((c) => {
              const on = !off.includes(c.key);
              return (
                <CategoryToggleChip
                  key={c.key}
                  name={c.name}
                  icon={c.icon}
                  color={c.color}
                  on={on}
                  onToggle={() => setOff((o) => (on ? [...o, c.key] : o.filter((k) => k !== c.key)))}
                />
              );
            })}
          </Card>
        </Section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-[18px]">
          <Section title="Cards">
            <Card radius="md" padding="md" className="relative flex items-center gap-3.5 overflow-hidden">
              <IconTile icon="task_alt" color="var(--g)" soft="var(--gs)" variant="soft" size={52} radius={16} iconSize={30} />
              <div className={`flex flex-1 flex-col gap-2 ${stamped ? "opacity-45" : ""}`}>
                <div className="font-display text-base leading-[1.2] font-extrabold">Conclua 2 tarefas</div>
                <Progress value={100} />
              </div>
              {stamped ? (
                <button type="button" onClick={() => setStamped(false)} aria-label="Desfazer">
                  <Stamp />
                </button>
              ) : (
                <Button size="sm" className="h-[42px]" onClick={() => setStamped(true)}>
                  Resgatar
                </Button>
              )}
            </Card>
            <div className="flex items-center gap-3.5 rounded-[24px] border-b-[5px] border-[#120C22] bg-boss p-5 text-white">
              <div className="flex size-14 items-center justify-center rounded-[18px] bg-[#4B3584] shadow-[inset_0_-5px_0_#33235E]">
                <Icon name="home" size={32} className="text-[#FFD66B]" />
              </div>
              <div className="flex-1">
                <div className="font-display text-[11px] leading-none font-extrabold tracking-[.14em] text-[#C9B8FF] uppercase">Chefão do mês</div>
                <div className="mt-1 mb-2 font-display text-xl leading-[1.2] font-black">Aluguel</div>
                <Progress value={65} kind="hp" tone="boss" className="bg-[#140E26]" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <Cobre size={72} />
              <SpeechBubble tail="left" raised className="mb-3 flex-1">
                Balão de fala do Cobre com biquinho.
              </SpeechBubble>
            </div>
          </Section>
          <Section title="Controles">
            <Card padding="xl" className="flex flex-col gap-4">
              <Tabs defaultValue="extrato">
                <TabsList>
                  <TabsTrigger value="extrato">Extrato</TabsTrigger>
                  <TabsTrigger value="metas">Metas</TabsTrigger>
                  <TabsTrigger value="orcamento">Orçamento</TabsTrigger>
                </TabsList>
              </Tabs>
              <SegmentedControl
                variant="solid"
                value={seg}
                onChange={setSeg}
                options={[
                  { value: "expense", label: "Saída", icon: "north_east", color: "var(--r)", shadow: "var(--rd)" },
                  { value: "income", label: "Entrada", icon: "south_west", color: "var(--b)", shadow: "var(--bdk)" },
                ]}
              />
              <div className="flex flex-wrap items-center gap-3.5">
                <Switch checked={sw} onCheckedChange={setSw} aria-label="Switch" />
                <Checkbox3D checked={ck} onCheckedChange={setCk} />
                <Input containerClassName="min-w-[200px] flex-1" icon={<Icon name="notes" className="text-mut" />} placeholder="Input padrão" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <ChoiceChip selected>Hoje</ChoiceChip>
                <ChoiceChip>Ontem</ChoiceChip>
                <ChoiceChip variant="ink" selected>
                  Todos
                </ChoiceChip>
                <ChoiceChip variant="dashed">
                  <Icon name="add" /> Nova meta
                </ChoiceChip>
              </div>
              <XpToastCard xp={10} coins={2} message="Toast · lançamento salvo" className="self-start" />
            </Card>
          </Section>
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-[18px]">
          <Section title="Valor + teclado">
            <Card padding="none" className="overflow-hidden">
              <div className="p-5 text-center">
                <AmountDisplay cents={cents} type="expense" size="hero" zeroMuted />
              </div>
              <NumericKeypad onKey={(k) => setCents((c) => applyKey(c, k))} className="pb-3" />
            </Card>
          </Section>
          <Section title="Celebrações">
            <Card padding="xl" className="flex flex-wrap gap-2.5">
              {(["nivel", "conquista", "ofensiva", "escudo", "meta"] as const).map((k) => (
                <Button key={k} variant="secondary" size="sm" onClick={() => openKind(k)}>
                  {k}
                </Button>
              ))}
            </Card>
          </Section>
        </section>

        <Section title="Estados de lista">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-3.5">
            <Card radius="lg" padding="none" className="p-[18px]">
              <EmptyState title="Seu extrato está zerado" text="Registre o primeiro lançamento e ganhe 10 XP." ctaLabel="Novo lançamento" />
            </Card>
            <Card radius="lg" padding="none" className="p-[18px]">
              <LoadingState rows={5} />
            </Card>
            <Card radius="lg" padding="none" className="p-[18px]">
              <ErrorState />
            </Card>
          </div>
        </Section>
      </div>
      <CelebrationModal
        modal={modal}
        onClose={() => setModal(null)}
        onPrimary={(m) => (m.kind === "ofensiva" ? setModal({ ...m, kind: "escudo" }) : setModal(null))}
      />
    </div>
  );
}
