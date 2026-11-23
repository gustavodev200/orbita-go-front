import { z } from "zod";

import { get, send } from "@/lib/api/client";
import { apiTokenSchema, createdApiTokenSchema } from "@/lib/api/schemas";
import { env } from "@/lib/env";

export const apiTokenKeys = { all: ["api-tokens"] as const };

export const getApiTokens = () => get("/api-tokens", z.array(apiTokenSchema));
export const createApiToken = (name: string) => send("post", "/api-tokens", createdApiTokenSchema, { name });
export const deleteApiToken = (id: string) => send("delete", `/api-tokens/${id}`, apiTokenSchema);

/** Comando para registrar o servidor MCP no Claude Code (escopo do usuário: vale em qualquer pasta). */
export function claudeMcpCommand(token: string, apiUrl = env.apiUrl) {
  const url = `${apiUrl.replace(/\/$/, "")}/mcp`;
  return `claude mcp add --transport http --scope user orbitago ${url} --header "Authorization: Bearer ${token}"`;
}
