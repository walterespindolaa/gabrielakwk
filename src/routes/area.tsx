import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/area")({
  component: AreaPage,
  head: () => ({
    meta: [
      { title: "Sua jornada — Consultoria CRIAR" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AreaPage() {
  const auth = useRequireAuth();

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (auth.loading || !auth.userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  const firstName = auth.fullName?.split(" ")[0] ?? "olá";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-semibold tracking-tight">
            KWK
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

      <main className="max-w-5xl mx-auto px-5 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">
          Sistema CRIA
        </p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight" style={{ lineHeight: "1.15" }}>
          Olá, <span className="italic text-brand">{firstName}</span>.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Sua área de membros está pronta para receber os materiais da sua consultoria. Em breve, novos conteúdos chegam aqui.
        </p>

        <div className="mt-10 rounded-3xl border border-border/60 bg-card p-8 sm:p-10 flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="font-display text-xl font-medium mb-2">
              Sua jornada CRIAR começa aqui.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quando a Gabriela liberar um novo material ou formulário, ele aparece nesta tela com acesso imediato.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
