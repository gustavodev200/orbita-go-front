"use client";

import { Cobre, type CobreMood } from "@/components/orbita/cobre";
import { SpeechBubble } from "@/components/orbita/speech-bubble";
import { useIsDesktop } from "@/hooks/use-media-query";
import { formatDM, greeting, monthName, todayISO, weekdayLong } from "@/lib/dates";
import { useSummary } from "@/features/finance/hooks";
import { useCompare } from "@/features/me/hooks";
import { useAppStore } from "@/stores/app-store";

/** Saudação + Cobre (humor pela saúde financeira) + balão. */
export function GreetingSection({ className }: { className?: string }) {
  const desktop = useIsDesktop();
  const today = todayISO();
  const me = useAppStore((s) => s.me);
  const summary = useSummary(today.slice(0, 7));
  const compare = useCompare();
  const first = me?.name?.trim().split(/\s+/)[0];

  const s = summary.data;
  const empty = !!s && s.incomeCents === 0 && s.expenseCents === 0;
  let mood: CobreMood = "feliz";
  if (summary.isError) mood = "preocupado";
  else if (empty) mood = "dormindo";
  else if (s && s.balanceCents < 0) mood = "preocupado";

  let bubble = "Bora cuidar da grana hoje? Cada lançamento vale XP.";
  if (empty) bubble = "Tudo quietinho por aqui. Bora fazer o primeiro lançamento?";
  else if (compare.data && compare.data.previous.totalCents > 0) {
    const { previous, current } = compare.data;
    const pct = Math.round(((current.totalCents - previous.totalCents) / previous.totalCents) * 100);
    const prevName = monthName(previous.month).toLowerCase();
    bubble =
      pct <= 0
        ? `Você está ${Math.abs(pct)}% abaixo do gasto de ${prevName}. Continua assim!`
        : `Você está ${pct}% acima do gasto de ${prevName}. Bora segurar um pouquinho?`;
  } else if (s && s.balanceCents < 0) bubble = "O saldo do mês ficou no vermelho. Vamos olhar o extrato juntos?";

  return (
    <section className={className}>
      <div className="flex items-center gap-4 px-1 py-1.5">
        <Cobre mood={mood} size={desktop ? 108 : 84} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="text-sm leading-none font-semibold text-mut">
            {weekdayLong(today)}, {formatDM(today)}
          </div>
          <h1 className="m-0 font-display text-[26px] leading-[1.1] font-black tracking-[-.01em] text-ink lg:text-[34px]">
            {greeting()}
            {first ? `, ${first}` : ""}!
          </h1>
          <SpeechBubble className="self-start">{bubble}</SpeechBubble>
        </div>
      </div>
    </section>
  );
}
