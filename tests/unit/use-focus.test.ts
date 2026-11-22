import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialFocusState, useFocusStore } from "@/features/focus/focus-store";
import { useFocus } from "@/features/focus/use-focus";

describe("useFocus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 10, 22, 13, 0, 0));
    useFocusStore.setState(initialFocusState);
  });
  afterEach(() => vi.useRealTimers());

  it("montado antes do início, nunca mostra mais que a duração cheia", () => {
    const { result } = renderHook(() => useFocus());
    vi.setSystemTime(Date.UTC(2026, 10, 22, 13, 0, 5)); // 5 s depois do mount
    act(() => useFocusStore.getState().start());
    expect(result.current.left).toBeLessThanOrEqual(25 * 60_000);
  });
});
