import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  CONTENT_STATUS,
  CONTENT_FORMATOS,
  type ContentItem,
  type ContentStatus,
} from "@/lib/client-workspace";

const STATUS_STYLE: Record<ContentStatus, string> = {
  ideia: "bg-mint/40 text-foreground",
  em_producao: "bg-brand-soft text-brand",
  agendado: "bg-accent/15 text-accent",
  postado: "bg-success/20 text-foreground",
};

/** Plano editorial / banco de ideias (admin). */
export function ContentBoard({ clienteId }: { clienteId: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [formato, setFormato] = useState(CONTENT_FORMATOS[0]);
  const [pilar, setPilar] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("client_content")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });
    setItems((data as ContentItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [clienteId]);

  async function add() {
    const t = titulo.trim();
    if (!t) return;
    setAdding(true);
    const { error } = await (supabase as any).from("client_content").insert({
      cliente_id: clienteId,
      titulo: t,
      formato,
      pilar: pilar.trim() || null,
      scheduled_for: scheduledFor || null,
      status: scheduledFor ? "agendado" : "ideia",
    });
    setAdding(false);
    if (error) {
      toast.error("Erro ao adicionar conteúdo.");
      return;
    }
    setTitulo("");
    setPilar("");
    setScheduledFor("");
    load();
  }

  async function changeStatus(id: string, status: ContentStatus) {
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    const { error } = await (supabase as any).from("client_content").update({ status }).eq("id", id);
    if (error) toast.error("Erro ao atualizar.");
  }

  async function remove(id: string) {
    if (!confirm("Excluir este conteúdo?")) return;
    const { error } = await (supabase as any).from("client_content").delete().eq("id", id);
    if (error) return toast.error("Erro ao excluir.");
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      {/* Adicionar */}
      <div className="bg-background border border-border/60 rounded-xl p-4 mb-5">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título / ideia de conteúdo..."
          className="w-full bg-card border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors mb-2"
        />
        <div className="grid sm:grid-cols-3 gap-2 mb-2">
          <select
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
            className="bg-card border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          >
            {CONTENT_FORMATOS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input
            value={pilar}
            onChange={(e) => setPilar(e.target.value)}
            placeholder="Pilar (opcional)"
            className="bg-card border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
          <input
            type="date"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="bg-card border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex justify-end">
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

      {/* Colunas por status */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum conteúdo ainda.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {CONTENT_STATUS.map((col) => {
            const colItems = items.filter((i) => i.status === col.key);
            return (
              <div key={col.key} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                    {col.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{colItems.length}</span>
                </div>
                <div className="space-y-2">
                  {colItems.map((c) => (
                    <div key={c.id} className="bg-card border border-border/60 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium">{c.titulo}</span>
                        <button
                          onClick={() => remove(c.id)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          aria-label="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-muted-foreground">
                        {c.formato && <span className="bg-muted px-2 py-0.5 rounded-full">{c.formato}</span>}
                        {c.pilar && <span>{c.pilar}</span>}
                        {c.scheduled_for && (
                          <span>{new Date(c.scheduled_for + "T00:00").toLocaleDateString("pt-BR")}</span>
                        )}
                      </div>
                      <select
                        value={c.status}
                        onChange={(e) => changeStatus(c.id, e.target.value as ContentStatus)}
                        className={`mt-2 text-[11px] rounded-full px-2 py-1 border-0 font-medium cursor-pointer ${STATUS_STYLE[c.status]}`}
                      >
                        {CONTENT_STATUS.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ContentBoard;
