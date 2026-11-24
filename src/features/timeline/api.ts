import { get, send } from "@/lib/api/client";
import { timelineEventSchema, timelineSchema, type LifeEventKind } from "@/lib/api/schemas";

export const timelineKeys = { all: ["timeline"] as const };

export type LifeEventInput = {
  title: string;
  description: string | null;
  date: string;
  kind: LifeEventKind;
  icon: string;
};

export const getTimeline = () => get("/timeline", timelineSchema);
export const createLifeEvent = (input: LifeEventInput) => send("post", "/timeline/events", timelineEventSchema, input);
export const updateLifeEvent = (id: string, input: Partial<LifeEventInput>) =>
  send("patch", `/timeline/events/${id}`, timelineEventSchema, input);
export const deleteLifeEvent = (id: string) => send("delete", `/timeline/events/${id}`, timelineEventSchema);
