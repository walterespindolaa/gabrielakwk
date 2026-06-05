import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Map, FolderOpen, FileText, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth-guard";

const nav = [
  { to: "/area", label: "Jornada", icon: Map, exact: true },
  { to: "/area/materiais", label: "Materiais", icon: FolderOpen },
  { to: "/area/formularios", label: "Formulários", icon: FileText },
  { to: "/area/perfil", label: "Perfil", icon: User },
];

import { ENCONTROS } from "@/lib/method-criar";
export const STAGES = ENCONTROS.map((e) => ({
  key: e.key,
  label: e.letterFull,
  short: e.letter,
}));
export type { StageKey } from "@/lib/method-criar";

export function AreaLayout({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  if (auth.loading || !auth.userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Top header */}
      <header className="border-b border-border/60 bg-card sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold tracking-tight">KWK</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand font-semibold">
              Membros
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-brand-soft text-brand font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand transition-colors"
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border/60 flex justify-around py-2 px-2 pb-[env(safe-area-inset-bottom)]">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] font-semibold ${
                active ? "text-brand" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-8 md:py-12">{children}</main>
    </div>
  );
}
