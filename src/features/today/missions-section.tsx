"use client";

import { useState } from "react";

import { IconTile } from "@/components/orbita/icon-tile";
import { SectionHeader } from "@/components/orbita/section-header";
import { Stamp } from "@/components/orbita/stamp";
import { CoinReward, XpChip } from "@/components/orbita/stat-pill";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Mission } from "@/lib/api/schemas";
import { ROTATING_TONES } from "@/lib/colors";
import { untilMidnightLabel } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useClaimMission, useMissions, useStreak } from "@/features/gamification/hooks";
import { useAppStore } from "@/stores/app-store";

/** API_CONTRACT "Pedidos do front": sem `unit` do back, deduzimos por target >= 1000
 * (cobre a missão "gastar-pouco", cujo alvo é em centavos). Exportada para teste. */
export function isMoney(m: Mission) {
  return m.unit ? m.unit === "cents" : m.target >= 1000;
}

function progressLabel(m: Mission) {
  if (isMoney(m)) return `${formatBRL(m.progress, { compact: true })} / ${formatBRL(m.target, { compact: true }).replace("R$ ", "")}`;
  return `${m.progress}/${m.target}`;
}

function MissionCard({ mission, index }: { mission: Mission; index: number }) {
  const claim = useClaimMission();
  const [claimedNow, setClaimedNow] = useState(false);
  const tone = ROTATING_TONES[index % ROTATING_TONES.length];
  const claimed = mission.claimed || claimedNow;
  const streak = useStreak();
  // "Gaste menos de…" (centavos) só é resgatável depois de fechar o dia abaixo do teto.
  const complete = isMoney(mission)
    ? !!streak.data?.closedToday && mission.progress <= mission.target
    : mission.progress >= mission.target;
  const pct = Math.min(100, Math.round((mission.progress / Math.max(1, mission.target)) * 100));

  return (
    <Card radius="md" padding="md" className="relative flex items-center gap-3.5 overflow-hidden">
      <IconTile icon={mission.icon} color={tone.color} soft={tone.soft} variant="soft" size={52} radius={16} iconSize={30} />
      <div className={cn("flex min-w-0 flex-1 flex-col gap-2 transition-opacity", claimed && "opacity-45")}>
        <div className="font-display text-base leading-[1.2] font-extrabold">{mission.title}</div>
        <div className="flex items-center gap-2.5">
          <Progress value={pct} color={tone.color} className="flex-1" />
          <div className="num text-[13px] leading-none font-extrabold whitespace-nowrap text-mut">{progressLabel(mission)}</div>
        </div>
      </div>
      {!claimed && complete ? (
        <Button
          size="sm"
          className="h-[42px]"
          disabled={claim.isPending}
          onClick={() =>
            claim.mutate({ key: mission.key, title: mission.title }, { onSuccess: () => setClaimedNow(true) })
          }
        >
          Resgatar
        </Button>
      ) : null}
      {!claimed && !complete ? (
        <div className="flex shrink-0 flex-col items-end gap-[5px]">
          <XpChip xp={mission.xp} />
          <CoinReward coins={mission.coins} />
        </div>
      ) : null}
      {claimed ? <Stamp /> : null}
    </Card>
  );
}

/** Missões diárias com "Resgatar" e carimbo FEITO!. */
export function MissionsSection({ className }: { className?: string }) {
  const missions = useMissions();
  const openTxSheet = useAppStore((s) => s.openTxSheet);
  const list = missions.data ?? [];
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <SectionHeader title="Missões diárias" aside={`renovam em ${untilMidnightLabel()}`} />
      <QueryState
        query={missions}
        isEmpty={list.length === 0}
        compact
        frame={(node) => (
          <Card radius="md" padding="md">
            {node}
          </Card>
        )}
        empty={
          <EmptyState
            compact
            title="Missões chegando"
            text="Suas missões de hoje aparecem depois do primeiro lançamento."
            ctaLabel="Fazer lançamento"
            onCta={() => openTxSheet()}
          />
        }
      >
        {list.map((m, i) => (
          <MissionCard key={m.key} mission={m} index={i} />
        ))}
      </QueryState>
    </section>
  );
}
