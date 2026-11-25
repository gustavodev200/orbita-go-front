export type NavItem = {
  href: string;
  label: string;
  icon: string;
  title: string;
  /** Rótulo curto para a pílula mobile (quando o normal não cabe). */
  short?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: "home", title: "Início" },
  { href: "/agenda", label: "Agenda", icon: "calendar_month", title: "Agenda" },
  { href: "/notificacoes", label: "Notificações", icon: "notifications", title: "Notificações", short: "Alertas" },
  { href: "/tarefas", label: "Tarefas", icon: "task_alt", title: "Tarefas" },
  { href: "/notas", label: "Notas", icon: "sticky_note_2", title: "Notas" },
  { href: "/financas", label: "Finanças", icon: "account_balance_wallet", title: "Finanças" },
  { href: "/metas", label: "Metas", icon: "flag", title: "Metas" },
  { href: "/habitos", label: "Hábitos", icon: "self_improvement", title: "Hábitos" },
  { href: "/desafios", label: "Desafios", icon: "sports_score", title: "Desafios" },
  { href: "/foco", label: "Foco", icon: "timer", title: "Foco" },
  { href: "/vocabulario", label: "Inglês", icon: "translate", title: "Vocabulário" },
  { href: "/linha-do-tempo", label: "Linha do tempo", icon: "timeline", title: "Linha do tempo", short: "Trajetória" },
  { href: "/perfil", label: "Perfil", icon: "person", title: "Perfil" },
];

/** Barra mobile: cabem 4 destinos fixos; o resto vai pro menu "Mais". */
const PRIMARY_HREFS = new Set(["/", "/agenda", "/tarefas", "/financas"]);
export const MOBILE_PRIMARY = NAV_ITEMS.filter((n) => PRIMARY_HREFS.has(n.href));
export const MOBILE_MORE = NAV_ITEMS.filter((n) => !PRIMARY_HREFS.has(n.href));

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function titleFor(pathname: string) {
  return NAV_ITEMS.find((n) => isActive(pathname, n.href))?.title ?? "";
}
