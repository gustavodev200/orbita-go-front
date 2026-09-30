"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import { CategoryToggleChip } from "@/components/orbita/category-chip";
import { ChoiceChip } from "@/components/orbita/choice-chip";
import { Cobre } from "@/components/orbita/cobre";
import { Icon } from "@/components/orbita/icon";
import { FieldLabel } from "@/components/orbita/panel";
import { SpeechBubble } from "@/components/orbita/speech-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { Reward } from "@/lib/api/schemas";
import { DEFAULT_DISABLED_KEYS } from "@/lib/categories";
import { maskBRLInput, parseBRLToCents } from "@/lib/format";
import { useIsDesktop } from "@/hooks/use-media-query";
import { displayNameFromSession } from "@/features/auth/auth";
import { useSession } from "@/features/auth/use-session";
import { GoalIconPicker } from "@/features/finance/goals-tab";
import { completeOnboarding, meKeys } from "@/features/me/api";
import { useCategories, useMe } from "@/features/me/hooks";
import { handleReward } from "@/features/rewards/handle-reward";
import { useApiMutation } from "@/features/rewards/use-api-mutation";

const RANGES = ["2.000,00", "4.000,00", "6.200,00", "10.000,00"];

function nameSuggestions(full: string | null): string[] {
  if (!full) return [];
  const parts = full.trim().split(/\s+/);
  const first = parts[0];
  const out = [first.slice(0, 4), first, parts.length > 1 ? `${first} ${parts[parts.length - 1]}` : ""];
  return [...new Set(out.filter((s) => s.length >= 2))];
}

/** Onboarding em 4 passos (nome, renda, categorias, meta) + tela final com +50 XP. */
export function OnboardingScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const desktop = useIsDesktop();
  const { session } = useSession();
  const me = useMe(!!session);
  const categories = useCategories();
  const googleName = displayNameFromSession(session);

  const [step, setStep] = useState(0);
  const [name, setName] = useState<string | null>(null);
  const [income, setIncome] = useState("");
  const [off, setOff] = useState<string[]>(DEFAULT_DISABLED_KEYS);
  const [goal, setGoal] = useState("");
  const [goalValue, setGoalValue] = useState("");
  const [goalSaved, setGoalSaved] = useState("");
  const [icon, setIcon] = useState("landscape");
  const [reward, setReward] = useState<Reward | null>(null);

  useEffect(() => {
    if (me.data?.onboarded && step < 4) router.replace("/");
  }, [me.data, step, router]);

  const shownName = name ?? (me.data?.name?.split(" ")[0] || googleName?.split(" ")[0] || "");
  const suggestions = useMemo(() => nameSuggestions(me.data?.name ?? googleName), [me.data?.name, googleName]);
  const expenseCats = categories.filter((c) => c.type === "expense" && c.key !== "out");

  const submit = useApiMutation({
    mutationFn: (skipGoal: boolean) => {
      const targetCents = parseBRLToCents(goalValue);
      const savedCents = parseBRLToCents(goalSaved);
      const incomeCents = parseBRLToCents(income);
      return completeOnboarding({
        name: shownName.trim() || "Você",
        ...(incomeCents > 0 ? { monthlyIncomeCents: incomeCents } : {}),
        categoryKeys: expenseCats.filter((c) => !off.includes(c.key)).map((c) => c.key),
        ...(!skipGoal && goal.trim() && targetCents > 0
          ? { goal: { name: goal.trim(), targetCents, icon, ...(savedCents > 0 ? { savedCents } : {}) } }
          : {}),
      });
    },
    onSuccess: (res) => {
      // `me` já com onboarded=true para o shell não mandar de volta pra cá.
      qc.setQueryData(meKeys.me, res.data);
      setReward(res.reward);
      setStep(4);
    },
  });

  const done = step >= 4;
  const says = [
    "Oi! Eu sou o Cobre, sua moedinha de estimação. Como quer ser chamado?",
    `Prazer, ${shownName || "você"}! Quanto entra por mês, mais ou menos? Pode pular se preferir.`,
    "Onde vai a maior parte da grana? Já marquei as mais comuns.",
    "Agora a parte legal: qual é o seu primeiro sonho?",
  ];

  const next = () => {
    if (done) {
      router.replace("/");
      handleReward(reward, `Bem-vindo(a) ao órbitaGO, ${shownName}!`);
      return;
    }
    if (step === 0 && !shownName.trim()) return;
    if (step === 3) {
      submit.mutate(false);
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <main className="flex min-h-dvh flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-[760px] shrink-0 items-center gap-3.5 px-5 py-[18px]">
        <button
          type="button"
          aria-label="Voltar"
          disabled={step === 0 || done}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="flex size-10 items-center justify-center bg-transparent text-mut disabled:opacity-40"
        >
          <Icon name={step === 0 ? "close" : "arrow_back"} size={28} />
        </button>
        <Progress value={(Math.min(step, 4) / 4) * 100} size="lg" className="flex-1" kind="bar" indicatorClassName="shadow-[inset_0_-4px_0_rgba(0,0,0,.12),inset_0_4px_0_rgba(255,255,255,.3)]" />
        <div className="min-w-[34px] text-right font-display text-sm leading-none font-black text-mut">{done ? "" : `${step + 1}/4`}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 pt-3 pb-5">
        <div className="mx-auto flex max-w-[620px] flex-col gap-[22px]">
          {!done ? (
            <div className="flex items-end gap-3">
              <Cobre mood={step === 1 ? "preocupado" : "feliz"} size={desktop ? 120 : 92} />
              <SpeechBubble tail="left" raised className="mb-4 flex-1 px-4 py-3.5 font-display text-[17px] leading-[1.3] font-extrabold lg:text-xl">
                {says[step]}
              </SpeechBubble>
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={done ? { opacity: 0, scale: 0.6 } : { opacity: 0, x: 24 }}
              animate={done ? { opacity: 1, scale: [0.6, 1.08, 1] } : { opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: done ? 0.5 : 0.3 }}
            >
              {step === 0 ? (
                <div className="flex flex-col gap-3">
                  <Input
                    size="hero"
                    tone="raised"
                    autoFocus
                    value={shownName}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    aria-label="Seu nome ou apelido"
                    className="font-display text-xl font-extrabold"
                  />
                  {suggestions.length ? (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <ChoiceChip key={s} variant="plain" className="h-[38px]" onClick={() => setName(s)}>
                          {s}
                        </ChoiceChip>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex h-[72px] items-center gap-2 rounded-[18px] border-2 border-b-4 border-bd bg-sf px-5">
                    <span className="num text-[26px] leading-none font-extrabold text-mut">R$</span>
                    <input
                      value={income}
                      onChange={(e) => setIncome(maskBRLInput(e.target.value))}
                      placeholder="0,00"
                      inputMode="numeric"
                      aria-label="Renda mensal"
                      className="num min-w-0 flex-1 bg-transparent text-[34px] leading-none font-extrabold text-b outline-none placeholder:text-mut/60"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RANGES.map((r) => (
                      <ChoiceChip key={r} variant="plain" onClick={() => setIncome(r)}>
                        R$ {r}
                      </ChoiceChip>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] leading-[1.4] font-semibold text-mut">
                    <Icon name="lock" size={18} />
                    Fica só com você. Uso para calcular metas e orçamentos.
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
                  {expenseCats.map((c) => {
                    const on = !off.includes(c.key);
                    return (
                      <CategoryToggleChip
                        key={c.key}
                        name={c.name}
                        icon={c.icon}
                        color={c.color}
                        on={on}
                        showCheck
                        onToggle={() => setOff((o) => (on ? [...o, c.key] : o.filter((k) => k !== c.key)))}
                      />
                    );
                  })}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="flex flex-col gap-3">
                  <Input
                    size="hero"
                    tone="raised"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Nome da meta"
                    aria-label="Nome da meta"
                    className="font-display text-lg font-extrabold"
                  />
                  <Input
                    size="hero"
                    tone="raised"
                    inputMode="numeric"
                    icon={<span className="num text-xl font-extrabold text-mut">R$</span>}
                    value={goalValue}
                    onChange={(e) => setGoalValue(maskBRLInput(e.target.value))}
                    placeholder="0,00"
                    aria-label="Valor da meta"
                    className="num text-2xl font-extrabold text-g"
                  />
                  <FieldLabel className="mt-1 mb-0">Ícone</FieldLabel>
                  <GoalIconPicker value={icon} onChange={setIcon} />
                  <FieldLabel className="mt-1 mb-0">Já tenho guardado (opcional)</FieldLabel>
                  <Input
                    size="hero"
                    tone="raised"
                    inputMode="numeric"
                    icon={<span className="num text-xl font-extrabold text-mut">R$</span>}
                    value={goalSaved}
                    onChange={(e) => setGoalSaved(maskBRLInput(e.target.value))}
                    placeholder="0,00"
                    aria-label="Valor já guardado"
                    className="num text-2xl font-extrabold"
                  />
                  {parseBRLToCents(goalSaved) > parseBRLToCents(goalValue) ? (
                    <div className="text-[13px] leading-[1.3] font-semibold text-r">Não pode passar do valor da meta.</div>
                  ) : null}
                </div>
              ) : null}

              {done ? (
                <div className="flex flex-col items-center gap-3.5 pt-2.5 text-center">
                  <Cobre mood="comemorando" size={170} />
                  <div className="font-display text-[40px] leading-[1.05] font-black text-g">Você ganhou {reward?.xp ?? 50} XP!</div>
                  <div className="max-w-[380px] text-base leading-[1.45] font-semibold text-mut">
                    Tudo pronto, {shownName || "você"}. Sua órbita começou a girar.
                  </div>
                  <div className="flex items-center gap-3.5 rounded-[20px] border-2 border-b-[5px] border-[color:var(--y)] bg-ys px-[18px] py-3.5 text-left">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#FF8A1E] shadow-[inset_0_-5px_0_#D96A00]">
                      <Icon name={reward?.achievements[0]?.icon ?? "flag"} size={30} className="text-white" />
                    </div>
                    <div>
                      <div className="font-display text-[11px] leading-none font-black tracking-[.12em] text-yd uppercase">Primeira conquista</div>
                      <div className="mt-1 font-display text-lg leading-[1.2] font-black">{reward?.achievements[0]?.title ?? "Primeiro passo"}</div>
                      <div className="text-[13px] leading-[1.3] font-semibold text-mut">
                        {reward?.achievements[0]?.description ?? "Configurou sua órbita"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 border-t-2 border-bd px-5 pt-4 pb-5">
        <div className="mx-auto flex max-w-[620px] gap-2.5">
          {step === 1 ? (
            <Button
              variant="secondary"
              size="lg"
              className="px-5 text-[15px] text-mut"
              onClick={() => {
                setIncome("");
                setStep(2);
              }}
            >
              Pular
            </Button>
          ) : null}
          {step === 3 ? (
            <Button
              variant="secondary"
              size="lg"
              className="px-5 text-[15px] text-mut"
              disabled={submit.isPending}
              onClick={() => submit.mutate(true)}
            >
              Pular
            </Button>
          ) : null}
          <Button
            size="lg"
            className="flex-1 tracking-[.06em]"
            onClick={next}
            disabled={
              submit.isPending ||
              (step === 0 && !shownName.trim()) ||
              (step === 3 && parseBRLToCents(goalSaved) > parseBRLToCents(goalValue))
            }
          >
            {done ? "Começar" : step === 3 ? (goal.trim() ? "Criar meta" : "Concluir") : "Continuar"}
          </Button>
        </div>
      </div>
    </main>
  );
}
