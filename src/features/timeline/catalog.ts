import type { LifeEventKind, TimelineEvent } from "@/lib/api/schemas";

export const KIND_META: Record<TimelineEvent["kind"], { label: string; color: string; soft: string }> = {
  achievement: { label: "Conquista", color: "var(--y)", soft: "var(--ys)" },
  project: { label: "Projeto concluído", color: "var(--p)", soft: "var(--ps)" },
  milestone: { label: "Marco da vida", color: "var(--b)", soft: "var(--bs)" },
  objective: { label: "Meta alcançada", color: "var(--g)", soft: "var(--gs)" },
  savings: { label: "Meta de economia", color: "var(--ok)", soft: "var(--oks)" },
  challenge: { label: "Desafio concluído", color: "var(--o)", soft: "var(--os)" },
};

export const LIFE_KINDS: { value: LifeEventKind; label: string; icon: string }[] = [
  { value: "achievement", label: "Conquista", icon: "emoji_events" },
  { value: "project", label: "Projeto", icon: "rocket_launch" },
  { value: "milestone", label: "Marco", icon: "cake" },
];

export const LIFE_ICONS = ["emoji_events", "rocket_launch", "school", "work", "home", "favorite", "flight", "cake", "child_care", "directions_car"] as const;

/** Agrupa por ano (desc), mantendo a ordem cronológica decrescente dentro do ano. */
export function groupByYear(events: TimelineEvent[]): [string, TimelineEvent[]][] {
  const map = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const y = e.date.slice(0, 4);
    map.set(y, [...(map.get(y) ?? []), e]);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}
