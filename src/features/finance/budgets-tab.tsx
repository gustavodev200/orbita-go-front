"use client";

import { useState } from "react";

import { Icon } from "@/components/orbita/icon";
import { IconTile } from "@/components/orbita/icon-tile";
import { PanelBody, PanelFooter, PanelHeader } from "@/components/orbita/panel";
import { EmptyState, QueryState } from "@/components/orbita/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Budget } from "@/lib/api/schemas";
import { findCategory } from "@/lib/categories";
import { softOf } from "@/lib/colors";
import { currentMonth, monthProgressPct } from "@/lib/dates";
import { formatBRL, maskBRLInput, parseBRLToCents } from "@/lib/format";
import { useCategories } from "@/features/me/hooks";
import { useBudgets, usePutBudgets } from "@/features/finance/hooks";
import { useAppStore } from "@/stores/app-store";

function BudgetCard({ b }: { b: Budget }) {
  const categories = useCategories();
  const cat = findCategory(categories, b.categoryKey);
  const used = b.limitCents > 0 ? Math.round((b.spentCents / b.limitCents) * 100) : 0;
  const tone = used >= 100 ? "r" : used >= 80 ? "y" : "ok";
  const left = b.limitCents - b.spentCents;
  return (
    <Card padding="none" className="flex flex-col gap-3.5 p-5">
      <div className="flex items-center gap-3">
        <IconTile icon={cat.icon} color={cat.color} soft={softOf(cat.color)} variant="soft" size={44} />
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-[1.2] font-semibold">{cat.name}</div>
          <div className="num mt-1 text-[13px] leading-none text-mut">
            {formatBRL(b.spentCents)} de {formatBRL(b.limitCents)}
          </div>
        </div>
        <span className="num text-sm font-medium" style={{ color: `var(--${tone === "ok" ? "okd" : tone === "y" ? "yd" : "rd"})` }}>
          {used}%
        </span>
      </div>
      <Progress value={used} tone={tone} size="sm" aria-label={`${used}% do limite usado`} />
      <div className="text-xs leading-none text-mut">
        {left >= 0 ? `Restam ${formatBRL(left)}` : `Passou ${formatBRL(-left)} do limite`}
      </div>
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
          Defina quanto quer gastar por categoria no mês. Deixe em branco para ficar sem limite.
        </p>
        {expense.map((c) => (
          <div key={c.key} className="flex items-center gap-3">
            <IconTile icon={c.icon} color={c.color} soft={softOf(c.color)} variant="soft" size={40} />
            <div className="flex-1 font-display text-[15px] font-semibold">{c.name}</div>
            <Input
              containerClassName="w-40"
              inputMode="numeric"
              aria-label={`Limite de ${c.name}`}
              placeholder="0,00"
              icon={<span className="num text-sm font-semibold text-mut">R$</span>}
              value={values[c.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [c.key]: maskBRLInput(e.target.value) }))}
              className="num text-right font-semibold"
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

/** Orçamento: % do limite usado (verde < 80%, amarelo até 100%, vermelho acima). */
export function BudgetsTab() {
  const month = currentMonth();
  const budgets = useBudgets(month);
  const [adjusting, setAdjusting] = useState(false);
  const list = (budgets.data ?? []).filter((b) => b.limitCents > 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg leading-[1.2] font-semibold">Orçamento do mês</div>
          <div className="mt-0.5 text-[13px] leading-[1.4] font-semibold text-mut">
            O mês está {monthProgressPct(month)}% andado.
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setAdjusting(true)}>
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
            icon="donut_large"
            title="Sem limites definidos"
            text="Defina um limite por categoria e acompanhe quanto já gastou no mês."
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
