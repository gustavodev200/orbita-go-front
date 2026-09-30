import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/features/auth/auth";
import { getServerSupabase } from "@/lib/supabase/server";

/** Retorno do OAuth do Google: troca o `code` PKCE pela sessão (cookies). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, origin));
    }
  }

  const login = new URL("/login", origin);
  login.searchParams.set("error", "1");
  if (next !== "/") login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}
