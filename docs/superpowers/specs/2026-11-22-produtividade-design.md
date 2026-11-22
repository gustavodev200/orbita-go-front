# Produtividade: visão Dia, exclusão em lote, Hábitos e Foco

Data: 2026-11-22 · Repositórios: `orbita-go-front` e `orbita-go-back`

## Intenção

O usuário usa o órbitaGO todo dia, de forma simples (refatoração visual recém-feita, sem gamificação). Pediu, e delegou todas as decisões (ficou ausente):

1. Ver o calendário na visão **Dia**.
2. **Apagar vários** lembretes e tarefas de uma vez.
3. **Duas features novas** de produtividade para o dia a dia.

Sucesso = abrir o app e conseguir planejar o dia (agenda por hora), manter rotinas (hábitos), executar com foco (timer) e fazer faxina na lista sem tocar item por item.

## Objetivos

- Visão Dia (e Semana no desktop) por horário no `/agenda`.
- Modo de seleção com exclusão em lote, com confirmação, em Tarefas e em Meus lembretes.
- **Hábitos**: CRUD, marcação diária, sequência atual, lembrete push que só dispara se o hábito do dia não foi marcado.
- **Foco**: timer pomodoro ligado opcionalmente a uma tarefa, persistente entre telas, com aviso no fim.

## Não-objetivos

- Arrastar/redimensionar eventos no calendário (editable) — os itens têm regras próprias (repetição, tarefas).
- Estatísticas/gráficos de hábitos, metas de quantidade ("beber 2L"), hábitos negativos.
- Histórico de sessões de foco no servidor; timer que dispara com o app totalmente fechado.

## Anti-objetivos

- Nada que volte a ser gamificação: sem XP, medalhas, chamas, confete. "Sequência" é só um número informativo.
- Excluir em lote sem confirmação, ou apagar itens de outro usuário.

## Restrições

- Back NestJS + Prisma em Postgres do Supabase; migrações são manuais (`prisma migrate deploy`), aditivas e com RLS habilitada (padrão do projeto). Deploy serverless na Vercel; cron de push via GitHub Actions a cada ~5 min (janela de recuperação de 30 min já existente).
- Front Next 16 + FullCalendar v7 (`@fullcalendar/react/*`), React Query, Zustand, Tailwind v4 com tokens do app.
- Fuso de negócio `America/Sao_Paulo`.

## Abordagens consideradas

**Exclusão em lote**
- (A, escolhida) Rotas `POST /tasks/bulk-delete` e `POST /reminders/bulk-delete` com `{ ids }` → `deleteMany({ id in ids, userId })`. Uma requisição, atômica, sempre restrita ao dono.
- (B) N chamadas `DELETE` em paralelo no front. Sem mudança no back, mas falhas parciais e N round-trips.

**Feature 1 — escolha entre Hábitos, Notas rápidas e "Meu dia (top 3)"**
- Hábitos (escolhido): rotina diária é o que mais se repete; a sidebar antiga já previa "Hábitos"; reaproveita o push existente.
- Notas rápidas: útil, mas sobrepõe tarefas/descrição de lembrete.
- Top 3 do dia: dá para obter com prioridade "Alta" já existente.

**Lembrete de hábito**
- (A, escolhida) O cron de dispatch passa a varrer também hábitos com `reminderTime` na janela, agendados para o dia da semana, **ainda não marcados hoje** e sem disparo hoje (`lastFiredAt`). Avisa só quando precisa.
- (B) Criar `Reminder` espelho. Não suporta vários dias da semana nem o "só se não marcou".

**Feature 2 — Foco**
- (A, escolhida) Só no front: estado em Zustand persistido (`endsAt`), um "ticker" global no shell que mostra a pílula do timer em qualquer tela e, ao terminar, mostra notificação local via service worker + toast e oferece concluir a tarefa ligada.
- (B) Agendar push no back para o fim da sessão: funciona com o app fechado, mas exige fila/agendamento que o back serverless não tem.

**Visão Dia**
- Plugin `timeGrid` (`timeGridDay`, `timeGridWeek` no desktop). Itens com horário viram eventos de 30 min; contas fixas e tarefas sem hora ficam na faixa "dia inteiro".

## Desenho

### Back
- Prisma: `Habit { id, userId, name, icon, color, weekdays Int[] (0=dom..6), reminderTime String? "HH:mm", lastFiredAt?, createdAt }` e `HabitCheck { id, habitId, day @db.Date, createdAt, @@unique([habitId, day]) }`, cascades por usuário/hábito, RLS habilitada.
- Rotas (Bearer): `GET /habits` → `HabitDto[]` com `checks: string[]` (últimos 35 dias) e `streak: number`; `POST /habits`; `PATCH /habits/:id`; `DELETE /habits/:id`; `PUT /habits/:id/checks/:day` e `DELETE /habits/:id/checks/:day` (idempotentes, devolvem o `HabitDto`). Dia futuro → 400.
- Sequência: conta dias agendados consecutivos marcados terminando hoje; se hoje está agendado e ainda não marcado, começa de ontem (o dia não acabou). Dias não agendados são pulados. Função pura com testes.
- `POST /tasks/bulk-delete` e `POST /reminders/bulk-delete` `{ ids: uuid[] (1..200) }` → `{ deleted: number }`.
- Dispatch: além dos lembretes, hábitos (payload `{ title: nome, body: "Hábito de hoje · HH:mm", url: "/habitos", tag: habit-<id> }`).

### Front
- `/agenda`: botões Mês / Semana (desktop) / Dia / Lista; `navLinks` (tocar no número do dia abre o Dia); clique em horário vazio abre "Novo lembrete" com data e hora; visão Dia sincroniza o dia selecionado do painel.
- Seleção em lote: botão "Selecionar" → checkboxes, "Selecionar todos", barra de ação "Excluir (n)" → diálogo de confirmação → rota bulk → toast "n excluídos".
- `/habitos`: lista com grade dos últimos 7 dias (toque marca/desmarca), sequência, editar/excluir; diálogo de criação (nome, ícone, dias da semana, lembrete opcional). Card "Hábitos de hoje" no Início. Item "Hábito" no menu +.
- `/foco`: timer grande, presets 15/25/50, pausa 5 min, seletor de tarefa (tarefas pendentes), contagem de sessões de hoje (localStorage). Pílula do timer no header quando ativo. Ação "Focar" no menu de cada tarefa.
- Navegação: sidebar ganha Hábitos e Foco; no celular, Hábitos e Foco ficam acessíveis pelo Início (cards) e pelo menu + / tarefas (bottom nav continua com 5 posições).

## Decisões deixadas ao implementador

Ícones/cores dos hábitos (catálogo pequeno fixo), textos de tela, layout fino, limites de validação razoáveis (nome ≤ 60, ids ≤ 200).

## Revisão de builder (feita pelo autor)

- Migração em produção: aditiva (CREATE TABLE + RLS), aplicada com `prisma migrate deploy` antes de publicar o back. Decisão do autor, autorizada pelo usuário ("tome as decisões").
- Hábitos criados hoje: sequência 0 até a primeira marcação; marcação de dias anteriores à criação é permitida (registrar retroativo).
- Excluir tarefa com lembrete: o `Reminder` espelho cai por cascade (FK já existente).
