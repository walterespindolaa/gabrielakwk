import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, FolderOpen, FileText, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth-guard";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/materiais", label: "Materiais", icon: FolderOpen },
  { to: "/admin/formularios", label: "Formulários", icon: FileText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth({ requireStaff: true });
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  if (auth.loading || !auth.userId || (auth.role !== "admin" && auth.role !== "consultora")) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const SidebarContent = (
    <>
      <div className="px-5 py-6 border-b border-border/60">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-xl font-semibold tracking-tight">KWK</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand font-semibold">
            Admin
          </span>
        </Link>
        {auth.fullName && (
          <p className="mt-3 text-xs text-muted-foreground truncate">
            {auth.fullName} · <span className="capitalize">{auth.role}</span>
          </p>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
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
      <div className="p-3 border-t border-border/60">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-card sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-card border-b border-border/60 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold">KWK</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand font-semibold">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-card flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}

export const STAGES = [
  { key: "conectar", label: "Conectar", short: "C" },
  { key: "reconhecer", label: "Reconhecer", short: "R" },
  { key: "identificar", label: "Identificar", short: "I" },
  { key: "ativar", label: "Ativar", short: "A" },
  { key: "reorganizar", label: "Reorganizar", short: "R" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];
