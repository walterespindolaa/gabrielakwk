import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, type LucideIcon } from "lucide-react";

export interface RailItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface FloatingRailProps {
  items: RailItem[];
  onSignOut: () => void;
  badge?: string;
}

/**
 * Menu lateral fixo, full-height, encostado na borda (estilo CRIA/Learnify) na
 * marca KWK: trilho vinho com ícones creme, item ativo em destaque claro.
 * Desktop: rail fixo à esquerda. Mobile: top bar + barra inferior.
 */
export function FloatingRail({ items, onSignOut, badge }: FloatingRailProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const tooltip =
    "pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-card text-foreground border border-border/60 text-xs font-medium px-2.5 py-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-md z-10";

  return (
    <>
      {/* Desktop — rail fixo full-height */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 z-40 flex-col items-center gap-1.5 bg-brand py-4">
        <Link
          to="/"
          aria-label="Início"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-foreground/10 text-brand-foreground font-display text-xs tracking-wide mb-3 hover:bg-brand-foreground/20 transition-colors"
        >
          KW
        </Link>

        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-colors ${
                active
                  ? "bg-brand-foreground text-brand"
                  : "text-brand-foreground/60 hover:bg-brand-foreground/10 hover:text-brand-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={tooltip}>{item.label}</span>
            </Link>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={onSignOut}
          aria-label="Sair"
          className="group relative flex items-center justify-center w-11 h-11 rounded-2xl text-brand-foreground/60 hover:bg-brand-foreground/10 hover:text-brand-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className={tooltip}>Sair</span>
        </button>
      </aside>

      {/* Mobile — header fino */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-card/95 backdrop-blur border-b border-border/60 flex items-center gap-2 px-4">
        <span className="font-display text-base font-semibold text-brand">KWK</span>
        {badge && (
          <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">
            {badge}
          </span>
        )}
      </div>

      {/* Mobile — barra inferior */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border/60 flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] transition-colors ${
                active ? "text-brand" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onSignOut}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] text-muted-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </nav>
    </>
  );
}

export default FloatingRail;
