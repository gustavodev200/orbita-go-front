import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Cobre } from "@/components/orbita/cobre";

describe("Cobre", () => {
  it.each(["feliz", "preocupado", "dormindo", "comemorando"] as const)("renderiza o humor %s", (mood) => {
    render(<Cobre mood={mood} />);
    const el = screen.getByRole("img", { name: `Cobre ${mood}` });
    expect(el).toHaveAttribute("data-mood", mood);
  });

  it("escala a caixa 120×120 pelo size", () => {
    render(<Cobre size={60} />);
    const el = screen.getByRole("img");
    expect(el).toHaveStyle({ width: "60px", height: "60px" });
    const inner = el.firstElementChild as HTMLElement;
    expect(inner.style.transform).toBe("scale(0.5)");
  });

  it("dormindo mostra o z Z e dessatura o corpo", () => {
    const { container } = render(<Cobre mood="dormindo" />);
    expect(container.textContent).toContain("z");
    expect(container.innerHTML).toContain("saturate(.8)");
  });
});
