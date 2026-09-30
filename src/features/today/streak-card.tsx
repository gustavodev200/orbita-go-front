"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

import { Flame } from "@/components/orbita/stat-pill";
import { Icon } from "@/components/orbita/icon";
import { ErrorState, LoadingState } from "@/components/orbita/states";
import { Button, ButtonTag } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addDaysISO, todayISO, weekdayShort } from "@/lib/dates";
import { useCloseDay, useStreak } from "@/features/gamification/hooks";
import { useAppStore } from "@/stores/app-store";

const LOST_FLAG = "orbita:lost-streak-shown";

/** Ofensiva: últimos 7 dias (hoje tracejado) + "Fechar o dia +15 XP". */
export function StreakCard({ className }: { className?: string }) {
  const streak = useStreak();
  const closeDay = useCloseDay();
  const openModal = useAppStore((s) => s.openModal);
  const today = todayISO();

  // Ofensiva perdida (`lostStreak` > 0): mostra o modal uma vez por sessão.
  const lost = streak.data?.lostStreak ?? 0;
  useEffect(() => {
    if (!lost) return;
    try {
      if (sessionStorage.getItem(LOST_FLAG) === today) return;
      sessionStorage.setItem(LOST_FLAG, today);
    } catch {
      // storage indisponível: mostra mesmo assim
    }
    openModal({ kind: "ofensiva", streak: lost });
  }, [lost, today, openModal]);

  const d = streak.data;
  const closed = !!d?.closedToday;
  const byDate = new Map((d?.days ?? []).map((x) => [x.date.slice(0, 10), x.done]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDaysISO(today, i - 6);
    const isToday = i === 6;
    return { date, isToday, done: isToday ? closed || !!byDate.get(date) : !!byDate.get(date) };
  });

  return (
    <Card className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-[18px] bg-os">
            <Flame size={40} duration={1.4} className="text-o" />
          </div>
          <div className="flex-1">
            <div className="font-display text-[22px] leading-[1.1] font-black text-o">{d?.streak ?? 0} dias de ofensiva</div>
            <div className="mt-1 text-[13px] leading-[1.3] font-semibold text-mut">
              {closed ? `Ofensiva garantida hoje. Recorde: ${d?.record ?? 0} dias` : "Feche o dia até 23h59 para manter o fogo"}
            </div>
          </div>
        </div>

        {streak.isPending ? (
          <LoadingState rows={1} />
        ) : streak.isError ? (
          <ErrorState compact onRetry={() => streak.refetch()} />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1.5">
                  <div className={`font-display text-xs leading-none font-extrabold ${day.isToday ? "text-o" : "text-mut"}`}>
                    {day.isToday ? "Hoje" : weekdayShort(day.date)}
                  </div>
                  {day.done ? (
                    <motion.div
                      initial={day.isToday ? { scale: 0.4 } : false}
                      animate={{ scale: day.isToday ? [0.4, 1.2, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex aspect-square w-full max-w-[38px] items-center justify-center rounded-full bg-o shadow-[inset_0_-3px_0_var(--od)]"
                    >
                      <Icon name="local_fire_department" size={20} className="text-white" />
                    </motion.div>
                  ) : day.isToday ? (
                    <div className="aspect-square w-full max-w-[38px] rounded-full border-[3px] border-dashed border-o bg-os" />
                  ) : (
                    <div className="aspect-square w-full max-w-[38px] rounded-full bg-sf2" />
                  )}
                </div>
              ))}
            </div>
            {closed ? (
              <div className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-os font-display text-[15px] leading-none font-black text-od">
                <Icon name="verified" />
                Dia fechado! Volte amanhã
              </div>
            ) : (
              <Button variant="orange" onClick={() => closeDay.mutate()} disabled={closeDay.isPending}>
                Fechar o dia <ButtonTag>+15 XP</ButtonTag>
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
