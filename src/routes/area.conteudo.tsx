import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lightbulb, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { KwkLoader } from "@/components/KwkLoader";
import { CONTENT_STATUS, type ContentItem } from "@/lib/client-workspace";

export const Route = createFileRoute("/area/conteudo")({
  component: ConteudoPage,
});

function ConteudoPage() {
  const auth = useCurrentUser();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("client_content")
        .select("*")
        .eq("cliente_id", auth.userId!)
        .order("scheduled_for", { ascending: true, nullsFirst: false });
      setItems((data as ContentItem[]) ?? []);
      setLoading(false);
    })();
  }, [auth.userId]);

  if (auth.loading || loading) return <KwkLoader fullScreen={false} label="Carregando conteúdo" />;

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand font-semibold">Consultoria CRIAR</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mt-1">Plano editorial</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Suas ideias e o cronograma de conteúdo construídos na consultoria.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl mt-4">Seu plano está sendo construído</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Conforme avançamos nos encontros, suas ideias e o cronograma aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {CONTENT_STATUS.map((col) => {
            const colItems = items.filter((i) => i.status === col.key);
            if (colItems.length === 0) return null;
            return (
              <section key={col.key} className="bg-card border border-border/60 rounded-2xl p-5">
                <h2 className="font-display text-lg mb-3">{col.label}</h2>
                <ul className="space-y-2.5">
                  {colItems.map((c) => (
                    <li key={c.id} className="rounded-xl border border-border/60 p-3">
                      <p className="text-sm font-medium">{c.titulo}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-muted-foreground">
                        {c.formato && <span className="bg-muted px-2 py-0.5 rounded-full">{c.formato}</span>}
                        {c.pilar && <span>{c.pilar}</span>}
                        {c.scheduled_for && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(c.scheduled_for + "T00:00").toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
