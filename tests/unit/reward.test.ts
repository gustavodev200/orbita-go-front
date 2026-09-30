import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { unwrapReward } from "@/lib/api/client";
import { meSchema, type Me, type Reward } from "@/lib/api/schemas";
import { getQueryClient } from "@/lib/query-client";
import { ACHIEVEMENT_DELAY, LEVEL_UP_DELAY, handleReward, meQueryKey } from "@/features/rewards/handle-reward";
import { TOAST_DURATION, useAppStore } from "@/stores/app-store";

const baseMe: Me = {
  id: "u1",
  email: "marina@example.com",
  name: "Marina Alves",
  avatarUrl: null,
  onboarded: true,
  level: 7,
  xp: 1240,
  xpToNext: 1500,
  coins: 340,
  streak: 12,
  streakRecord: 21,
  shields: 0,
  theme: "system",
  monthlyIncomeCents: 620000,
  ownedItems: [],
  enabledCategoryKeys: ["ali"],
  notificationsEnabled: true,
};

function reward(over: Partial<Reward> = {}): Reward {
  return { xp: 10, coins: 2, leveledUp: false, achievements: [], me: { ...baseMe, xp: 1250, coins: 342 }, ...over };
}

describe("handleReward", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({ me: baseMe, toast: null, modal: null, modalQueue: [] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ignora reward nulo", () => {
    handleReward(null, "nada");
    expect(useAppStore.getState().toast).toBeNull();
    expect(useAppStore.getState().me).toEqual(baseMe);
  });

  it("substitui o me (store + cache) e mostra o toast de XP", () => {
    handleReward(reward(), "Lançamento salvo: iFood");
    const s = useAppStore.getState();
    expect(s.me?.xp).toBe(1250);
    expect(s.me?.coins).toBe(342);
    expect(getQueryClient().getQueryData(meQueryKey)).toMatchObject({ xp: 1250 });
    expect(s.toast).toMatchObject({ xp: 10, coins: 2, message: "Lançamento salvo: iFood" });

    vi.advanceTimersByTime(TOAST_DURATION);
    expect(useAppStore.getState().toast).toBeNull();
  });

  it("abre o modal de nível 1,3s depois do toast", () => {
    handleReward(reward({ xp: 300, leveledUp: true, me: { ...baseMe, level: 8, xp: 40 } }));
    expect(useAppStore.getState().modal).toBeNull();
    vi.advanceTimersByTime(LEVEL_UP_DELAY - 1);
    expect(useAppStore.getState().modal).toBeNull();
    vi.advanceTimersByTime(1);
    expect(useAppStore.getState().modal).toEqual({ kind: "nivel", level: 8 });
  });

  it("enfileira conquistas depois do nível", () => {
    const achievement = { key: "primeiro-passo", title: "Primeiro passo", description: "Configurou sua órbita", icon: "flag" };
    handleReward(reward({ leveledUp: true, achievements: [achievement], me: { ...baseMe, level: 8 } }));
    vi.advanceTimersByTime(LEVEL_UP_DELAY);
    const s = useAppStore.getState();
    expect(s.modal?.kind).toBe("nivel");
    expect(s.modalQueue).toEqual([{ kind: "conquista", achievement }]);
    s.closeModal();
    expect(useAppStore.getState().modal).toEqual({ kind: "conquista", achievement });
  });

  it("conquista sem level-up abre após o delay curto", () => {
    const achievement = { key: "cofrinho", title: "Cofrinho", description: "Guardou na 1ª meta", icon: "savings" };
    handleReward(reward({ achievements: [achievement] }));
    vi.advanceTimersByTime(ACHIEVEMENT_DELAY);
    expect(useAppStore.getState().modal).toEqual({ kind: "conquista", achievement });
  });

  it("não mostra toast quando não houve XP nem moedas", () => {
    handleReward(reward({ xp: 0, coins: 0 }));
    expect(useAppStore.getState().toast).toBeNull();
  });
});

describe("unwrapReward", () => {
  it("lê envelope { data, reward }", () => {
    const r = reward();
    const out = unwrapReward(meSchema, { data: baseMe, reward: r });
    expect(out.data.id).toBe("u1");
    expect(out.reward?.xp).toBe(10);
  });

  it("aceita reward null e payload cru", () => {
    expect(unwrapReward(meSchema, { data: baseMe, reward: null }).reward).toBeNull();
    expect(unwrapReward(meSchema, baseMe)).toEqual({ data: meSchema.parse(baseMe), reward: null });
  });
});
