# Componentes do órbitaGO

Fonte de verdade visual: `gamifica-o-web-orbita/project/design_handoff_orbita/README.md` + arquivos `.dc.html`.
Vitrine viva: rota **`/design-system`**.

## Camadas (de baixo para cima)

| Camada | Pasta | O que vive aqui | Pode importar |
|---|---|---|---|
| Tokens | `src/app/globals.css` | CSS vars claro/escuro (`--bg`, `--g`, `--gd`, `--gs`…), cores de categoria, `@theme` do Tailwind v4 (`bg-sf`, `text-mut`, `font-display`…), utilities `card-3d` e `num` | — |
| Primitivas | `components/ui/` | shadcn/Radix restilizados: Button (cva 3D), Card, Tabs segmented, Progress (XP/HP com spring), Badge, Avatar, Sheet, Dialog, Input, Select, Switch, Skeleton, Tooltip, DropdownMenu, Sonner | tokens, `lib/utils` |
| Blocos da marca | `components/orbita/` | Agnósticos de domínio: Icon, Cobre, IconTile, StatPill/Flame/Coin/LevelBadge, XpBar/HpBar, Checkbox3D, Stamp, Confetti, XpToast, Empty/Loading/Error/QueryState, CelebrationModal, AmountDisplay, NumericKeypad, SpeechBubble, SegmentedControl, ChoiceChip, CategoryChip, SectionHeader, Logo, GoogleButton, Medal/ProgressRing, Panel | `ui/`, `lib/` (formatação), `stores` só para tipos |
| Shell | `components/shell/` | Header, Sidebar recolhível, BottomNav + FAB, RewardLayer (toast + fila de modais), AppShell (guardas de sessão/onboarding) | tudo acima + `features/*` hooks |
| Domínio | `src/features/<domínio>/` | `api.ts` (chamadas + Zod), `hooks.ts` (react-query), seções de tela (`*-screen.tsx`, cards) | tudo acima |
| Rotas | `src/app/` | Páginas finas: só compõem a tela da feature | `features/*` |

Regra: uma camada nunca importa de uma camada acima dela (ex.: `orbita/` não chama API nem hooks de feature).

## Assinatura visual — use sempre os tokens

- **Botão 3D sólido**: `<Button variant="primary|orange|gold|blue|danger|ai">` — sombra `0 var(--press) 0 var(--btn-sh)`, desce no `:active`.
- **Secundário**: `variant="secondary"` (borda 2px, base 5px).
- **Card**: `<Card>` (borda 2px, base 5px, sem drop shadow). `tone="danger"` para borda vermelha.
- **Números**: classe `num` (Figtree tabular) ou `<AmountDisplay>` para BRL.
- **Ícones**: `<Icon name="savings" size={24} />` (Material Symbols Rounded, FILL 1, wght 600).
- **Cores**: nunca hex solto para tokens do tema — use `bg-g`, `text-yd`, `var(--rs)`… (hex só para cores fixas de categoria/ilustração).
- **Cuidado**: `border-r`, `border-b`, `border-y` são utilitários de *largura* no Tailwind; para cor use `border-[color:var(--r)]`.

## Como adicionar um componente

1. **É genérico da marca?** (sem saber de API/rotas) → `components/orbita/<nome>.tsx`, exporte em `components/orbita/index.ts`.
   Primitiva Radix/shadcn nova → `npx shadcn add <x>` e restilize em `components/ui/` com tokens.
2. Variações visuais via **`cva`** (veja `ui/button.tsx`, `orbita/choice-chip.tsx`); aceite `className` e passe por `cn()`.
3. Movimento com **framer-motion** (respeite `useReducedMotion`); CSS keyframes só para loops triviais (shimmer, órbitas).
4. Adicione um exemplo em `/design-system` (`src/app/design-system/design-system-view.tsx`).
5. Se tiver lógica (variantes, cálculo), escreva um teste em `tests/unit/`.

## Estados de lista

Toda lista usa `<QueryState query isEmpty empty frame>`: carregando (skeleton shimmer), erro (Cobre preocupado + "Tentar de novo") e vazio (Cobre + CTA) com a copy do design.

## Recompensas

Toda mutação que responde `{ data, reward }` usa `useRewardedMutation` (`features/rewards`), que chama `handleReward(reward, mensagem)`: atualiza `me`, mostra o XpToast e agenda os modais (nível 1,3s depois do toast; conquistas em fila).
