import type { Page, Route } from "@playwright/test";

import type { Reminder, Task } from "@/lib/api/schemas";
import {
  ACCOUNTS,
  ACHIEVEMENTS,
  BOSS,
  BUDGETS,
  CATEGORIES,
  COMPARE,
  GOALS,
  ME,
  MISSIONS,
  RECURRINGS,
  REMINDERS,
  SHOP,
  STREAK,
  SUMMARY,
  TASKS,
  TRANSACTIONS,
  UPCOMING_RECURRINGS,
  HABITS,
  CHALLENGES,
  EVOLUTION,
  OBJECTIVES,
  TIMELINE_YEARS,
} from "./fixtures-data";

export type RecordedCall = { method: string; pathname: string; body: unknown };

/** `{ xp, coins, leveledUp, achievements, me }` — envelope das 8 rotas com recompensa. */
function reward(overrides: Partial<{ xp: number; coins: number; leveledUp: boolean; achievements: unknown[] }> = {}) {
  return {
    xp: overrides.xp ?? 10,
    coins: overrides.coins ?? 2,
    leveledUp: overrides.leveledUp ?? false,
    achievements: overrides.achievements ?? [],
    me: ME,
  };
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: "application/json", body: body === undefined ? "" : JSON.stringify(body) });
}

/**
 * Intercepta toda chamada a `apiUrl` (axios roda no browser, então
 * `page.route` cobre 100% do tráfego — sem precisar de um back de verdade).
 * Respostas seguem exatamente as formas do API_CONTRACT.md: envelope
 * `{ data, reward }` só nas 8 rotas premiadas, payload cru nas demais.
 */
export async function mockApi(page: Page, apiUrl: string): Promise<RecordedCall[]> {
  const calls: RecordedCall[] = [];
  const tasks: Task[] = TASKS.map((t) => ({ ...t }));
  const reminders: Reminder[] = REMINDERS.map((r) => ({ ...r }));
  const habits = HABITS.map((h) => ({ ...h, checks: [...h.checks] }));
  const objectives: Record<string, unknown>[] = OBJECTIVES.map((o) => structuredClone(o));
  const challenges: Record<string, unknown>[] = CHALLENGES.map((c) => structuredClone(c));
  const lifeEvents: Record<string, unknown>[] = [];

  await page.route(`${apiUrl}/**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const pathname = url.pathname;
    let body: unknown = undefined;
    try {
      body = request.postData() ? JSON.parse(request.postData() as string) : undefined;
    } catch {
      body = request.postData();
    }
    calls.push({ method, pathname, body });

    // /me
    if (pathname === "/me" && method === "GET") return json(route, ME);
    if (pathname === "/me" && method === "PATCH") return json(route, { ...ME, ...(body as object) });

    if (pathname === "/categories" && method === "GET") return json(route, CATEGORIES);
    if (pathname === "/accounts" && method === "GET") return json(route, ACCOUNTS);

    if (pathname === "/transactions" && method === "GET") return json(route, TRANSACTIONS);
    if (pathname === "/transactions" && method === "POST") {
      const input = body as { description?: string; type?: string; amountCents?: number; categoryKey?: string; date?: string; accountId?: string };
      const tx = {
        id: "tx-new",
        type: input.type ?? "expense",
        amountCents: input.amountCents ?? 0,
        description: input.description ?? "",
        categoryKey: input.categoryKey ?? "out",
        date: input.date ?? TRANSACTIONS[0].date,
        accountId: input.accountId ?? ACCOUNTS[0].id,
        recurringId: null,
        createdAt: new Date().toISOString(),
      };
      return json(route, { data: tx, reward: reward({ xp: 10, coins: 2 }) });
    }
    if (pathname.match(/^\/transactions\/[^/]+$/) && method === "PATCH") return json(route, { ...TRANSACTIONS[0], ...(body as object) });
    if (pathname.match(/^\/transactions\/[^/]+$/) && method === "DELETE") return json(route, { ok: true });
    if (pathname === "/transactions/summary" && method === "GET") return json(route, SUMMARY);
    if (pathname === "/transactions/parse" && method === "POST") {
      return json(route, { type: "expense", amountCents: 4500, description: "iFood", categoryKey: "ali", date: TRANSACTIONS[0].date });
    }

    if (pathname === "/recurrings" && method === "GET") return json(route, RECURRINGS);
    if (pathname === "/recurrings/upcoming" && method === "GET") return json(route, UPCOMING_RECURRINGS);
    if (pathname.match(/^\/recurrings\/[^/]+\/pay$/) && method === "POST") {
      return json(route, { data: { ...RECURRINGS[0], status: "paid" }, reward: reward({ xp: 10, coins: 0 }) });
    }

    if (pathname === "/budgets" && method === "GET") return json(route, BUDGETS);
    if (pathname === "/budgets" && method === "PUT") return json(route, (body as { items: unknown[] })?.items ?? BUDGETS);

    if (pathname === "/goals" && method === "GET") return json(route, GOALS);
    if (pathname === "/goals" && method === "POST") return json(route, { id: "goal-new", icon: "landscape", currentStep: 0, chestsOpened: [], completed: false, savedCents: 0, steps: 10, deadline: null, ...(body as object) });
    if (pathname.match(/^\/goals\/[^/]+\/deposit$/) && method === "POST") {
      return json(route, { data: { ...GOALS[0], savedCents: GOALS[0].savedCents + ((body as { amountCents?: number })?.amountCents ?? 0) }, reward: reward({ xp: 20, coins: 0 }) });
    }

    if (pathname === "/tasks/bulk-delete" && method === "POST") {
      const ids = (body as { ids: string[] }).ids;
      const before = tasks.length;
      tasks.splice(0, tasks.length, ...tasks.filter((t) => !ids.includes(t.id)));
      return json(route, { deleted: before - tasks.length });
    }
    if (pathname === "/tasks" && method === "GET") return json(route, tasks);
    if (pathname === "/tasks" && method === "POST") {
      const status = (body as { status?: Task["status"] }).status ?? "todo";
      const t: Task = {
        id: `task-${tasks.length + 1}`,
        done: status === "done",
        doneAt: null,
        reminderAt: null,
        position: Math.max(0, ...tasks.filter((x) => x.status === status).map((x) => x.position)) + 1,
        ...(body as object),
        status,
      } as Task;
      tasks.unshift(t);
      return json(route, t);
    }
    if (pathname.match(/^\/tasks\/[^/]+\/complete$/) && method === "POST") {
      const id = pathname.split("/")[2];
      const t = tasks.find((x) => x.id === id);
      if (t) {
        t.done = true;
        t.doneAt = new Date().toISOString();
        t.status = "done";
      }
      return json(route, { data: t ?? tasks[0], reward: reward({ xp: 5, coins: 0 }) });
    }
    if (pathname.match(/^\/tasks\/[^/]+\/uncomplete$/) && method === "POST") {
      const id = pathname.split("/")[2];
      const t = tasks.find((x) => x.id === id);
      if (t) {
        t.done = false;
        t.doneAt = null;
        t.status = "todo";
      }
      return json(route, t ?? tasks[0]);
    }
    if (pathname.match(/^\/tasks\/[^/]+\/move$/) && method === "POST") {
      const id = pathname.split("/")[2];
      const t = tasks.find((x) => x.id === id);
      const { status, position } = body as { status: Task["status"]; position?: number };
      const finishing = !!t && status === "done" && !t.done;
      if (t) {
        t.status = status;
        t.position = position ?? Math.max(0, ...tasks.filter((x) => x.status === status).map((x) => x.position)) + 1;
        t.done = status === "done";
        t.doneAt = t.done ? (t.doneAt ?? new Date().toISOString()) : null;
      }
      return json(route, { data: t ?? tasks[0], reward: finishing ? reward({ xp: 5, coins: 0 }) : null });
    }
    if (pathname.match(/^\/tasks\/[^/]+$/) && method === "PATCH") return json(route, { ...tasks[0], ...(body as object) });
    if (pathname.match(/^\/tasks\/[^/]+$/) && method === "DELETE") return json(route, { ok: true });

    if (pathname === "/habits" && method === "GET") return json(route, habits);
    if (pathname === "/habits" && method === "POST") {
      const h = { id: `hab-${habits.length + 1}`, weekdays: [0, 1, 2, 3, 4, 5, 6], reminderTime: null, checks: [], streak: 0, ...(body as object) };
      habits.push(h as unknown as (typeof habits)[number]);
      return json(route, h);
    }
    const habitCheck = pathname.match(/^\/habits\/([^/]+)\/checks\/(\d{4}-\d{2}-\d{2})$/);
    if (habitCheck && (method === "PUT" || method === "DELETE")) {
      const h = habits.find((x) => x.id === habitCheck[1]);
      if (!h) return json(route, { statusCode: 404, message: "Hábito não encontrado" }, 404);
      h.checks = method === "PUT" ? [...new Set([...h.checks, habitCheck[2]])] : h.checks.filter((d) => d !== habitCheck[2]);
      h.streak = h.checks.length;
      return json(route, h);
    }
    if (pathname.match(/^\/habits\/[^/]+$/) && method === "PATCH") {
      const h = habits.find((x) => x.id === pathname.split("/")[2]);
      Object.assign(h ?? {}, body as object);
      return json(route, h);
    }
    if (pathname.match(/^\/habits\/[^/]+$/) && method === "DELETE") {
      const i = habits.findIndex((x) => x.id === pathname.split("/")[2]);
      const [removed] = habits.splice(i, 1);
      return json(route, removed);
    }
    if (pathname === "/reminders/bulk-delete" && method === "POST") {
      const ids = (body as { ids: string[] }).ids;
      const before = reminders.length;
      reminders.splice(0, reminders.length, ...reminders.filter((r) => !ids.includes(r.id)));
      return json(route, { deleted: before - reminders.length });
    }
    if (pathname === "/reminders" && method === "GET") return json(route, reminders);
    if (pathname === "/reminders/parse" && method === "POST") {
      return json(route, { title: "Pagar o aluguel", kind: "finance", time: "09:00", repeat: "monthly", dayOfMonth: 5, weekday: null, date: null });
    }
    if (pathname === "/reminders" && method === "POST") {
      const r = { id: `rem-${reminders.length + 1}`, enabled: true, ...(body as object) };
      reminders.unshift(r as (typeof reminders)[number]);
      return json(route, r);
    }
    if (pathname.match(/^\/reminders\/[^/]+$/) && method === "PATCH") {
      const id = pathname.split("/")[2];
      const r = reminders.find((x) => x.id === id);
      const merged = { ...(r ?? reminders[0]), ...(body as object) };
      if (r) Object.assign(r, merged);
      return json(route, merged);
    }
    if (pathname.match(/^\/reminders\/[^/]+$/) && method === "DELETE") return json(route, { ok: true });

    if (pathname === "/missions/today" && method === "GET") return json(route, MISSIONS);
    if (pathname.match(/^\/missions\/[^/]+\/claim$/) && method === "POST") {
      const key = pathname.split("/")[2];
      const m = MISSIONS.find((x) => x.key === key) ?? MISSIONS[0];
      return json(route, { data: { ...m, claimed: true }, reward: reward({ xp: m.xp, coins: m.coins }) });
    }

    if (pathname === "/streak" && method === "GET") return json(route, STREAK);
    if (pathname === "/streak/close-day" && method === "POST") {
      return json(route, { data: { ...STREAK, closedToday: true }, reward: reward({ xp: 15, coins: 0 }) });
    }
    if (pathname === "/streak/shield" && method === "POST") return json(route, ME);

    if (pathname === "/boss" && method === "GET") return json(route, BOSS);
    if (pathname === "/boss/attack" && method === "POST") {
      const amount = (body as { amountCents?: number })?.amountCents ?? 30000;
      return json(route, { data: { ...BOSS, hpCents: Math.max(0, BOSS.hpCents - amount) }, reward: reward({ xp: 10, coins: 0 }) });
    }

    if (pathname === "/achievements" && method === "GET") return json(route, ACHIEVEMENTS);
    if (pathname === "/shop" && method === "GET") return json(route, SHOP);
    if (pathname.match(/^\/shop\/[^/]+\/buy$/) && method === "POST") return json(route, ME);
    if (pathname === "/stats/compare" && method === "GET") return json(route, COMPARE);
    if (pathname === "/transactions/evolution" && method === "GET") return json(route, EVOLUTION);

    // Metas (objectives) — só o necessário para as telas.
    if (pathname === "/objectives" && method === "GET") return json(route, objectives);
    if (pathname === "/objectives" && method === "POST") {
      const input = body as { milestones?: string[] } & Record<string, unknown>;
      const { milestones = [], ...rest } = input;
      const o = {
        id: `obj-${objectives.length + 1}`,
        why: null,
        expectedResult: null,
        deadline: null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        progress: 0,
        tasks: [],
        habits: [],
        ...rest,
        milestones: milestones.map((title, i) => ({ id: `ms-${i + 1}`, title, done: false })),
      };
      objectives.push(o);
      return json(route, o);
    }
    const objMilestone = pathname.match(/^\/objectives\/([^/]+)\/milestones(?:\/([^/]+))?$/);
    if (objMilestone) {
      const o = objectives.find((x) => x.id === objMilestone[1]) as { milestones: { id: string; title: string; done: boolean }[] };
      if (method === "POST") o.milestones.push({ id: `ms-${o.milestones.length + 10}`, title: (body as { title: string }).title, done: false });
      if (method === "PATCH") Object.assign(o.milestones.find((m) => m.id === objMilestone[2]) ?? {}, body as object);
      if (method === "DELETE") o.milestones = o.milestones.filter((m) => m.id !== objMilestone[2]);
      return json(route, o);
    }
    if (pathname.match(/^\/objectives\/[^/]+$/) && method === "PATCH") {
      const o = objectives.find((x) => x.id === pathname.split("/")[2]) as Record<string, unknown>;
      const { completed, ...rest } = body as { completed?: boolean };
      Object.assign(o, rest);
      if (completed !== undefined) Object.assign(o, { completed, completedAt: completed ? new Date().toISOString() : null });
      return json(route, o);
    }

    // Desafios
    if (pathname === "/challenges" && method === "GET") return json(route, challenges);
    if (pathname === "/challenges" && method === "POST") {
      const input = body as { durationDays: number; startDate: string } & Record<string, unknown>;
      const c = {
        id: `chl-${challenges.length + 1}`,
        why: null,
        checks: [],
        doneDays: 0,
        missedDays: 0,
        status: "active",
        completedAt: null,
        abandonedAt: null,
        endDate: input.startDate,
        ...input,
      };
      challenges.unshift(c);
      return json(route, c);
    }
    const chlCheck = pathname.match(/^\/challenges\/([^/]+)\/checks\/(\d{4}-\d{2}-\d{2})$/);
    if (chlCheck) {
      const c = challenges.find((x) => x.id === chlCheck[1]) as { checks: string[]; doneDays: number };
      c.checks = method === "PUT" ? [...new Set([...c.checks, chlCheck[2]])] : c.checks.filter((d) => d !== chlCheck[2]);
      c.doneDays = c.checks.length;
      return json(route, c);
    }

    // Linha do tempo
    if (pathname === "/timeline" && method === "GET") return json(route, { events: lifeEvents, years: TIMELINE_YEARS });
    if (pathname === "/timeline/events" && method === "POST") {
      const e = { id: `life-${lifeEvents.length + 1}`, manual: true, description: null, ...(body as object) };
      lifeEvents.unshift(e);
      return json(route, e);
    }

    if (pathname === "/push/subscribe" && (method === "POST" || method === "DELETE")) return json(route, { ok: true });
    if (pathname === "/push/test" && method === "POST") return json(route, { delivered: 1 });

    // Qualquer coisa não coberta: 404 explícito (melhor que deixar a
    // requisição vazar pra rede de verdade e travar o teste).
    return json(route, { statusCode: 404, message: `sem mock para ${method} ${pathname}`, error: "Not Found" }, 404);
  });

  return calls;
}
