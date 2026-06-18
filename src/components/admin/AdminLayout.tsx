import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, FolderOpen, FileText, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth-guard";
import { KwkLoader } from "@/components/KwkLoader";
import { FloatingRail, type RailItem } from "@/components/FloatingRail";

const nav: RailItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/materiais", label: "Materiais", icon: FolderOpen },
  { to: "/admin/formularios", label: "Formulários", icon: FileText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth({ requireStaff: true });
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  if (auth.loading || !auth.userId || (auth.role !== "admin" && auth.role !== "consultora")) {
    return <KwkLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingRail items={nav} onSignOut={handleSignOut} badge="Admin" />

      <main className="md:pl-20 pt-14 md:pt-2 pb-24 md:pb-10">{children}</main>
    </div>
  );
}

import { ENCONTROS } from "@/lib/method-criar";
export const STAGES = ENCONTROS.map((e) => ({
  key: e.key,
  label: e.letterFull,
  short: e.letter,
}));
export type { StageKey } from "@/lib/method-criar";
