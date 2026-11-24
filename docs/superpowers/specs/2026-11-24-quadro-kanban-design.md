# Quadro Kanban das tarefas

Data: 2026-11-24 · Rota `/tarefas/quadro` (seletor Lista | Quadro em Tarefas)

## Decisões (o usuário delegou)
- **Colunas:** Para depois (`backlog`) → A fazer (`todo`) → Fazendo (`doing`) → Feito (`done`). O quadro e a lista são a mesma tarefa: `done` ⇔ status `done`. Concluir na lista leva o card para "Feito" e reabrir o devolve para "A fazer".
- **Ordem:** `position` fracionária. Ao soltar entre dois cards, a posição é a média dos dois, então só um registro muda. "Feito" mostra a concluída mais recente no topo e exibe as 12 mais recentes, com "Mostrar mais".
- **Celular** (padrão de Trello/KanbanFlow/TickTick mobile): uma coluna por vez em carrossel com scroll-snap nativo (swipe), abas com contagem que ficam fixas no topo, FAB que cria na coluna aberta (e sobe quando o mini-player de música está aberto), menu "Mover para" em cada card e detalhes num bottom sheet. Não há arrastar no celular, porque arrastar ao rolar reordena sem querer. O menu e o seletor de coluna no sheet substituem o arrasto.
- **Desktop:** 4 colunas, drag and drop nativo do HTML5 (sem dependência nova) com placeholder na posição de soltura, busca sem acento, filtros por prioridade e prazo, painel lateral de detalhes e "Adicionar tarefa" em cada coluna (Enter salva e mantém o campo aberto).
- **Card:** concluir, título em até 3 linhas, selos de prioridade, prazo (atrasada/hoje/amanhã), lembrete e meta vinculada.
- **Sem gamificação na UI:** mover para "Feito" segue o fluxo de recompensa que já existe no back.

## Back
- Enum `TaskStatus`, colunas `status` e `position` e a rota `POST /tasks/:id/move`. A única porta de troca de status é `TasksService.applyStatus` (cuida de done, lembrete e XP).
