"use client";

import { useState } from "react";

import { HpBar, hpTone } from "@/components/orbita/bars";
import { Cobre } from "@/components/orbita/cobre";
import { Icon } from "@/components/orbita/icon";
import { IconTile } from "@/components/orbita/icon-tile";
import { PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Budget } from "@/lib/api/schemas";
import { findCategory } from "@/lib/categories";
import { currentMonth, monthProgressPct } from "@/lib/dates";
import { formatBRL, maskBRLInput, parseBRLToCents } from "@/lib/format";
import { useCategories } from "@/features/me/hooks";
import { useBudgets, usePutBudgets } from "@/features/finance/hooks";
import { useAppStore } from "@/stores/app-store";

function BudgetCard({ b }: { b: Budget }) {
  const categories = useCategories();
  const cat = findCategory(categories, b.categoryKey);
  const hp = b.limitCents > 0 ? Math.max(0, Math.round((1 - b.spentCents / b.limitCents) * 100)) : 0;
  const tone = hpTone(hp);
  return (
    <Card radius="lg" padding="none" tone={tone.low ? "danger" : "default"} className="flex flex-col gap-3.5 p-[18px]">
      <div className="flex items-center gap-3">
        <IconTile icon={cat.icon} color={cat.color} size={48} radius={15} iconSize={26} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[17px] leading-[1.2] font-black">{cat.name}</div>
          <div className="num mt-0.5 text-[13px] leading-[1.3] font-semibold text-mut">
            {formatBRL(b.spentCents)} de {formatBRL(b.limitCents)}
          </div>
        </div>
        {tone.low ? <Cobre mood="preocupado" size={46} /> : null}
      </div>
      <HpBar value={hp} trailing={`resta ${formatBRL(Math.max(0, b.limitCents - b.spentCents))}`} />
    </Card>
  );
}

/** Dialog "Ajustar limites": um campo por categoria de saída habilitada. */
function AdjustLimitsDialog({ open, onOpenChange, budgets }: { open: boolean; onOpenChange: (o: boolean) => void; budgets: Budget[] }) {
  const categories = useCategories();
  const enabled = useAppStore((s) => s.me?.enabledCategoryKeys);
  const expense = categories.filter((c) => c.type === "expense" && (!enabled?.length || enabled.includes(c.key)));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(budgets.map((b) => [b.categoryKey, maskBRLInput(String(b.limitCents))])),
  );
  const save = usePutBudgets(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Ajustar limites">
      <PanelHeader title="Ajustar limites" onClose={() => onOpenChange(false)} />
      <PanelBody>
        <p className="m-0 text-[13px] leading-[1.4] font-semibold text-mut">
          Dê uma barra de vida para cada categoria. Deixe em branco para ficar sem limite.
        </p>
        {expense.map((c) => (
          <div key={c.key} className="flex items-center gap-3">
            <IconTile icon={c.icon} color={c.color} size={40} radius={13} iconSize={22} />
            <div className="flex-1 font-display text-[15px] font-extrabold">{c.name}</div>
            <Input
              containerClassName="w-40"
              inputMode="numeric"
              aria-label={`Limite de ${c.name}`}
              placeholder="0,00"
              icon={<span className="num text-sm font-extrabold text-mut">R$</span>}
              value={values[c.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [c.key]: maskBRLInput(e.target.value) }))}
              className="num text-right font-extrabold"
            />
          </div>
        ))}
      </PanelBody>
      <PanelFooter>
        <Button
          size="lg"
          block
          disabled={save.isPending}
          onClick={() =>
            save.mutate(
              Object.entries(values)
                .map(([categoryKey, v]) => ({ categoryKey, limitCents: parseBRLToCents(v) }))
                .filter((i) => i.limitCents > 0),
            )
          }
        >
          Salvar limites
        </Button>
      </PanelFooter>
    </Dialog>
  );
}

/** Orçamento: HP = % do limite que resta (>50 verde, >20 amarelo, ≤20 vermelho). */
export function BudgetsTab() {
  const month = currentMonth();
  const budgets = useBudgets(month);
  const [adjusting, setAdjusting] = useState(false);
  const list = (budgets.data ?? []).filter((b) => b.limitCents > 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-xl leading-[1.2] font-black">Vida das categorias</div>
          <div className="mt-0.5 text-[13px] leading-[1.4] font-semibold text-mut">
            O mês está {monthProgressPct(month)}% andado. A barra é o que ainda resta de cada limite.
          </div>
        </div>
        <Button variant="secondary" className="h-11 rounded-[14px] px-4 text-sm text-b" onClick={() => setAdjusting(true)}>
          <Icon name="tune" size={20} />
          Ajustar limites
        </Button>
      </div>
      <QueryState
        query={budgets}
        rows={4}
        isEmpty={list.length === 0}
        frame={(node) => (
          <Card radius="lg" padding="lg">
            {node}
          </Card>
        )}
        empty={
          <EmptyState
            mood="feliz"
            title="Sem limites definidos"
            text="Dê uma barra de vida para cada categoria e veja quem aguenta até o fim do mês."
            ctaLabel="Definir limites"
            onCta={() => setAdjusting(true)}
          />
        }
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3.5">
          {list.map((b) => (
            <BudgetCard key={b.categoryKey} b={b} />
          ))}
        </div>
      </QueryState>
      {adjusting ? <AdjustLimitsDialog open={adjusting} onOpenChange={setAdjusting} budgets={budgets.data ?? []} /> : null}
    </>
  );
}
