# Componentes do órbitaGO

Visual: limpo e de uso diário — fundo cinza-claro, cards brancos bem arredondados sem borda, **laranja** como única cor de destaque, pílulas para botões/chips/abas, barra de navegação flutuante escura no celular. Modo escuro via classe `.dark` no `<html>`.

## Camadas (de baixo para cima)

| Camada | Pasta | O que vive aqui | Pode importar |
|---|---|---|---|
| Tokens | `src/app/globals.css` | CSS vars claro/escuro (`--bg`, `--sf`, `--g` = destaque laranja, `--ok` = sucesso…), cores de categoria, `@theme` do Tailwind v4 (`bg-sf`, `text-mut`, `shadow-card`…), utilities `card-3d` (superfície de card) e `num` | — |
| Primitivas | `components/ui/` | shadcn/Radix restilizados: Button (pílula), IconButton, Card, Tabs (pílulas), Progress, Badge, Avatar, Sheet, Dialog, Input, Select, Switch, Skeleton, Tooltip, DropdownMenu, Sonner | tokens, `lib/utils` |
| Blocos da marca | `components/orbita/` | Agnósticos de domínio: Icon, IconTile, CheckCircle, Empty/Loading/Error/QueryState, AmountDisplay, NumericKeypad, SegmentedControl, ChoiceChip, CategoryChip, SectionHeader, Logo, GoogleButton, Panel | `ui/`, `lib/` |
| Shell | `components/shell/` | Header (saudação/título + sino), Sidebar, BottomNav flutuante, QuickAddMenu (botão +), AppShell (guardas de sessão/onboarding + diálogos globais) | tudo acima + `features/*` |
| Domínio | `src/features/<domínio>/` | `api.ts` (chamadas + Zod), `hooks.ts` (react-query), telas e cards | tudo acima |
| Rotas | `src/app/` | Páginas finas: só compõem a tela da feature | `features/*` |

Regra: uma camada nunca importa de uma camada acima dela (ex.: `orbita/` não chama API nem hooks de feature).

## Assinatura visual — use sempre os tokens

- **Botão**: `<Button variant="primary|dark|secondary|danger|ghost|link">` — pílula plana. Nomes antigos (`orange`, `gold`, `blue`, `ai`) ainda existem e mapeiam para essas aparências.
- **Card**: `<Card>` (branco, `rounded-3xl`, sombra leve, sem borda).
- **Números**: classe `num` ou `<AmountDisplay>` para BRL (entrada verde, saída vermelha).
- **Ícones**: `<Icon name="savings" />` (Material Symbols Rounded em contorno; adicione `icon-fill` para preencher, ex.: item ativo da navegação).
- **Cores**: nunca hex solto para tokens do tema — use `bg-g`, `text-mut`, `var(--oks)`… (hex só para cores fixas de categoria).
- **Cuidado com nomes de cor de uma letra**: `divide-y`, `border-b`, `border-r` e `border-y` também geram cor (`--y`, `--b`, `--r`) no Tailwind v4. Para divisórias use `[&>*+*]:border-t [&>*+*]:border-sf2`; para cor de borda use `border-[color:var(--r)]`.

## Como adicionar um componente

1. **É genérico da marca?** (sem saber de API/rotas) → `components/orbita/<nome>.tsx`, exporte em `components/orbita/index.ts`.
   Primitiva Radix/shadcn nova → `npx shadcn add <x>` e restilize em `components/ui/` com tokens.
2. Variações visuais via **`cva`** (veja `ui/button.tsx`, `orbita/choice-chip.tsx`); aceite `className` e passe por `cn()`.
3. Movimento com **framer-motion**, curto e discreto (respeite `useReducedMotion`).
4. Se tiver lógica (variantes, cálculo), escreva um teste em `tests/unit/`.

## Estados de lista

Toda lista usa `<QueryState query isEmpty empty frame>`: carregando (skeleton), erro ("Tentar de novo") e vazio (ícone + texto + CTA).

## Respostas `{ data, reward }`

Algumas rotas do back ainda respondem com `reward` (legado da versão gamificada). `useRewardedMutation` (`features/rewards`) só sincroniza o `me` que vem junto — a UI não mostra XP, moedas, conquistas nem modais.
