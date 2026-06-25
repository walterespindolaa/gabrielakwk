import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { KwkLoader } from "@/components/KwkLoader";
import { SwotBoard } from "@/components/clientes/SwotBoard";
import { RichContent } from "@/components/clientes/RichContent";
import { normalizeSwot, EMPTY_SWOT, type SwotData } from "@/lib/client-workspace";
import { ENCONTROS } from "@/lib/method-criar";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";

export const Route = createFileRoute("/area/relatorio")({
  component: RelatorioPage,
});

function RelatorioPage() {
  const auth = useCurrentUser();
  const [panorama, setPanorama] = useState<string | null>(null);
  const [swot, setSwot] = useState<SwotData>(EMPTY_SWOT);
  const [encontros, setEncontros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const uid = auth.userId!;
      const [diag, enc] = await Promise.all([
        (supabase as any).from("client_diagnostico").select("panorama, swot").eq("cliente_id", uid).maybeSingle(),
        supabase.from("encontros").select("numero, status, notes, next_steps").eq("cliente_id", uid).order("numero"),
      ]);
      setPanorama((diag as any)?.data?.panorama ?? null);
      setSwot(normalizeSwot((diag as any)?.data?.swot));
      setEncontros((enc.data as any[]) ?? []);
      setLoading(false);
    })();
  }, [auth.userId]);

  if (auth.loading || loading) return <KwkLoader fullScreen={false} label="Montando o relatório" />;

  const swotHasItems =
    swot.forcas.length + swot.fraquezas.length + swot.oportunidades.length + swot.ameacas.length > 0;
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Ações (não imprime) */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand font-semibold">Consultoria CRIAR</p>
          <h1 className="font-display text-2xl tracking-tight mt-1">Relatório de marca</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90"
        >
          <Download className="w-4 h-4" />
          Baixar PDF
        </button>
      </div>

      {/* Documento */}
      <div id="relatorio" className="bg-card border border-border/60 rounded-2xl print:border-0 print:rounded-none overflow-hidden">
        {/* Capa */}
        <div className="bg-brand text-brand-foreground px-8 py-10 text-center">
          <img src={monogramAsset.url} alt="KWK" className="h-14 w-auto mx-auto opacity-90" />
          <div className="mt-5 text-[10px] uppercase tracking-[0.3em] opacity-70">Método CRIAR · Relatório de marca</div>
          <h2 className="font-display text-3xl mt-2">{auth.fullName ?? "Cliente"}</h2>
          <p className="text-sm opacity-80 mt-2">{hoje}</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Panorama */}
          {panorama && (
            <section>
              <h3 className="font-display text-xl tracking-tight mb-2">Panorama geral</h3>
              <RichContent html={panorama} className="text-sm leading-relaxed text-foreground/90" />
            </section>
          )}

          {/* SWOT */}
          {swotHasItems && (
            <section>
              <SwotBoard swot={swot} />
            </section>
          )}

          {/* Encontros */}
          <section>
            <h3 className="font-display text-xl tracking-tight mb-3">A jornada</h3>
            <div className="space-y-3">
              {ENCONTROS.map((e) => {
                const enc = encontros.find((x) => x.numero === e.numero);
                const done = enc?.status === "realizado";
                return (
                  <div key={e.numero} className="rounded-xl border border-border/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-display">
                        {e.letter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          Encontro {e.numero} · {e.letterFull}
                        </div>
                        <div className="font-display text-base">{e.title}</div>
                      </div>
                      {done && <CheckCircle2 className="w-4 h-4 text-success" />}
                    </div>
                    {enc?.notes && <p className="text-sm text-foreground/80 mt-2 whitespace-pre-wrap">{enc.notes}</p>}
                    {enc?.next_steps && (
                      <div className="mt-2 text-sm">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-brand">Próximos passos</span>
                        <p className="text-foreground/80 whitespace-pre-wrap">{enc.next_steps}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Fechamento */}
          <section className="border-t border-border/60 pt-6 text-center">
            <p className="font-display text-lg">Agora a casa é sua — e você sabe como cuidar dela.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Gabriela Kawikioni · Estrategista Social Media · Método CRIAR
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
