# Metas, Desafios, Linha do tempo, consistência de hábitos, música no Foco e evolução financeira

Data: 2026-11-24 · Repositórios: `orbita-go-front` e `orbita-go-back`

## Intenção

O usuário pediu, e delegou todas as decisões (ficou ausente):

1. **Hábitos** — sequência de dias (streaks) e gráficos de consistência.
2. **Foco** — link de música do YouTube para relaxar durante a sessão.
3. **Metas (Goals & OKRs)** — "já está contemplando tudo?" (curto/médio/longo prazo, prazos e resultado esperado, etapas, % de conclusão, vincular tarefas e hábitos).
4. **Finanças** — "já está contemplando tudo?" (entradas/saídas, categorias, orçamento, metas de economia, gráficos de evolução).
5. **Linha do tempo pessoal** — conquistas, metas alcançadas, projetos concluídos, marcos da vida, comparação entre anos.
6. **Desafios** — 7, 21 ou 30 dias com acompanhamento de progresso.
7. Atualizar a barra de navegação com as features novas.

## Diagnóstico do que já existia

| Pedido | Já tinha | Faltava |
|---|---|---|
| Hábitos | CRUD, marcação, sequência atual | recorde, gráficos de consistência |
| Foco | pomodoro, tarefa, sessões do dia | música |
| Metas | só **metas de economia** (Finanças › Metas: valor, prazo, trilha, %) | metas gerais com horizonte, resultado esperado, etapas, vínculo com tarefas/hábitos |
| Finanças | extrato (entradas/saídas), categorias, orçamento, metas de economia com prazo | gráficos de evolução |
| Linha do tempo | — | tudo |
| Desafios | — | tudo |

## Anti-objetivos (herdados)

Nada de gamificação na UI: sem XP, medalhas, chamas, confete. Sequência, recorde e % são números informativos.

## Desenho

### Hábitos
- Back: `HabitDto` ganha `bestStreak` (maior sequência na janela de 400 dias), `createdAt` (YYYY-MM-DD) e `checks` passa de 35 para **91 dias** (13 semanas).
- Front: painel "Consistência" no topo (feitos hoje, taxa dos últimos 30 dias, melhor sequência ativa, barras das últimas 12 semanas) e, em cada hábito, heatmap de 13 semanas + "Recorde" e "% em 30 dias". Taxa = dias marcados ÷ dias agendados desde a criação.

### Foco — música
- Só front. Card "Som para relaxar" com estações prontas (lofi, synthwave) e campo para colar link do YouTube (vídeo, live, youtu.be, shorts, playlist). Player `youtube-nocookie` num **mini-player fixo do shell** (continua tocando ao trocar de tela; dá para minimizar ou fechar). Escolha persistida em localStorage.

### Metas (Goals & OKRs) — rota `/metas`
- A aba de Finanças vira **"Economia"** (as metas de economia continuam lá) para não confundir com as metas gerais.
- Prisma: `Objective { title, why?, expectedResult?, horizon short|medium|long, deadline Date?, icon, color, completedAt? }`, `ObjectiveMilestone { objectiveId, title, done, doneAt?, position }`, e `objectiveId` opcional em `Task` e `Habit` (SetNull).
- % de conclusão = (etapas feitas + tarefas vinculadas feitas) ÷ (etapas + tarefas vinculadas). Concluída = 100%. Hábitos vinculados mostram consistência (30 dias) mas não entram no %.
- Rotas: `GET/POST /objectives`, `PATCH/DELETE /objectives/:id` (`completed: boolean` conclui/reabre), etapas `POST /objectives/:id/milestones`, `PATCH|DELETE /objectives/:id/milestones/:mid`, vínculos `PUT|DELETE /objectives/:id/tasks/:taskId` e `.../habits/:habitId`.

### Finanças — evolução
- Back: `GET /transactions/evolution?months=12` → `[{ month, incomeCents, expenseCents }]` (meses vazios incluídos).
- Front: aba **"Evolução"**: barras entradas × saídas por mês, linha de saldo acumulado, resumo do período e gastos por categoria do mês (reaproveita `GET /stats/compare`).

### Desafios — rota `/desafios`
- Prisma: `Challenge { title, why?, durationDays 7|21|30, startDate, icon, color, completedAt?, abandonedAt? }` + `ChallengeCheck { challengeId, day }`.
- Marcação só dentro de [início, min(hoje, fim)]. Concluído quando todos os dias foram marcados (`completedAt`). Prazo passou sem completar = "encerrado" com o % alcançado. Pode desistir (abandona, mantém histórico).
- Front: ativos (grade de N dias, botão "Cumpri hoje", dias perdidos marcados), concluídos/encerrados, sugestões prontas.

### Linha do tempo — rota `/linha-do-tempo`
- Prisma: `LifeEvent { title, description?, date, kind achievement|project|milestone, icon }` (conquistas, projetos concluídos e marcos da vida registrados à mão).
- Back: `GET /timeline` → eventos manuais + automáticos (metas concluídas, metas de economia alcançadas, desafios concluídos) e `years[]` com totais por ano (tarefas concluídas, check-ins de hábitos, metas concluídas, metas de economia, desafios, marcos, saldo).
- Front: comparação ano a ano (ano atual vs anterior) e lista cronológica agrupada por ano, filtro por tipo.

### Navegação
- Sidebar: Início, Agenda, Tarefas, Finanças, Metas, Hábitos, Desafios, Foco, Inglês, Linha do tempo, Perfil.
- Mobile: os 4 fixos continuam; o resto vai para "Mais". Menu "+" ganha Meta e Desafio.

## Restrições
- Migração aditiva (CREATE TABLE + colunas nulas + RLS ligada), padrão do projeto.
- Zod na borda em todas as rotas novas; tudo filtrado por `userId`.
