import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { KwkLoader } from "@/components/KwkLoader";
import { DEMANDA_STATUS, type Demanda, type DemandaStatus } from "@/lib/client-workspace";

export const Route = createFileRoute("/area/demandas")({
  component: DemandasPage,
});

const STATUS_STYLE: Record<DemandaStatus, string> = {
  aberta: "bg-mint/40 text-foreground",
  em_andamento: "bg-brand-soft text-brand",
  concluida: "bg-success/20 text-foreground",
};

function DemandasPage() {
  const auth = useCurrentUser();
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("client_demandas")
        .select("*")
        .eq("cliente_id", auth.userId!)
        .order("created_at", { ascending: false });
      setDemandas((data as Demanda[]) ?? []);
      setLoading(false);
    })();
  }, [auth.userId]);

  if (auth.loading || loading) return <KwkLoader fullScreen={false} label="Carregando demandas" />;

  const statusLabel = (s: DemandaStatus) => DEMANDA_STATUS.find((x) => x.key === s)?.label ?? s;

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand font-semibold">Consultoria CRIAR</p>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight mt-1">Demandas</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Acompanhe as solicitações e entregas combinadas ao longo da consultoria.
        </p>
      </div>

      {demandas.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl mt-4">Nenhuma demanda por aqui</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Quando houver solicitações ou entregas combinadas, elas aparecem aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {demandas.map((d) => (
            <li key={d.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground">{d.titulo}</p>
                {d.descricao && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.descricao}</p>}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${STATUS_STYLE[d.status]}`}>
                {statusLabel(d.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
