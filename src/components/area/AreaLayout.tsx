import { useNavigate } from "@tanstack/react-router";
import { Map, FolderOpen, FileText, User, Compass, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth-guard";
import { KwkLoader } from "@/components/KwkLoader";
import { FloatingRail, type RailItem } from "@/components/FloatingRail";

const nav: RailItem[] = [
  { to: "/area", label: "Jornada", icon: Map, exact: true },
  { to: "/area/demandas", label: "Demandas", icon: ClipboardList },
  { to: "/area/diagnostico", label: "Diagnóstico", icon: Compass },
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

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  if (auth.loading || !auth.userId) {
    return <KwkLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingRail items={nav} onSignOut={handleSignOut} badge="Membros" />

      <main className="md:pl-20 pt-14 md:pt-2 pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto px-5 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
