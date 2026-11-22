# Produtividade (visão Dia, lote, Hábitos, Foco) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visão Dia/Semana na agenda, exclusão em lote de tarefas e lembretes, Hábitos (com push condicional) e Foco (pomodoro).

**Architecture:** Back NestJS ganha módulo `habits` (Prisma: `Habit`, `HabitCheck`), rotas bulk-delete em tasks/reminders e o dispatch passa a avisar hábitos pendentes. Front ganha `features/habits`, `features/focus` (estado Zustand persistido + ticker global no shell), modo de seleção reutilizável e plugin `timeGrid` no FullCalendar.

**Tech Stack:** NestJS 11, Prisma 7, Zod, Jest · Next 16, React 19, React Query 5, Zustand 5, FullCalendar 7 (`@fullcalendar/react/timegrid`), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-produtividade-design.md`

## Global Constraints

- Fuso de negócio `America/Sao_Paulo`; dias `YYYY-MM-DD`; horários `HH:mm`.
- Toda rota filtra por `userId` (404 se não for do usuário); bulk usa `deleteMany({ id: { in: ids }, userId })`.
- Bulk: `ids` uuid, 1..200 itens → `{ deleted: number }`.
- Hábito: `name` 1..60, `icon` string, `color` hex `#RRGGBB`, `weekdays` int 0..6 sem repetição, 1..7 itens (padrão todos), `reminderTime` `HH:mm | null`.
- `GET /habits` devolve `checks` dos últimos 35 dias (inclui hoje) e `streak`.
- Migração aditiva com `ENABLE ROW LEVEL SECURITY` nas tabelas novas.
- UI sem gamificação; tokens do app; confirmação antes de excluir em lote.
- Push de hábito: `{ title: <nome>, body: "Hábito de hoje · HH:mm", url: "/habitos", tag: "habit-<id>" }`, só se não marcado hoje.

## Review Focus

- Marcar dia futuro → 400; o front nem oferece dia futuro.
- Sequência com hoje agendado e não marcado → conta a partir de ontem (não zera de manhã).
- Bulk com ids de outro usuário → `deleted` só conta os próprios; nada alheio some.
- Timer de foco ao recarregar a página no meio da sessão → continua do `endsAt` persistido; se já passou, finaliza uma vez só.
- Clique em horário vazio na visão Dia → lembrete abre com aquela data e hora (não 09:00).

---

### Task 1: Back — exclusão em lote (tasks e reminders)

**Files:**
- Modify: `orbita-go-back/src/common/schemas/common.schema.ts` (add `bulkIdsSchema`)
- Modify: `src/tasks/tasks.controller.ts`, `src/tasks/tasks.service.ts`, `src/reminders/reminders.controller.ts`, `src/reminders/reminders.service.ts`
- Test: `src/common/schemas/bulk-ids.spec.ts`

**Interfaces:**
- Produces: `POST /tasks/bulk-delete`, `POST /reminders/bulk-delete` body `{ ids: string[] }` → `{ deleted: number }` (HTTP 200). `TasksService.removeMany(userId, ids)`, `RemindersService.removeMany(userId, ids)`.

- [ ] Step 1: Test `bulkIdsSchema` accepts 1 uuid, rejects `[]`, rejects 201 ids, rejects non-uuid, dedupes repeated ids.
- [ ] Step 2: Run `npx jest src/common/schemas` → FAIL.
- [ ] Step 3: Implement `bulkIdsSchema = z.object({ ids: z.array(uuid).min(1).max(200).transform(unique) }).strict()`; services use `deleteMany` filtered by `userId`; controller `@Post('bulk-delete') @HttpCode(200)` declared before `:id` routes.
- [ ] Step 4: Run jest → PASS; `npx tsc --noEmit`.

### Task 2: Back — Hábitos (modelo, sequência, rotas)

**Files:**
- Modify: `prisma/schema.prisma` (+ relations on `User`)
- Create: `prisma/migrations/20261122120000_habits/migration.sql`
- Create: `src/habits/{habits.module.ts,habits.controller.ts,habits.service.ts,habit-streak.ts,habit-streak.spec.ts,dto/habit.schema.ts}`
- Modify: `src/app.module.ts`

**Interfaces:**
- Produces: `HabitDto = { id, name, icon, color, weekdays: number[], reminderTime: string | null, checks: string[], streak: number }`; rotas `GET/POST /habits`, `PATCH/DELETE /habits/:id`, `PUT/DELETE /habits/:id/checks/:day`.
- `habitStreak(weekdays: number[], checked: Set<string>, today: string): number` em `habit-streak.ts`.

- [ ] Step 1: Tests `habitStreak`: diário marcado hoje+ontem+anteontem → 3; hoje não marcado e ontem/anteontem marcados → 2; dias não agendados (seg/qua/sex, hoje sexta) pulam terça/quinta; falha num dia agendado interrompe; nada marcado → 0.
- [ ] Step 2: Run `npx jest src/habits` → FAIL.
- [ ] Step 3: Implement `habitStreak` (anda para trás a partir de hoje, no máximo 400 dias; dia não agendado pula; hoje agendado e não marcado pula sem quebrar).
- [ ] Step 4: Prisma models (`habits`, `habit_checks`, `@@unique([habitId, day])`, cascades), migração SQL escrita à mão no estilo das existentes + RLS; `npx prisma generate`.
- [ ] Step 5: Service/controller/DTO; `PUT checks/:day` faz upsert, futuro → `BadRequestException('não dá para marcar dia futuro')`; `DELETE` usa `deleteMany`. Registrar `HabitsModule` no `AppModule`.
- [ ] Step 6: `npx jest` → PASS; `npx tsc --noEmit`; `npx eslint src/habits`.

### Task 3: Back — push de hábito no dispatch

**Files:**
- Modify: `src/internal/dispatch-reminders.service.ts`, `src/reminders/reminder-due.ts` (reuse), `src/internal/internal.module.ts` se preciso
- Test: `src/internal/habit-due.spec.ts` + `src/internal/habit-due.ts`

**Interfaces:**
- Produces: `isHabitDue({ weekdays, reminderTime, lastFiredAt }, checkedToday: boolean, today: string, nowTime: string, lastFiredDay: string | null): boolean`; `buildHabitPayload(habit): PushPayload`.

- [ ] Step 1: Tests: dentro da janela + dia agendado + não marcado + não disparado → true; marcado hoje → false; dia não agendado → false; já disparado hoje → false; sem `reminderTime` → false.
- [ ] Step 2: FAIL → implement (usa `isInDispatchWindow`, `weekdayOf`) → PASS.
- [ ] Step 3: `run()` busca hábitos com `reminderTime <= nowTime`, consulta checks de hoje, envia via `PushSenderService`, grava `lastFiredAt`; `dispatched` soma lembretes + hábitos.
- [ ] Step 4: `npx jest`, `npx tsc --noEmit`, `npx eslint src`; commit back.

### Task 4: Front — visão Dia/Semana na agenda

**Files:**
- Modify: `src/features/agenda/agenda-calendar.tsx`, `src/features/agenda/agenda-screen.tsx`, `src/features/reminders/reminder-dialog.tsx` (prop `initialTime?: string`), `src/stores/app-store.ts` (`reminder` quickAdd ganha `time?: string`), `src/components/shell/app-shell.tsx`
- Test: `tests/e2e/agenda.spec.ts`

**Interfaces:**
- Consumes: `AgendaItem` (date, time).
- Produces: `onSelectSlot(date: string, time: string | null)` prop do calendário.

- [ ] Step 1: e2e: na agenda, clicar "Dia" mostra a grade de horas (`.fc` com rótulo "08:00" ou equivalente) e clicar em horário vazio abre "Novo lembrete" com o campo Horário ≠ "09:00".
- [ ] Step 2: Implement: plugin `timeGridPlugin`; eventos com `time` → `start: date+"T"+time`, `end` +30 min, `allDay: false`; sem hora → allDay; toolbar desktop `dayGridMonth,timeGridWeek,timeGridDay,listWeek`, mobile footer `dayGridMonth,timeGridDay,listWeek`; `buttons` com textos "Mês", "Semana", "Dia", "Lista"; `navLinks`; `slotMinTime "06:00"`, `scrollTime "08:00"`; `dateClick` em view timeGrid → abre lembrete com data/hora, em dayGrid → seleciona dia; `datesSet` em `timeGridDay` sincroniza `selected`.
- [ ] Step 3: `npx playwright test agenda` (PORT=3100) → PASS.

### Task 5: Front — seleção e exclusão em lote

**Files:**
- Create: `src/components/orbita/selection-bar.tsx`, `src/components/orbita/confirm-dialog.tsx`, `src/hooks/use-selection.ts`
- Modify: `src/features/tasks/{api.ts,hooks.ts,tasks-screen.tsx}`, `src/features/reminders/{api.ts,hooks.ts}`, `src/features/agenda/agenda-screen.tsx`, `tests/e2e/fixtures/mock-api.ts`
- Test: `tests/unit/use-selection.test.ts`, `tests/e2e/tarefas.spec.ts`, `tests/e2e/agenda.spec.ts`

**Interfaces:**
- Produces: `useSelection<T extends string>()` → `{ active, selected: Set<T>, start(), stop(), toggle(id), setMany(ids, on), clear() }`; `bulkDeleteTasks(ids)`, `bulkDeleteReminders(ids)` → `{ deleted }`; hooks `useBulkDeleteTasks(onDone)`, `useBulkDeleteReminders(onDone)`; `<ConfirmDialog open title text confirmLabel tone="danger" onConfirm onOpenChange busy />`; `<SelectionBar count onSelectAll onCancel onDelete />`.

- [ ] Step 1: Unit tests `useSelection` (renderHook): toggle adds/removes; setMany on/off; stop clears.
- [ ] Step 2: Implement hook + components; Tarefas: botão "Selecionar" ao lado do campo; em seleção cada linha mostra checkbox (o check de concluir fica oculto) e o grupo tem "Selecionar todos"; barra fixa acima da bottom nav "n selecionadas · Excluir"; confirma → bulk → toast "n excluídas". Meus lembretes idem.
- [ ] Step 3: e2e: selecionar 2 tarefas → Excluir → confirmar → POST `/tasks/bulk-delete` com os 2 ids; lembretes → POST `/reminders/bulk-delete`.
- [ ] Step 4: vitest + playwright → PASS.

### Task 6: Front — Hábitos

**Files:**
- Create: `src/features/habits/{api.ts,hooks.ts,habit-dialog.tsx,habits-screen.tsx,habit-week.tsx,today-habits-card.tsx,catalog.ts}`, `src/app/(app)/habitos/page.tsx`
- Modify: `src/lib/api/schemas.ts` (`habitSchema`), `src/components/shell/{nav.ts,quick-add-menu.tsx}`, `src/stores/app-store.ts` (`quickAdd` kind `"habit"` com `editing?: Habit`), `src/components/shell/app-shell.tsx`, `src/features/today/today-screen.tsx`, `tests/e2e/fixtures/{mock-api.ts,fixtures-data.ts}`
- Test: `tests/e2e/habitos.spec.ts`, `tests/unit/habits.test.ts`

**Interfaces:**
- Consumes: rotas da Task 2.
- Produces: `habitKeys.all = ["habits"]`; `useHabits()`, `useSaveHabit(onDone)`, `useDeleteHabit()`, `useToggleHabitDay()` (otimista: altera `checks`); `isScheduled(habit, day): boolean` em `catalog.ts`.

- [ ] Step 1: Unit: `isScheduled` respeita `weekdays`; `weekdaysLabel([0..6])` = "Todo dia", `[1,2,3,4,5]` = "Seg a sex", outros → "Seg, Qua, Sex".
- [ ] Step 2: Implement; tela `/habitos`: cards por hábito (ícone, nome, `weekdaysLabel`, "n dias seguidos" quando >0), grade dos últimos 7 dias (dia não agendado esmaecido, futuro inexistente), menu Editar/Excluir; card "Hábitos de hoje" no Início com check grande por hábito agendado hoje e progresso "2/4"; menu + ganha "Hábito"; sidebar ganha "Hábitos" (ícone `self_improvement`). Criar hábito com lembrete chama `useEnsurePush`.
- [ ] Step 3: e2e: criar hábito → POST `/habits` com `weekdays` e `reminderTime`; marcar hoje → PUT `/habits/<id>/checks/<hoje>`.
- [ ] Step 4: vitest + playwright → PASS.

### Task 7: Front — Foco (pomodoro)

**Files:**
- Create: `src/features/focus/{focus-store.ts,focus-screen.tsx,focus-ticker.tsx,focus-pill.tsx}`, `src/app/(app)/foco/page.tsx`
- Modify: `src/components/shell/{app-shell.tsx,app-header.tsx,nav.ts}`, `src/features/tasks/tasks-screen.tsx` (item "Focar" no menu da tarefa), `src/features/today/today-screen.tsx` (atalho)
- Test: `tests/unit/focus-store.test.ts`, `tests/e2e/foco.spec.ts`

**Interfaces:**
- Produces: `useFocusStore` (persist `orbita:focus`) com `{ mode: "focus" | "break", minutes: 15 | 25 | 50, endsAt: number | null, pausedLeftMs: number | null, taskId: string | null, sessionsDay: string, sessions: number, start(opts?), pause(), resume(), reset(), finish(now) }`; `remainingMs(state, now): number`.

- [ ] Step 1: Unit: `start()` define `endsAt = now + minutes*60000`; `pause()` guarda `pausedLeftMs` e zera `endsAt`; `resume()` restaura; `finish()` em modo focus incrementa `sessions` (zera ao virar o dia), troca para `break` de 5 min sem iniciar; `remainingMs` nunca negativo.
- [ ] Step 2: Implement store + `FocusTicker` (montado no shell; `setInterval` 1s; ao chegar a 0 chama `finish` uma vez, mostra notificação local via `registration.showNotification` e toast com ação "Concluir tarefa" quando há `taskId`); tela `/foco` (anel/contador grande, presets, seletor de tarefa pendente, iniciar/pausar/reiniciar, "n sessões hoje"); pílula no header com tempo restante linkando para `/foco`; menu da tarefa "Focar" → `start({ taskId })` + navega.
- [ ] Step 3: e2e: em `/foco` escolher 15 min e iniciar → contador mostra "14:5x"; pílula aparece no header ao ir para `/`.
- [ ] Step 4: vitest + playwright → PASS.

### Task 8: Integração, deploy

- [ ] `npx prisma migrate deploy` (back) → aplica `20261122120000_habits`; `npx prisma migrate status` = up to date.
- [ ] Front: eslint, tsc, vitest, `npm run build`, playwright (PORT=3100). Back: eslint, tsc, jest.
- [ ] Atualizar `API_CONTRACT.md` (habits, bulk-delete, payload de hábito).
- [ ] Commits por task nas branches `feat/produtividade` (front e back), merge `--ff-only` na `main` e push (back primeiro).
