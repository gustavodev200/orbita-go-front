"use client";

import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from "@/features/tasks/hooks";
import { cn } from "@/lib/utils";
import { BREAK_MINUTES, sessionsToday, useFocusStore, type FocusMinutes } from "./focus-store";
import { formatClock, useFocus } from "./use-focus";

const PRESETS: FocusMinutes[] = [15, 25, 50];
const NO_TASK = "none";

/** Anel de progresso do tempo restante. */
function Ring({ pct, children }: { pct: number; children: React.ReactNode }) {
  const r = 120;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex size-[272px] items-center justify-center">
      <svg viewBox="0 0 272 272" className="absolute inset-0 -rotate-90">
        <circle cx="136" cy="136" r={r} fill="none" stroke="var(--sf2)" strokeWidth="12" />
        <circle
          cx="136"
          cy="136"
          r={r}
          fill="none"
          stroke="var(--g)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <div className="relative flex flex-col items-center gap-1">{children}</div>
    </div>
  );
}

/** Foco: pomodoro com presets, tarefa opcional, pausa automática e contagem do dia. */
export function FocusScreen() {
  const f = useFocus();
  const tasks = useTasks();
  const pending = (tasks.data ?? []).filter((t) => !t.done);
  const task = (tasks.data ?? []).find((t) => t.id === f.taskId);
  const total = (f.mode === "focus" ? f.minutes : BREAK_MINUTES) * 60_000;
  const idle = !f.running && !f.paused;
  const sessions = sessionsToday(f);

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card className="flex flex-col items-center gap-6 py-8">
        <div className="flex gap-2">
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={f.minutes === m}
              disabled={!idle || f.mode === "break"}
              onClick={() => f.setMinutes(m)}
              className={cn(
                "h-9 rounded-full px-4 text-sm leading-none font-medium transition-colors disabled:opacity-40",
                f.minutes === m ? "bg-ink text-bg" : "bg-sf2 text-mut hover:text-ink",
              )}
            >
              {m} min
            </button>
          ))}
        </div>

        <Ring pct={total ? f.left / total : 0}>
          <span className="text-sm leading-none text-mut">{f.mode === "focus" ? "Foco" : "Pausa"}</span>
          <span role="timer" aria-live="off" className="num text-[56px] leading-none font-semibold tracking-[-.03em]">
            {formatClock(f.left)}
          </span>
          {task ? <span className="max-w-[200px] truncate text-sm text-mut">{task.title}</span> : null}
        </Ring>

        <div className="flex gap-2">
          {f.running ? (
            <Button size="lg" variant="dark" onClick={() => f.pause()}>
              <Icon name="pause" />
              Pausar
            </Button>
          ) : f.paused ? (
            <Button size="lg" onClick={() => f.resume()}>
              <Icon name="play_arrow" />
              Continuar
            </Button>
          ) : (
            <Button size="lg" onClick={() => f.start()}>
              <Icon name="play_arrow" />
              {f.mode === "focus" ? "Iniciar" : "Iniciar pausa"}
            </Button>
          )}
          {!idle || f.mode === "break" ? (
            <Button size="lg" variant="secondary" onClick={() => f.reset()}>
              <Icon name="restart_alt" />
              Reiniciar
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="flex flex-col gap-5">
        <Card className="flex flex-col gap-3">
          <div className="text-[15px] font-semibold">No que você vai focar?</div>
          <Select
            value={f.taskId ?? NO_TASK}
            onValueChange={(v) => useFocusStore.setState({ taskId: v === NO_TASK ? null : v })}
          >
            <SelectTrigger icon="task_alt" aria-label="Tarefa do foco" className="w-full justify-start">
              <SelectValue placeholder="Sem tarefa">{task?.title ?? "Sem tarefa"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TASK}>Sem tarefa</SelectItem>
              {pending.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-[13px] leading-[1.45] text-mut">
            Ao terminar, você recebe um aviso e pode marcar a tarefa como concluída.
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-gs text-g">
            <Icon name="timer" size={24} />
          </div>
          <div>
            <div className="text-2xl leading-none font-semibold">{sessions}</div>
            <div className="mt-1 text-[13px] text-mut">
              {sessions === 1 ? "sessão de foco hoje" : "sessões de foco hoje"}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
