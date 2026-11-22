import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSelection } from "@/hooks/use-selection";

describe("useSelection", () => {
  it("começa inativo e vazio; start ativa", () => {
    const { result } = renderHook(() => useSelection<string>());
    expect(result.current.active).toBe(false);
    act(() => result.current.start());
    expect(result.current.active).toBe(true);
    expect(result.current.selected.size).toBe(0);
  });

  it("toggle adiciona e remove", () => {
    const { result } = renderHook(() => useSelection<string>());
    act(() => result.current.toggle("a"));
    expect([...result.current.selected]).toEqual(["a"]);
    act(() => result.current.toggle("a"));
    expect(result.current.selected.size).toBe(0);
  });

  it("setMany liga e desliga vários", () => {
    const { result } = renderHook(() => useSelection<string>());
    act(() => result.current.setMany(["a", "b", "c"], true));
    expect(result.current.selected.size).toBe(3);
    act(() => result.current.setMany(["a", "b"], false));
    expect([...result.current.selected]).toEqual(["c"]);
  });

  it("stop sai do modo e limpa a seleção", () => {
    const { result } = renderHook(() => useSelection<string>());
    act(() => {
      result.current.start();
      result.current.toggle("a");
    });
    act(() => result.current.stop());
    expect(result.current.active).toBe(false);
    expect(result.current.selected.size).toBe(0);
  });
});
