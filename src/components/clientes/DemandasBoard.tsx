import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEMANDA_STATUS, type Demanda, type DemandaStatus } from "@/lib/client-workspace";

const STATUS_STYLE: Record<DemandaStatus, string> = {
  aberta: "bg-mint/40 text-foreground",
  em_andamento: "bg-brand-soft text-brand",
  concluida: "bg-success/20 text-foreground",
};

/** Demandas Gerais (admin): solicitações da cliente com status. */
export function DemandasBoard({ clienteId }: { clienteId: string }) {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("client_demandas")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });
    setDemandas((data as Demanda[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [clienteId]);

  async function add() {
    const t = titulo.trim();
    if (!t) return;
    setAdding(true);
    const { error } = await (supabase as any)
      .from("client_demandas")
      .insert({ cliente_id: clienteId, titulo: t, descricao: descricao.trim() || null } as any);
    setAdding(false);
    if (error) {
      toast.error("Erro ao adicionar demanda.");
      return;
    }
    setTitulo("");
    setDescricao("");
    load();
  }

  async function changeStatus(id: string, status: DemandaStatus) {
    setDemandas((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    const { error } = await (supabase as any).from("client_demandas").update({ status }).eq("id", id);
    if (error) toast.error("Erro ao atualizar status.");
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta demanda?")) return;
    const { error } = await (supabase as any).from("client_demandas").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
      return;
    }
    setDemandas((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div>
      {/* Adicionar */}
      <div className="bg-background border border-border/60 rounded-xl p-4 mb-4">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nova demanda / solicitação..."
          className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors mb-2"
        />
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={2}
          placeholder="Detalhes (opcional)"
          className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors resize-y"
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={add}
            disabled={adding || !titulo.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand text-brand-foreground px-4 py-2 text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando demandas...</p>
      ) : demandas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma demanda ainda.</p>
      ) : (
        <ul className="space-y-2">
          {demandas.map((d) => (
            <li
              key={d.id}
              className="bg-card border border-border/60 rounded-xl p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground">{d.titulo}</p>
                {d.descricao && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.descricao}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={d.status}
                  onChange={(e) => changeStatus(d.id, e.target.value as DemandaStatus)}
                  className={`text-xs rounded-full px-2.5 py-1 border-0 font-medium cursor-pointer ${STATUS_STYLE[d.status]}`}
                >
                  {DEMANDA_STATUS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(d.id)}
                  aria-label="Excluir demanda"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DemandasBoard;
