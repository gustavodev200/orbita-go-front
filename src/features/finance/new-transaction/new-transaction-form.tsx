"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { AmountDisplay } from "@/components/orbita/amount-display";
import { CategoryGridButton } from "@/components/orbita/category-chip";
import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Cobre } from "@/components/orbita/cobre";
import { Icon } from "@/components/orbita/icon";
import { NumericKeypad, applyKey, type KeypadKey } from "@/components/orbita/numeric-keypad";
import { SegmentedControl } from "@/components/orbita/segmented-control";
import { Button, ButtonTag } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Category, Frequency, ParsedTx, Transaction, TxType } from "@/lib/api/schemas";
import { EXPENSE_GRID, INCOME_GRID, findCategory } from "@/lib/categories";
import { addDaysISO, diffDays, formatDM, parseDMY, parseISODate, todayISO } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreateTransaction, useParseTransaction, useUpdateTransaction } from "@/features/finance/hooks";
import { useAccounts, useCategories } from "@/features/me/hooks";

type DateMode = "hoje" | "ontem" | "esc";

const FREQS: { value: Frequency; label: string }[] = [
  { value: "monthly", label: "Mensal" },
  { value: "weekly", label: "Semanal" },
  { value: "yearly", label: "Anual" },
];

/** Semanal: `dueDay` é o dia da semana (0 = domingo). */
const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function dateModeFor(iso: string, today: string): DateMode {
  const d = diffDays(iso, today);
  return d === 0 ? "hoje" : d === 1 ? "ontem" : "esc";
}

function dateChipLabel(iso: string, today: string) {
  const d = diffDays(iso, today);
  if (d === 0) return `Hoje, ${formatDM(iso)}`;
  if (d === 1) return `Ontem, ${formatDM(iso)}`;
  return formatDM(iso);
}

function parseISODateDay(iso: string) {
  return parseISODate(iso).getUTCDay();
}

function maskDMY(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join("/");
}

export function NewTransactionForm({
  desktop,
  editing,
  startRecurring,
  title,
  onClose,
}: {
  desktop: boolean;
  editing?: Transaction;
  startRecurring?: boolean;
  title: string;
  onClose: () => void;
}) {
  const today = todayISO();
  const categories = useCategories();
  const accounts = useAccounts();

  const [type, setType] = useState<TxType>(editing?.type ?? "expense");
  const [cents, setCents] = useState(editing?.amountCents ?? 0);
  const [categoryKey, setCategoryKey] = useState(editing?.categoryKey ?? "");
  const [desc, setDesc] = useState(editing?.description ?? "");
  const [date, setDate] = useState(editing?.date?.slice(0, 10) ?? today);
  const [dateMode, setDateMode] = useState<DateMode>(editing ? dateModeFor(editing.date, today) : "hoje");
  const [accountId, setAccountId] = useState(editing?.accountId ?? "");
  const [recurring, setRecurring] = useState(!!startRecurring);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [dueDay, setDueDay] = useState(Number(today.slice(8, 10)) || 5);
  const [endDate, setEndDate] = useState("");
  const [nl, setNl] = useState("");
  const [ai, setAi] = useState<ParsedTx | null>(null);

  const parse = useParseTransaction();
  const create = useCreateTransaction(onClose);
  const update = useUpdateTransaction(onClose);
  const saving = create.isPending || update.isPending;

  const grid = useMemo(() => {
    const keys = type === "expense" ? EXPENSE_GRID : INCOME_GRID;
    const ordered = keys.map((k) => categories.find((c) => c.key === k)).filter((c): c is Category => !!c);
    const byType = categories.filter((c) => c.type === type);
    return ordered.length >= Math.min(4, byType.length) && ordered.length ? ordered : byType.slice(0, type === "expense" ? 8 : 4);
  }, [categories, type]);

  const selectedKey = categoryKey && grid.some((c) => c.key === categoryKey) ? categoryKey : (grid[0]?.key ?? "");
  const accountList = accounts.data ?? [];
  const selectedAccount = accountId || accountList[0]?.id || "";

  // Desktop: teclas numéricas do teclado físico alimentam o valor.
  useEffect(() => {
    if (!desktop) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (/^\d$/.test(e.key)) setCents((c) => applyKey(c, e.key as KeypadKey));
      else if (e.key === "Backspace") setCents((c) => applyKey(c, "del"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [desktop]);

  const runParse = () => {
    const text = nl.trim();
    if (!text) return;
    parse.mutate(text, { onSuccess: (r) => setAi(r) });
  };

  const applyAi = () => {
    if (!ai) return;
    setType(ai.type);
    setCents(ai.amountCents);
    setCategoryKey(ai.categoryKey);
    setDesc(ai.description);
    const iso = ai.date.slice(0, 10);
    setDate(iso);
    setDateMode(dateModeFor(iso, today));
    setAi(null);
  };

  const pickDate = (mode: DateMode) => {
    setDateMode(mode);
    if (mode === "hoje") setDate(today);
    if (mode === "ontem") setDate(addDaysISO(today, -1));
  };

  const save = () => {
    if (cents <= 0) {
      toast.error("Digite um valor para o lançamento.");
      return;
    }
    if (!selectedAccount) {
      toast.error("Nenhuma conta disponível ainda. Tente de novo em instantes.");
      return;
    }
    const cat = findCategory(categories, selectedKey);
    const input = {
      type,
      amountCents: cents,
      description: desc.trim() || cat.name,
      categoryKey: selectedKey,
      date,
      accountId: selectedAccount,
    };
    if (editing) {
      update.mutate({ id: editing.id, input });
      return;
    }
    const end = endDate ? parseDMY(endDate) : null;
    create.mutate({
      ...input,
      recurring: recurring ? { frequency, dueDay, ...(end ? { endDate: end } : {}) } : undefined,
    });
  };

  const weekly = frequency === "weekly";
  const aiCat = ai ? findCategory(categories, ai.categoryKey) : null;

  return (
    <>
      <div className="flex shrink-0 items-center gap-2.5 px-4 pt-3.5 pb-2.5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex size-10 items-center justify-center rounded-xl bg-transparent text-mut hover:text-ink"
        >
          <Icon name="close" size={28} />
        </button>
        <div className="flex-1 text-center font-display text-lg leading-none font-black">{title}</div>
        <div className="w-10" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-auto px-4 pt-1 pb-4">
        {!editing ? (
          <Input
            tone="ai"
            size="lg"
            containerClassName="pr-1.5 pl-3.5"
            icon={<Icon name="auto_awesome" className="text-p" />}
            value={nl}
            onChange={(e) => setNl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runParse()}
            placeholder="Digite como fala ✨  ex.: gastei 45 no ifood ontem"
            aria-label="Digite como fala"
            trailing={
              <Button variant="ai" size="sm" className="h-10 px-3 text-xs [--press:3px]" onClick={runParse} disabled={parse.isPending}>
                {parse.isPending ? "…" : "Ler"}
              </Button>
            }
          />
        ) : null}

        <AnimatePresence initial={false}>
          {ai && aiCat ? (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-2.5 rounded-2xl border-2 border-dashed border-p bg-sf p-3"
            >
              <div className="flex items-center gap-2">
                <Cobre mood="feliz" size={32} />
                <div className="font-display text-sm leading-[1.3] font-extrabold">Entendi assim, confere?</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { icon: ai.type === "expense" ? "north_east" : "south_west", v: ai.type === "expense" ? "Saída" : "Entrada" },
                  { icon: "payments", v: formatBRL(ai.amountCents) },
                  { icon: "sell", v: `${ai.description} · ${aiCat.name}` },
                  { icon: "event", v: dateChipLabel(ai.date.slice(0, 10), today) },
                ].map((c) => (
                  <div key={c.icon} className="flex items-center gap-1 rounded-[10px] bg-sf2 px-2.5 py-1.5 text-[13px] leading-none font-extrabold">
                    <Icon name={c.icon} size={16} className="text-p" />
                    {c.v}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-[42px] flex-1" onClick={applyAi}>
                  Confirmar
                </Button>
                <button
                  type="button"
                  onClick={() => setAi(null)}
                  className="h-[42px] rounded-xl border-2 border-bd bg-sf px-3.5 font-display text-[13px] leading-none font-black text-mut uppercase"
                >
                  Ajustar
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <SegmentedControl<TxType>
          variant="solid"
          ariaLabel="Tipo do lançamento"
          value={type}
          onChange={(t) => {
            setType(t);
            setCategoryKey("");
          }}
          options={[
            { value: "expense", label: "Saída", icon: "north_east", color: "var(--r)", shadow: "var(--rd)" },
            { value: "income", label: "Entrada", icon: "south_west", color: "var(--b)", shadow: "var(--bdk)" },
          ]}
        />

        <div className="pt-2.5 pb-1 text-center">
          <AmountDisplay cents={cents} type={type} size="hero" zeroMuted />
          {desktop ? <div className="mt-2 text-xs leading-none font-semibold text-mut">digite o valor pelo teclado</div> : null}
        </div>

        <div>
          <div className="mb-2 font-display text-[13px] leading-none font-black tracking-[.08em] text-mut uppercase">Categoria</div>
          <div className="grid grid-cols-4 gap-2">
            {grid.map((c) => (
              <CategoryGridButton
                key={c.key}
                name={c.name}
                icon={c.icon}
                color={c.color}
                selected={c.key === selectedKey}
                onSelect={() => setCategoryKey(c.key)}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          <Input
            icon={<Icon name="notes" className="text-mut" />}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição"
            aria-label="Descrição"
          />
          <div className="flex gap-1.5">
            {(["hoje", "ontem", "esc"] as const).map((m) => (
              <ChoiceChip key={m} size="md" className="flex-1" selected={dateMode === m} onClick={() => pickDate(m)}>
                {m === "hoje" ? "Hoje" : m === "ontem" ? "Ontem" : "Escolher"}
              </ChoiceChip>
            ))}
          </div>
        </div>
        {dateMode === "esc" ? (
          <Input
            type="date"
            aria-label="Data do lançamento"
            value={date}
            max={today}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            icon={<Icon name="event" className="text-mut" />}
          />
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {accountList.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={a.id === selectedAccount}
              onClick={() => setAccountId(a.id)}
              className={cn(
                "flex h-10 items-center gap-1.5 rounded-xl border-2 bg-sf px-3 font-display text-[13px] leading-none font-extrabold text-ink",
                a.id === selectedAccount ? "border-ink" : "border-bd",
              )}
            >
              <span className="size-3.5 rounded-[5px]" style={{ background: a.color }} />
              {a.name}
            </button>
          ))}
        </div>

        {!editing ? (
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-bd bg-sf px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <Icon name="event_repeat" className="text-p" />
              <div className="flex-1">
                <div className="font-display text-[15px] leading-[1.2] font-extrabold">Recorrente</div>
                <div className="text-xs leading-[1.2] font-semibold text-mut">Eu lanço e te lembro sozinho</div>
              </div>
              <Switch checked={recurring} onCheckedChange={setRecurring} aria-label="Recorrente" />
            </div>
            <AnimatePresence initial={false}>
              {recurring ? (
                <motion.div
                  key="rec"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-2.5"
                >
                  <div className="grid grid-cols-3 gap-1.5">
                    {FREQS.map((f) => (
                      <ChoiceChip
                        key={f.value}
                        size="sm13"
                        selected={frequency === f.value}
                        onClick={() => {
                          setFrequency(f.value);
                          if (f.value === "weekly") setDueDay(parseISODateDay(today));
                          else if (weekly) setDueDay(Number(today.slice(8, 10)));
                        }}
                      >
                        {f.label}
                      </ChoiceChip>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex h-12 items-center justify-between rounded-xl bg-sf2 pr-1.5 pl-3">
                      <div>
                        <div className="text-[11px] leading-none font-bold text-mut">{weekly ? "Vence toda" : "Vence dia"}</div>
                        <div className="mt-[3px] font-display text-[17px] leading-none font-black">
                          {weekly ? WEEKDAYS[dueDay % 7] : dueDay}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="Dia anterior"
                          onClick={() => setDueDay((d) => (weekly ? (d + 6) % 7 : d <= 1 ? 31 : d - 1))}
                          className="size-[30px] rounded-[9px] bg-sf font-display text-base leading-none font-black text-ink"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          aria-label="Próximo dia"
                          onClick={() => setDueDay((d) => (weekly ? (d + 1) % 7 : (d % 31) + 1))}
                          className="size-[30px] rounded-[9px] bg-sf font-display text-base leading-none font-black text-ink"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <label className="flex h-12 flex-col justify-center rounded-xl bg-sf2 px-3">
                      <span className="text-[11px] leading-none font-bold text-mut">Termina em (opcional)</span>
                      <input
                        value={endDate}
                        onChange={(e) => setEndDate(maskDMY(e.target.value))}
                        placeholder="dd/mm/aaaa"
                        inputMode="numeric"
                        className="mt-1 w-full bg-transparent font-display text-[15px] leading-none font-extrabold text-ink outline-none placeholder:text-mut"
                      />
                    </label>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>

      {!desktop ? <NumericKeypad onKey={(k) => setCents((c) => applyKey(c, k))} /> : null}
      <div className={cn("shrink-0 px-4 pt-3 pb-4", desktop ? "bg-bg" : "bg-sf2")}>
        <Button size="lg" block className="gap-2.5" onClick={save} disabled={saving}>
          {editing ? "Salvar alterações" : "Salvar lançamento"}
          {!editing ? <ButtonTag>+10 XP</ButtonTag> : null}
        </Button>
      </div>
    </>
  );
}
