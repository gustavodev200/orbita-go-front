"use client";

import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";

import { getQueryClient } from "@/lib/query-client";
import { getSupabase } from "@/lib/supabase/client";

interface SessionState {
  session: Session | null;
  isPending: boolean;
}

const PENDING: SessionState = { session: null, isPending: true };

let state: SessionState = PENDING;
let knownUserId: string | null | undefined;
const listeners = new Set<() => void>();
let listening = false;

function apply(session: Session | null) {
  const userId = session?.user.id ?? null;
  // Troca de conta na mesma aba: limpa o cache (queries não têm o userId na key).
  if (knownUserId !== undefined && knownUserId !== userId) getQueryClient().clear();
  knownUserId = userId;
  state = { session, isPending: false };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!listening) {
    listening = true;
    const supabase = getSupabase();
    if (!supabase) {
      apply(null);
    } else {
      supabase.auth.getSession().then(({ data }) => apply(data.session));
      supabase.auth.onAuthStateChange((_e, session) => apply(session));
    }
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, () => state, () => PENDING);
}
