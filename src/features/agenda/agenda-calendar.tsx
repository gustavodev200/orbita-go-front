"use client";

import { useMemo, useRef } from "react";
import FullCalendar, { type CalendarRef, type DatesSetInfo } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import ptBrLocale from "@fullcalendar/react/locales/pt-br";
import breezyTheme from "@fullcalendar/react/themes/breezy";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/breezy/theme.css";
import "./calendar-palette.css";

import { useIsDesktop } from "@/hooks/use-media-query";
import { toast } from "sonner";

import { AGENDA_COLOR, isPastSlot, slotMinTimeFor, type AgendaItem } from "./agenda-items";

/** `Date` local do calendário → "YYYY-MM-DD" (o calendário trabalha em dias locais). */
function toISODay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "HH:mm" + 30 min (sem passar da meia-noite). */
function plus30(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + 30, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Calendário (FullCalendar v7, tema breezy com a paleta do app), abre no Dia: Mês,
 * Semana (desktop), Dia (por hora) e Lista. Itens com horário viram blocos
 * de 30 min nas visões por hora; o resto fica na faixa "dia inteiro".
 */
export default function AgendaCalendar({
  items,
  selected,
  onSelectDay,
  onSelectSlot,
  onRangeChange,
}: {
  items: AgendaItem[];
  selected: string;
  onSelectDay: (iso: string) => void;
  /** Toque num horário vazio das visões por hora. */
  onSelectSlot: (iso: string, time: string) => void;
  onRangeChange: (start: string, end: string) => void;
}) {
  const desktop = useIsDesktop();
  const calendarRef = useRef<CalendarRef>(null);
  /** Visão do último `datesSet` — distingue "trocou de visão" de "navegou na mesma". */
  const viewRef = useRef("timeGridDay");

  const events = useMemo(
    () =>
      items.map((i) => ({
        id: i.key,
        title: i.title,
        start: i.time ? `${i.date}T${i.time}` : i.date,
        end: i.time ? `${i.date}T${plus30(i.time)}` : undefined,
        allDay: !i.time,
        color: AGENDA_COLOR[i.kind],
        className: i.done ? "opacity-50 line-through" : undefined,
        extendedProps: { date: i.date, color: AGENDA_COLOR[i.kind] },
      })),
    [items],
  );

  return (
    <div className="orbita-calendar">
      <FullCalendar
        ref={calendarRef}
        initialDate={selected}
        plugins={[breezyTheme, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        locale={ptBrLocale}
        timeZone="local"
        initialView="timeGridDay"
        headerToolbar={{
          start: "title",
          end: desktop ? "dayGridMonth,timeGridWeek,timeGridDay,listWeek prev,today,next" : "prev,today,next",
        }}
        footerToolbar={desktop ? false : { center: "dayGridMonth,timeGridDay,listWeek" }}
        buttons={{
          dayGridMonth: { text: "Mês", hint: "Ver mês" },
          timeGridWeek: { text: "Semana", hint: "Ver semana" },
          timeGridDay: { text: "Dia", hint: "Ver dia" },
          listWeek: { text: "Lista", hint: "Ver lista da semana" },
        }}
        navLinks
        slotMinTime={slotMinTimeFor(items)}
        slotHeaderFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        scrollTime="08:00:00"
        allDayText="dia todo"
        nowIndicator
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={desktop ? 3 : true}
        borderless
        views={{ dayGridMonth: { eventDisplay: desktop ? "block" : "list-item" } }}
        // No celular a célula do mês é estreita: só o ponto colorido (o texto vai pro painel do dia).
        eventContent={(info) =>
          !desktop && info.view.type === "dayGridMonth" ? (
            <span
              aria-label={info.event.title}
              className="mx-auto block size-1.5 rounded-full"
              style={{ background: String(info.event.extendedProps.color) }}
            />
          ) : (
            <span className="truncate px-1">{info.event.title}</span>
          )
        }
        events={events}
        dateClick={(info) => {
          const day = info.dateStr.slice(0, 10);
          const time = info.dateStr.slice(11, 16);
          if (info.allDay) onSelectDay(day);
          else if (isPastSlot(day, time)) {
            onSelectDay(day);
            toast.message("Esse horário já passou — escolha um horário futuro para o lembrete.");
          } else onSelectSlot(day, time);
        }}
        eventClick={(info) => onSelectDay(String(info.event.extendedProps.date))}
        dayCellClass={(info) =>
          info.view.type === "dayGridMonth" && toISODay(info.date) === selected ? "orbita-selected-day" : ""
        }
        datesSet={(info: DatesSetInfo) => {
          const type = info.view.type;
          const switched = type !== viewRef.current;
          viewRef.current = type;
          const start = toISODay(info.start);
          const end = toISODay(info.end);
          onRangeChange(start, end);
          // Ao entrar numa visão por hora, abre no dia escolhido (não em "hoje").
          if (switched && type.startsWith("timeGrid") && (selected < start || selected >= end)) {
            calendarRef.current?.getApi().gotoDate(selected);
            return;
          }
          // Navegar (‹ ›) na visão Dia muda o dia do painel.
          if (type === "timeGridDay" && !switched) onSelectDay(start);
        }}
        noEventsContent="Nada marcado nesta semana."
      />
    </div>
  );
}
