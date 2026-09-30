export type NavItem = { href: string; label: string; icon: string; title: string };

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Hoje", icon: "sunny", title: "Hoje" },
  { href: "/financas", label: "Finanças", icon: "account_balance_wallet", title: "Finanças" },
  { href: "/tarefas", label: "Tarefas", icon: "task_alt", title: "Tarefas" },
  { href: "/lembretes", label: "Lembretes", icon: "notifications_active", title: "Lembretes" },
  { href: "/perfil", label: "Perfil", icon: "face", title: "Perfil" },
];

/** Módulos bloqueados na sidebar ("Em breve"). */
export const SOON_ITEMS = [
  { label: "Saúde", icon: "favorite" },
  { label: "Hábitos", icon: "repeat" },
  { label: "Estudos", icon: "school" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function titleFor(pathname: string) {
  return NAV_ITEMS.find((n) => isActive(pathname, n.href))?.title ?? "";
}
