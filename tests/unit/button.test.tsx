import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonVariants } from "@/components/ui/button";

describe("Button 3D", () => {
  it("usa primary/md por padrão com sombra sólida e press de 5px", () => {
    render(<Button>Salvar</Button>);
    const btn = screen.getByRole("button", { name: "Salvar" });
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn.className).toContain("bg-g");
    expect(btn.className).toContain("[--btn-sh:var(--gd)]");
    expect(btn.className).toContain("[--press:5px]");
    expect(btn.className).toContain("active:translate-y-(--press)");
    expect(btn.className).toContain("uppercase");
  });

  it.each([
    ["orange", "bg-o", "--od"],
    ["gold", "bg-y", "--yd"],
    ["blue", "bg-b", "--bdk"],
    ["danger", "bg-r", "--rd"],
    ["ai", "bg-p", "--pd"],
  ] as const)("variante %s tem cor e sombra próprias", (variant, bg, shadow) => {
    const cls = buttonVariants({ variant });
    expect(cls).toContain(bg);
    expect(cls).toContain(`[--btn-sh:var(${shadow})]`);
  });

  it("secundário usa borda 2px com base 5px (sem sombra sólida)", () => {
    const cls = buttonVariants({ variant: "secondary" });
    expect(cls).toContain("border-b-[5px]");
    expect(cls).toContain("active:border-b-2");
    expect(cls).not.toContain("shadow-[0_var(--press)");
  });

  it("tamanho pequeno pressiona 4px", () => {
    expect(buttonVariants({ size: "sm" })).toContain("[--press:4px]");
  });

  it("dispara onClick e respeita disabled", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Ir</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Ir" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button onClick={onClick} disabled>
        Ir
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Ir" })).toBeDisabled();
  });
});
