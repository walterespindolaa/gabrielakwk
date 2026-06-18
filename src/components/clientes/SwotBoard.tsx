import { SWOT_QUADRANTS, type SwotData } from "@/lib/client-workspace";

/**
 * Renderiza a análise SWOT em 4 quadrantes, no estilo do slide da marca:
 * Forças e Ameaças em vinho cheio, Fraquezas e Oportunidades em cartão claro.
 * Somente leitura — usado no admin (preview) e na área do cliente.
 */
export function SwotBoard({ swot, title = "Análise SWOT" }: { swot: SwotData; title?: string }) {
  return (
    <div className="rounded-2xl border border-brand/20 bg-surface-alt p-5 sm:p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand font-semibold">
            Onde você está hoje
          </p>
          <h3 className="font-display text-2xl sm:text-3xl text-foreground mt-1">{title}</h3>
        </div>
        <span className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Diagnóstico de marca
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {SWOT_QUADRANTS.map((q) => {
          const items = swot[q.key];
          const filled = q.tone === "fill";
          return (
            <div
              key={q.key}
              className={`rounded-xl p-5 border ${
                filled
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-card text-foreground border-brand/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    filled
                      ? "bg-brand-foreground/15 text-brand-foreground"
                      : "bg-brand text-brand-foreground"
                  }`}
                >
                  {q.letter}
                </span>
                <div>
                  <p className="font-display text-xl leading-none">{q.title}</p>
                  <p
                    className={`text-[10px] uppercase tracking-[0.18em] mt-1 ${
                      filled ? "text-brand-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {q.scope}
                  </p>
                </div>
              </div>

              {items.length === 0 ? (
                <p
                  className={`text-sm italic ${
                    filled ? "text-brand-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  Sem itens ainda.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {items.map((it, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-snug">
                      <span className={filled ? "text-brand-foreground/60" : "text-brand"}>•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SwotBoard;
