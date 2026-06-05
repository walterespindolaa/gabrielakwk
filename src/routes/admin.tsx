import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Users, FileText, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Consultoria CRIAR" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminPage() {
  const auth = useRequireAuth({ requireStaff: true });

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (auth.loading || !auth.userId || (auth.role !== "admin" && auth.role !== "consultora")) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const cards = [
    { icon: Users, title: "Clientes", desc: "Convide, organize e acompanhe cada cliente." },
    { icon: FolderOpen, title: "Materiais", desc: "Envie PDFs, vídeos e links — atribua por cliente." },
    { icon: FileText, title: "Formulários", desc: "Crie formulários por etapa do método CRIAR." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-display text-xl font-semibold tracking-tight">KWK</span>
            <span className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Admin</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-12">
        <h1 className="font-display text-3xl sm:text-4xl font-medium tracking-tight" style={{ lineHeight: "1.15" }}>
          Painel da consultora
        </h1>
        <p className="mt-3 text-muted-foreground">
          Gerencie clientes, materiais e formulários do Método CRIAR.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border/60 bg-card p-6 hover:border-brand/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center mb-4">
                <c.icon className="w-5 h-5 text-brand" />
              </div>
              <h2 className="font-display text-lg font-medium mb-1">{c.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground/70">
                Em breve
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
