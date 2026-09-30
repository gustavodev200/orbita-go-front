"use client";

import { Icon } from "@/components/orbita/icon";
import { ErrorState, LoadingState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDM } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAttackBoss, useBoss } from "@/features/gamification/hooks";
import { useAppStore } from "@/stores/app-store";

const ATTACK_CENTS = 30000;

/** Chefão do mês (maior recorrente): card roxo escuro, coroa, barra de vida. */
export function BossCard({ className }: { className?: string }) {
  const boss = useBoss();
  const attack = useAttackBoss();
  const b = boss.data;
  const openTxSheet = useAppStore((s) => s.openTxSheet);

  return (
    <section
      className={cn(
        "relative flex flex-col gap-3.5 overflow-hidden rounded-[24px] border-b-[5px] border-[#120C22] bg-boss p-5 text-white",
        className,
      )}
    >
      <div aria-hidden className="absolute -top-[30px] -right-[30px] size-[140px] rounded-full bg-white/5" />
      {boss.isPending ? (
        <LoadingState rows={2} />
      ) : boss.isError ? (
        <ErrorState compact onRetry={() => boss.refetch()} />
      ) : !b ? (
        <div className="relative flex items-center gap-3.5">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-[20px] bg-[#4B3584] shadow-[inset_0_-5px_0_#33235E]">
            <Icon name="swords" size={34} className="text-[#FFD66B]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[11px] leading-none font-extrabold tracking-[.14em] text-[#C9B8FF] uppercase">
              Chefão do mês
            </div>
            <div className="mt-1 font-display text-lg leading-[1.2] font-black">Nenhum chefão à vista</div>
            <div className="mt-1 text-[13px] leading-[1.4] font-semibold text-[#C9B8FF]">
              Cadastre uma conta fixa de saída e a maior delas vira o chefão do mês.
            </div>
            <Button variant="gold" size="sm" className="mt-3" onClick={() => openTxSheet({ recurring: true })}>
              Adicionar recorrente
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3.5">
            <div className="relative flex size-16 shrink-0 items-center justify-center rounded-[20px] bg-[#4B3584] shadow-[inset_0_-5px_0_#33235E]">
              <Icon name={b.icon || "home"} size={38} className="text-[#FFD66B]" />
              <Icon name="crown" size={26} className="absolute -top-3.5 text-y" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[11px] leading-none font-extrabold tracking-[.14em] text-[#C9B8FF] uppercase">
                Chefão do mês
              </div>
              <div className="mt-1 font-display text-[22px] leading-[1.15] font-black">
                {b.defeated ? `${b.name} derrotado!` : b.name}
              </div>
              <div className="mt-0.5 text-[13px] leading-[1.3] font-semibold text-[#C9B8FF]">
                {b.dueDate ? `vence ${formatDM(b.dueDate)} · ` : ""}
                {formatBRL(b.maxHpCents)}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between font-display text-xs leading-none font-extrabold tracking-[.06em] uppercase">
              <span className="flex items-center gap-1">
                <Icon name="favorite" size={16} className="text-[#FF7A8A]" />
                Vida
              </span>
              <span className="num">{formatBRL(Math.max(0, b.hpCents))}</span>
            </div>
            <Progress
              value={b.maxHpCents ? (b.hpCents / b.maxHpCents) * 100 : 0}
              kind="hp"
              size="lg"
              tone="boss"
              className="bg-[#140E26]"
            />
            <div className="mt-2 text-[13px] leading-[1.4] font-semibold text-[#C9B8FF]">
              {b.defeated
                ? "Grana reservada. O chefão caiu antes do vencimento."
                : `Você já reservou ${formatBRL(b.maxHpCents - b.hpCents)}. Cada R$ guardado tira vida do chefão.`}
            </div>
          </div>
          {!b.defeated && b.maxHpCents > 0 ? (
            <Button
              variant="gold"
              className="h-[50px]"
              disabled={attack.isPending}
              onClick={() => attack.mutate(Math.min(ATTACK_CENTS, b.hpCents))}
            >
              <Icon name="swords" />
              Atacar · guardar {formatBRL(Math.min(ATTACK_CENTS, b.hpCents), { compact: true })}
            </Button>
          ) : null}
        </>
      )}
    </section>
  );
}
