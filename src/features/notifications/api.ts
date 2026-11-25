import { z } from "zod";

import { get, send } from "@/lib/api/client";

export const severitySchema = z.enum(["urgent", "important", "info"]);
export type Severity = z.infer<typeof severitySchema>;

export const notificationSchema = z.object({
  id: z.string(),
  kind: z.string(),
  severity: severitySchema,
  title: z.string(),
  body: z.string(),
  url: z.string().nullish(),
  entityId: z.string().nullish(),
  read: z.boolean(),
  createdAt: z.string(),
});
export type AppNotification = z.infer<typeof notificationSchema>;

export const notificationListSchema = z.object({
  items: z.array(notificationSchema),
  unreadCount: z.number(),
});

export const notificationSummarySchema = z.object({ unread: z.number(), urgent: z.number() });
export type NotificationSummary = z.infer<typeof notificationSummarySchema>;

export type NotificationFilter = "all" | "unread" | "important";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (filter: NotificationFilter) => ["notifications", "list", filter] as const,
  summary: ["notifications", "summary"] as const,
};

export const getNotifications = (filter: NotificationFilter) =>
  get("/notifications", notificationListSchema, { filter });
export const getNotificationSummary = () => get("/notifications/summary", notificationSummarySchema);
/** Recalcula na hora (depois de uma ação rápida que pode ter resolvido o alerta). */
export const refreshNotifications = () => send("post", "/notifications/refresh", notificationSummarySchema);
export const markNotificationRead = (id: string) => send("post", `/notifications/${id}/read`, z.unknown());
export const markAllNotificationsRead = () => send("post", "/notifications/read-all", z.unknown());
export const dismissNotification = (id: string) => send("post", `/notifications/${id}/dismiss`, z.unknown());
