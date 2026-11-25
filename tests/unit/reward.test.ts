import { beforeEach, describe, expect, it } from "vitest";

import { unwrapReward } from "@/lib/api/client";
import { meSchema, type Me, type Reward } from "@/lib/api/schemas";
import { getQueryClient } from "@/lib/query-client";
import { handleReward, meQueryKey } from "@/features/rewards/handle-reward";
import { useAppStore } from "@/stores/app-store";

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
  notificationDigestTime: "08:00",
};

function reward(over: Partial<Reward> = {}): Reward {
  return { xp: 10, coins: 2, leveledUp: false, achievements: [], me: { ...baseMe, xp: 1250, coins: 342 }, ...over };
}

describe("handleReward", () => {
  beforeEach(() => {
    useAppStore.setState({ me: baseMe });
  });

  it("ignora reward nulo", () => {
    handleReward(null);
    expect(useAppStore.getState().me).toEqual(baseMe);
  });

  it("só sincroniza o me (store + cache), sem XP na UI", () => {
    handleReward(reward());
    expect(useAppStore.getState().me?.coins).toBe(342);
    expect(getQueryClient().getQueryData(meQueryKey)).toMatchObject({ xp: 1250 });
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
