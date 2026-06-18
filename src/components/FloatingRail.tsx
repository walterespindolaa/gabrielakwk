import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, type LucideIcon } from "lucide-react";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";

export interface RailItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface FloatingRailProps {
  items: RailItem[];
  onSignOut: () => void;
  /** Pequeno selo de contexto (ex.: "Admin" / "Membros") — usado no mobile. */
  badge?: string;
}

/**
 * Menu lateral flutuante e enxuto (estilo CRIA, na marca KWK).
 * Desktop: pill claro descolado da borda, centralizado verticalmente.
 * Mobile: barra inferior com ícones.
 */
export function FloatingRail({ items, onSignOut, badge }: FloatingRailProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <>
      {/* Desktop — rail flutuante */}
      <aside className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1.5 bg-card/95 backdrop-blur border border-border/60 rounded-[26px] shadow-lg shadow-brand/5 px-2 py-3">
        <Link
          to="/"
          aria-label="Início"
          className="flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-brand-soft/50 transition-colors mb-1"
        >
          <img src={monogramAsset.url} alt="KWK" className="h-7 w-auto" />
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
                  ? "bg-brand-soft text-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-brand text-brand-foreground text-xs font-medium px-2.5 py-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-md">
                {item.label}
              </span>
            </Link>
          );
        })}

        <div className="w-7 h-px bg-border/70 my-1" />

        <button
          onClick={onSignOut}
          aria-label="Sair"
          className="group relative flex items-center justify-center w-11 h-11 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-brand text-brand-foreground text-xs font-medium px-2.5 py-1.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-md">
            Sair
          </span>
        </button>
      </aside>

      {/* Mobile — header fino */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-card/95 backdrop-blur border-b border-border/60 flex items-center gap-2 px-4">
        <img src={monogramAsset.url} alt="KWK" className="h-8 w-auto" />
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
