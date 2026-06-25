import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Sparkles, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { KwkLoader } from "@/components/KwkLoader";
import { SwotBoard } from "@/components/clientes/SwotBoard";
import { RichContent } from "@/components/clientes/RichContent";
import { normalizeSwot, EMPTY_SWOT, type SwotData } from "@/lib/client-workspace";

export const Route = createFileRoute("/area/diagnostico")({
  component: DiagnosticoPage,
});

function DiagnosticoPage() {
  const auth = useCurrentUser();
  const [panorama, setPanorama] = useState<string | null>(null);
  const [swot, setSwot] = useState<SwotData>(EMPTY_SWOT);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("client_diagnostico")
        .select("panorama, swot, pdf_path, pdf_name")
        .eq("cliente_id", auth.userId!)
        .maybeSingle();
      if (data) {
        setPanorama((data as any).panorama ?? null);
        setSwot(normalizeSwot((data as any).swot));
        const pdfPath = (data as any).pdf_path as string | null;
        if (pdfPath) {
          const { data: signed } = await supabase.storage
            .from("materiais")
            .createSignedUrl(pdfPath, 3600);
          if (signed?.signedUrl) setPdfUrl(signed.signedUrl);
          setPdfName((data as any).pdf_name ?? "Diagnóstico.pdf");
        }
        setHasData(true);
      }
      setLoading(false);
    })();
  }, [auth.userId]);

  if (auth.loading || loading) return <KwkLoader fullScreen={false} label="Carregando diagnóstico" />;

  const swotHasItems =
    swot.forcas.length + swot.fraquezas.length + swot.oportunidades.length + swot.ameacas.length > 0;

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand font-semibold">
          Consultoria CRIAR
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mt-1">Seu diagnóstico</h1>
        <p className="text-muted-foreground text-sm mt-2">
          O ponto de partida da sua marca: onde você está hoje e o que vamos trabalhar.
        </p>
      </div>

      {!hasData ? (
        <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl mt-4">Seu diagnóstico está sendo preparado</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Assim que a Gabriela finalizar a análise da sua marca, ele aparece aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pdfUrl ? (
            /* PDF anexado pela Gabriela — substitui o diagnóstico gerado */
            <section className="bg-card border border-border/60 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-display text-2xl">Seu diagnóstico</h2>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand text-brand-foreground px-4 py-2 text-xs font-semibold hover:bg-brand/90 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar PDF
                </a>
              </div>
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-[75vh] rounded-xl border border-border/60"
              >
                <p className="text-sm text-muted-foreground p-4">
                  Não foi possível exibir o PDF aqui.{" "}
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline">
                    Clique para abrir {pdfName}
                  </a>
                  .
                </p>
              </object>
            </section>
          ) : (
            <>
              {/* Panorama */}
              {panorama && (
                <section className="bg-card border border-border/60 rounded-2xl p-6">
                  <h2 className="font-display text-2xl mb-3">Panorama geral</h2>
                  <RichContent html={panorama} className="text-sm leading-relaxed text-foreground/90" />
                </section>
              )}

              {/* SWOT */}
              {swotHasItems && (
                <div id="swot" className="scroll-mt-20">
                  <SwotBoard swot={swot} />
                </div>
              )}
            </>
          )}

          {/* Briefing link */}
          <Link
            to="/area/formularios"
            className="flex items-center gap-3 bg-surface-alt border border-brand/15 rounded-2xl p-5 hover:border-brand/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-brand text-brand-foreground flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Briefing respondido</p>
              <p className="text-xs text-muted-foreground">Veja suas respostas nos formulários.</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
