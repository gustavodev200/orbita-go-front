import { describe, expect, it } from "vitest";

import { chunk } from "@/lib/chunk";

describe("chunk", () => {
  it("divide em lotes do tamanho pedido", () => {
    const ids = Array.from({ length: 450 }, (_, i) => String(i));
    expect(chunk(ids, 200).map((c) => c.length)).toEqual([200, 200, 50]);
  });
  it("lista vazia → nenhum lote", () => {
    expect(chunk([], 200)).toEqual([]);
  });
});
