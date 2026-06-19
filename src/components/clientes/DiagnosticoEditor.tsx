import { useEffect, useState } from "react";
import { Plus, X, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  EMPTY_SWOT,
  normalizeSwot,
  SWOT_QUADRANTS,
  type SwotData,
  type SwotKey,
} from "@/lib/client-workspace";
import { SwotBoard } from "@/components/clientes/SwotBoard";

/** Editor de Diagnóstico (admin): Panorama Geral + Análise SWOT. */
export function DiagnosticoEditor({ clienteId }: { clienteId: string }) {
  const [panorama, setPanorama] = useState("");
  const [swot, setSwot] = useState<SwotData>(EMPTY_SWOT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("client_diagnostico")
        .select("panorama, swot")
        .eq("cliente_id", clienteId)
        .maybeSingle();
      if (!active) return;
      setPanorama((data as any)?.panorama ?? "");
      setSwot(normalizeSwot((data as any)?.swot));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [clienteId]);

  function addItem(key: SwotKey, value: string) {
    const v = value.trim();
    if (!v) return;
    setSwot((s) => ({ ...s, [key]: [...s[key], v] }));
  }
  function removeItem(key: SwotKey, idx: number) {
    setSwot((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== idx) }));
  }

  async function save() {
    setSaving(true);
    const { error } = await (supabase as any).from("client_diagnostico").upsert(
      {
        cliente_id: clienteId,
        panorama: panorama.trim() || null,
        swot: swot as any,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "cliente_id" },
    );
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar diagnóstico.");
      return;
    }
    toast.success("Diagnóstico salvo. A cliente já consegue ver.");
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground p-4">Carregando diagnóstico...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Panorama */}
      <div className="rounded-2xl bg-surface-alt border border-brand/15 p-5">
        <label className="text-sm font-semibold text-foreground">Panorama geral</label>
        <p className="text-xs text-muted-foreground mb-2">
          Resumo de quem é a cliente, momento atual e contexto da marca.
        </p>
        <textarea
          rows={5}
          value={panorama}
          onChange={(e) => setPanorama(e.target.value)}
          placeholder="Escreva o panorama da cliente..."
          className="w-full bg-card border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-y"
        />
      </div>

      {/* SWOT editor */}
      <div className="rounded-2xl bg-surface-alt border border-brand/15 p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">Análise SWOT</label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
          >
            <Eye className="w-3.5 h-3.5" />
            {preview ? "Editar" : "Pré-visualizar"}
          </button>
        </div>

        {preview ? (
          <SwotBoard swot={swot} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {SWOT_QUADRANTS.map((q) => (
              <QuadrantEditor
                key={q.key}
                letter={q.letter}
                title={q.title}
                items={swot[q.key]}
                onAdd={(v) => addItem(q.key, v)}
                onRemove={(i) => removeItem(q.key, i)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-5 py-2.5 text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "Salvando..." : "Salvar diagnóstico"}
      </button>
    </div>
  );
}

function QuadrantEditor({
  letter,
  title,
  items,
  onAdd,
  onRemove,
}: {
  letter: string;
  title: string;
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
}) {
  const [value, setValue] = useState("");
  function submit() {
    onAdd(value);
    setValue("");
  }
  return (
    <div className="rounded-xl border border-brand/20 bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand text-brand-foreground text-xs font-semibold">
          {letter}
        </span>
        <span className="font-display text-lg">{title}</span>
      </div>

      <ul className="space-y-1.5 mb-3">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-2 text-sm bg-background rounded-lg px-3 py-1.5"
          >
            <span className="leading-snug">{it}</span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Remover"
              className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Adicionar item..."
          className="flex-1 bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors"
        />
        <button
          type="button"
          onClick={submit}
          aria-label="Adicionar"
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default DiagnosticoEditor;
