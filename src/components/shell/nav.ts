export type NavItem = { href: string; label: string; icon: string; title: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: "home", title: "Início" },
  { href: "/agenda", label: "Agenda", icon: "calendar_month", title: "Agenda" },
  { href: "/tarefas", label: "Tarefas", icon: "task_alt", title: "Tarefas" },
  { href: "/financas", label: "Finanças", icon: "account_balance_wallet", title: "Finanças" },
  { href: "/habitos", label: "Hábitos", icon: "self_improvement", title: "Hábitos" },
  { href: "/perfil", label: "Perfil", icon: "person", title: "Perfil" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function titleFor(pathname: string) {
  return NAV_ITEMS.find((n) => isActive(pathname, n.href))?.title ?? "";
}
