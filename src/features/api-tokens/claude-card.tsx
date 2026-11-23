"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Icon } from "@/components/orbita/icon";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useApiMutation } from "@/features/rewards/use-api-mutation";
import type { CreatedApiToken } from "@/lib/api/schemas";
import { apiTokenKeys, claudeMcpCommand, createApiToken, deleteApiToken, getApiTokens } from "./api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copiado");
  } catch {
    toast.error("Não consegui copiar — selecione e copie manualmente");
  }
}

/** Conecta o Claude (Claude Code) ao órbitaGO via MCP com um token pessoal. */
export function ClaudeConnectCard() {
  const tokens = useQuery({ queryKey: apiTokenKeys.all, queryFn: getApiTokens });
  const [created, setCreated] = useState<CreatedApiToken | null>(null);
  const create = useApiMutation({
    mutationFn: () => createApiToken("Claude Code"),
    invalidate: [apiTokenKeys.all],
    onSuccess: (t) => setCreated(t),
  });
  const revoke = useApiMutation({
    mutationFn: (id: string) => deleteApiToken(id),
    invalidate: [apiTokenKeys.all],
    message: () => "Token revogado",
    onSuccess: (t) => setCreated((c) => (c?.id === t.id ? null : c)),
  });
  const list = tokens.data ?? [];

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gs text-g">
          <Icon name="smart_toy" size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle>Conectar ao Claude</CardTitle>
          <p className="m-0 mt-1 text-[13px] leading-[1.45] text-mut">
            O Claude salva sozinho os flashcards de inglês das suas conversas. Gere um token e rode o comando no terminal.
          </p>
        </div>
      </div>

      {created ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-sf2 p-3">
          <span className="text-[13px] font-semibold text-ink">Copie agora — o token não aparece de novo.</span>
          <code className="block overflow-x-auto rounded-xl bg-bg p-2.5 text-[12px] leading-[1.5] break-all whitespace-pre-wrap">
            {claudeMcpCommand(created.token)}
          </code>
          <div className="flex flex-wrap gap-2">
            <Button size="xs" onClick={() => copy(claudeMcpCommand(created.token))}>
              <Icon name="content_copy" size={16} />
              Copiar comando
            </Button>
            <Button size="xs" variant="secondary" onClick={() => copy(created.token)}>
              Copiar só o token
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setCreated(null)}>
              Pronto
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="secondary" className="self-start" disabled={create.isPending} onClick={() => create.mutate()}>
          <Icon name="key" size={18} />
          Gerar token
        </Button>
      )}

      {list.length ? (
        <div className="flex flex-col [&>*+*]:border-t [&>*+*]:border-sf2">
          {list.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {t.name} <span className="font-mono text-xs text-mut">{t.prefix}…</span>
                </div>
                <div className="text-xs text-mut">
                  Criado {formatDate(t.createdAt)} · {t.lastUsedAt ? `usado ${formatDate(t.lastUsedAt)}` : "nunca usado"}
                </div>
              </div>
              <Button size="xs" variant="secondary-danger" disabled={revoke.isPending} onClick={() => revoke.mutate(t.id)}>
                Revogar
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
