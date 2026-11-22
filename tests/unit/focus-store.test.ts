import { beforeEach, describe, expect, it } from "vitest";

import { initialFocusState, remainingMs, useFocusStore } from "@/features/focus/focus-store";

const T0 = Date.UTC(2026, 10, 22, 13, 0, 0); // 22/11 10:00 em SP

describe("focus store", () => {
  beforeEach(() => useFocusStore.setState(initialFocusState));

  it("start define endsAt = agora + minutos", () => {
    useFocusStore.getState().setMinutes(25);
    useFocusStore.getState().start({ now: T0, taskId: "t1" });
    const s = useFocusStore.getState();
    expect(s.endsAt).toBe(T0 + 25 * 60_000);
    expect(s.taskId).toBe("t1");
    expect(remainingMs(s, T0 + 60_000)).toBe(24 * 60_000);
  });

  it("pause guarda o restante e resume continua dali", () => {
    useFocusStore.getState().setMinutes(15);
    useFocusStore.getState().start({ now: T0 });
    useFocusStore.getState().pause(T0 + 5 * 60_000);
    let s = useFocusStore.getState();
    expect(s.endsAt).toBeNull();
    expect(s.pausedLeftMs).toBe(10 * 60_000);
    expect(remainingMs(s, T0 + 99 * 60_000)).toBe(10 * 60_000);

    useFocusStore.getState().resume(T0 + 20 * 60_000);
    s = useFocusStore.getState();
    expect(s.endsAt).toBe(T0 + 30 * 60_000);
    expect(s.pausedLeftMs).toBeNull();
  });

  it("remainingMs nunca é negativo", () => {
    useFocusStore.getState().start({ now: T0 });
    expect(remainingMs(useFocusStore.getState(), T0 + 999 * 60_000)).toBe(0);
  });

  it("finish de foco conta a sessão e prepara a pausa de 5 min sem iniciar", () => {
    useFocusStore.getState().setMinutes(25);
    useFocusStore.getState().start({ now: T0 });
    useFocusStore.getState().finish(T0 + 25 * 60_000);
    const s = useFocusStore.getState();
    expect(s.sessions).toBe(1);
    expect(s.mode).toBe("break");
    expect(s.endsAt).toBeNull();
    expect(remainingMs(s, T0 + 26 * 60_000)).toBe(5 * 60_000);
  });

  it("finish chamado de novo depois de terminar não conta em dobro", () => {
    useFocusStore.getState().start({ now: T0 });
    useFocusStore.getState().finish(T0 + 25 * 60_000);
    useFocusStore.getState().finish(T0 + 25 * 60_000 + 1000);
    expect(useFocusStore.getState().sessions).toBe(1);
  });

  it("sessões zeram ao virar o dia", () => {
    useFocusStore.getState().start({ now: T0 });
    useFocusStore.getState().finish(T0 + 25 * 60_000);
    const nextDay = T0 + 24 * 3_600_000;
    useFocusStore.getState().setMinutes(25);
    useFocusStore.getState().start({ now: nextDay });
    useFocusStore.getState().finish(nextDay + 25 * 60_000);
    expect(useFocusStore.getState().sessions).toBe(1);
  });
});

describe("reset", () => {
  it("para o timer mas mantém as sessões do dia", () => {
    useFocusStore.setState(initialFocusState);
    useFocusStore.getState().start({ now: T0, taskId: "t1" });
    useFocusStore.getState().finish(T0 + 25 * 60_000);
    useFocusStore.getState().reset();
    const s = useFocusStore.getState();
    expect(s.sessions).toBe(1);
    expect(s.mode).toBe("focus");
    expect(s.endsAt).toBeNull();
    expect(s.taskId).toBeNull();
  });
});
