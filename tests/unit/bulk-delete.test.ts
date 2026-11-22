import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("@/lib/api/client", () => ({ send: (...args: unknown[]) => send(...args), get: vi.fn(), sendRewarded: vi.fn() }));

import { bulkDeleteReminders } from "@/features/reminders/api";
import { bulkDeleteTasks } from "@/features/tasks/api";

const ids = Array.from({ length: 450 }, (_, i) => `id-${i}`);

describe("exclusão em lote", () => {
  beforeEach(() => {
    send.mockReset();
    send.mockImplementation((_m: string, _u: string, _s: unknown, body: { ids: string[] }) => Promise.resolve({ deleted: body.ids.length }));
  });

  it("tarefas: até 200 ids por chamada e soma o total", async () => {
    await expect(bulkDeleteTasks(ids)).resolves.toEqual({ deleted: 450 });
    expect(send.mock.calls.map((c) => (c[3] as { ids: string[] }).ids.length)).toEqual([200, 200, 50]);
  });

  it("lembretes: até 200 ids por chamada e soma o total", async () => {
    await expect(bulkDeleteReminders(ids)).resolves.toEqual({ deleted: 450 });
    expect(send).toHaveBeenCalledTimes(3);
  });
});
