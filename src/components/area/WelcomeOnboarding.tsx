import { useEffect, useState } from "react";
import { ArrowRight, Map, Compass, Lightbulb, FolderOpen } from "lucide-react";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";

const KEY = "kwk_welcome_seen";

const ITEMS = [
  { icon: Map, title: "Jornada", desc: "Seus encontros e o que fazer em cada etapa." },
  { icon: Compass, title: "Diagnóstico", desc: "O panorama e a análise SWOT da sua marca." },
  { icon: Lightbulb, title: "Conteúdo", desc: "Seu plano editorial e banco de ideias." },
  { icon: FolderOpen, title: "Materiais e Relatório", desc: "Tudo que construímos juntas, sempre à mão." },
];

/** Boas-vindas no primeiro acesso da cliente (1x, salvo no navegador). */
export function WelcomeOnboarding({ firstName }: { firstName: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(KEY)) setOpen(true);
  }, []);

  function close() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card border border-border/60 rounded-3xl w-full max-w-md p-8">
        <div className="text-center">
          <img src={monogramAsset.url} alt="KWK" className="h-12 w-auto mx-auto" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand font-semibold mt-4">
            Consultoria CRIAR
          </p>
          <h2 className="font-display text-2xl tracking-tight mt-1">
            Bem-vinda, {firstName}!
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Esse é o seu espaço. Tudo o que vamos construir na consultoria fica aqui, organizado.
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <li key={it.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{it.title}</div>
                  <div className="text-xs text-muted-foreground">{it.desc}</div>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          onClick={close}
          className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-brand text-brand-foreground rounded-full py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Começar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default WelcomeOnboarding;
