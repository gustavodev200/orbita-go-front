export type NavItem = { href: string; label: string; icon: string; title: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: "home", title: "Início" },
  { href: "/agenda", label: "Agenda", icon: "calendar_month", title: "Agenda" },
  { href: "/tarefas", label: "Tarefas", icon: "task_alt", title: "Tarefas" },
  { href: "/financas", label: "Finanças", icon: "account_balance_wallet", title: "Finanças" },
  { href: "/habitos", label: "Hábitos", icon: "self_improvement", title: "Hábitos" },
  { href: "/foco", label: "Foco", icon: "timer", title: "Foco" },
  { href: "/vocabulario", label: "Inglês", icon: "translate", title: "Vocabulário" },
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
