"use client";

import { useMemo } from "react";
import FullCalendar, { type DatesSetInfo } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import ptBrLocale from "@fullcalendar/react/locales/pt-br";
import breezyTheme from "@fullcalendar/react/themes/breezy";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/breezy/theme.css";
import "./calendar-palette.css";

import { useIsDesktop } from "@/hooks/use-media-query";
import { AGENDA_COLOR, type AgendaItem } from "./agenda-items";

/** `Date` local do calendário → "YYYY-MM-DD" (o calendário trabalha em dias locais). */
function toISODay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calendário (FullCalendar v7, tema breezy com a paleta do app). Mês no
 * desktop; no celular, mês com pontinhos e a lista da semana como opção.
 */
export default function AgendaCalendar({
  items,
  selected,
  onSelectDay,
  onRangeChange,
}: {
  items: AgendaItem[];
  selected: string;
  onSelectDay: (iso: string) => void;
  onRangeChange: (start: string, end: string) => void;
}) {
  const desktop = useIsDesktop();

  const events = useMemo(
    () =>
      items.map((i) => ({
        id: i.key,
        title: i.time ? `${i.time} ${i.title}` : i.title,
        start: i.date,
        allDay: true,
        color: AGENDA_COLOR[i.kind],
        className: i.done ? "opacity-50 line-through" : undefined,
        extendedProps: { date: i.date, color: AGENDA_COLOR[i.kind] },
      })),
    [items],
  );

  return (
    <div className="orbita-calendar">
      <FullCalendar
        plugins={[breezyTheme, dayGridPlugin, listPlugin, interactionPlugin]}
        locale={ptBrLocale}
        timeZone="local"
        initialView="dayGridMonth"
        headerToolbar={{ start: "title", end: desktop ? "dayGridMonth,listWeek prev,today,next" : "prev,next" }}
        footerToolbar={desktop ? false : { center: "dayGridMonth,listWeek" }}
        buttons={{ listWeek: { text: "Semana" } }}
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={desktop ? 3 : true}
        borderless
        eventDisplay={desktop ? "block" : "list-item"}
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
        dateClick={(info) => onSelectDay(info.dateStr.slice(0, 10))}
        eventClick={(info) => onSelectDay(String(info.event.extendedProps.date))}
        dayCellClass={(info) => (toISODay(info.date) === selected ? "orbita-selected-day" : "")}
        datesSet={(info: DatesSetInfo) => onRangeChange(toISODay(info.start), toISODay(info.end))}
        noEventsContent="Nada marcado nesta semana."
      />
    </div>
  );
}
