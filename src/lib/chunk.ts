/** Divide uma lista em lotes de no máximo `size` itens (ex.: limite de 200 ids das rotas bulk). */
export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
