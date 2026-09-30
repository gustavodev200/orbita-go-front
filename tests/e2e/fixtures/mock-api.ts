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

    if (pathname === "/tasks" && method === "GET") return json(route, tasks);
    if (pathname === "/tasks" && method === "POST") {
      const t: Task = { id: `task-${tasks.length + 1}`, done: false, doneAt: null, reminderAt: null, ...(body as object) } as Task;
      tasks.unshift(t);
      return json(route, t);
    }
    if (pathname.match(/^\/tasks\/[^/]+\/complete$/) && method === "POST") {
      const id = pathname.split("/")[2];
      const t = tasks.find((x) => x.id === id);
      if (t) {
        t.done = true;
        t.doneAt = new Date().toISOString();
      }
      return json(route, { data: t ?? tasks[0], reward: reward({ xp: 5, coins: 0 }) });
    }
    if (pathname.match(/^\/tasks\/[^/]+\/uncomplete$/) && method === "POST") {
      const id = pathname.split("/")[2];
      const t = tasks.find((x) => x.id === id);
      if (t) {
        t.done = false;
        t.doneAt = null;
      }
      return json(route, t ?? tasks[0]);
    }
    if (pathname.match(/^\/tasks\/[^/]+$/) && method === "PATCH") return json(route, { ...tasks[0], ...(body as object) });
    if (pathname.match(/^\/tasks\/[^/]+$/) && method === "DELETE") return json(route, { ok: true });

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

    if (pathname === "/push/subscribe" && (method === "POST" || method === "DELETE")) return json(route, { ok: true });

    // Qualquer coisa não coberta: 404 explícito (melhor que deixar a
    // requisição vazar pra rede de verdade e travar o teste).
    return json(route, { statusCode: 404, message: `sem mock para ${method} ${pathname}`, error: "Not Found" }, 404);
  });

  return calls;
}
