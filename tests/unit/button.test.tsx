import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button, buttonVariants } from "@/components/ui/button";

describe("Button", () => {
  it("usa primary/md por padrão: pílula laranja, sem caixa alta", () => {
    render(<Button>Salvar</Button>);
    const btn = screen.getByRole("button", { name: "Salvar" });
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveAttribute("type", "button");
    expect(btn.className).toContain("bg-g");
    expect(btn.className).toContain("rounded-full");
    expect(btn.className).not.toContain("uppercase");
  });

  it.each([
    ["dark", "bg-ink"],
    ["secondary", "bg-sf2"],
    ["danger", "bg-r"],
  ] as const)("variante %s tem cor própria", (variant, bg) => {
    expect(buttonVariants({ variant })).toContain(bg);
  });

  it("variantes legadas mapeiam para a aparência nova (sem sombra 3D)", () => {
    for (const variant of ["orange", "gold", "blue", "ai"] as const) {
      expect(buttonVariants({ variant })).not.toContain("--btn-sh");
    }
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
