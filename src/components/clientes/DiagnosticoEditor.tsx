import { useEffect, useState } from "react";
import { Plus, X, Save, Eye, Upload, FileText, Trash2 } from "lucide-react";
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
import { RichTextEditor } from "@/components/clientes/RichTextEditor";

/** Editor de Diagnóstico (admin): Panorama Geral + Análise SWOT. */
export function DiagnosticoEditor({ clienteId }: { clienteId: string }) {
  const [panorama, setPanorama] = useState("");
  const [swot, setSwot] = useState<SwotData>(EMPTY_SWOT);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("client_diagnostico")
        .select("panorama, swot, pdf_path, pdf_name")
        .eq("cliente_id", clienteId)
        .maybeSingle();
      if (!active) return;
      setPanorama((data as any)?.panorama ?? "");
      setSwot(normalizeSwot((data as any)?.swot));
      setPdfPath((data as any)?.pdf_path ?? null);
      setPdfName((data as any)?.pdf_name ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [clienteId]);

  async function uploadPdf(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Envie um arquivo PDF.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Arquivo maior que 50MB.");
      return;
    }
    setUploadingPdf(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `diagnostico/${clienteId}/${crypto.randomUUID()}-${safeName}`;
    const up = await supabase.storage
      .from("materiais")
      .upload(path, file, { contentType: "application/pdf" });
    if (up.error) {
      setUploadingPdf(false);
      toast.error(up.error.message);
      return;
    }
    // remove o PDF anterior (best-effort)
    if (pdfPath) await supabase.storage.from("materiais").remove([pdfPath]);
    const { error } = await (supabase as any).from("client_diagnostico").upsert(
      {
        cliente_id: clienteId,
        pdf_path: path,
        pdf_name: file.name,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "cliente_id" },
    );
    setUploadingPdf(false);
    if (error) {
      toast.error("Erro ao salvar o PDF.");
      return;
    }
    setPdfPath(path);
    setPdfName(file.name);
    toast.success("PDF anexado. A cliente verá este PDF no lugar do diagnóstico gerado.");
  }

  async function removePdf() {
    if (!confirm("Remover o PDF? A cliente voltará a ver o diagnóstico gerado pelo sistema.")) return;
    if (pdfPath) await supabase.storage.from("materiais").remove([pdfPath]);
    const { error } = await (supabase as any).from("client_diagnostico").upsert(
      {
        cliente_id: clienteId,
        pdf_path: null,
        pdf_name: null,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "cliente_id" },
    );
    if (error) {
      toast.error("Erro ao remover o PDF.");
      return;
    }
    setPdfPath(null);
    setPdfName(null);
    toast.success("PDF removido.");
  }

  function addItems(key: SwotKey, values: string[]) {
    const clean = values
      .map((v) => v.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "").trim())
      .filter(Boolean);
    if (!clean.length) return;
    setSwot((s) => ({ ...s, [key]: [...s[key], ...clean] }));
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
      {/* PDF do diagnóstico (substitui o gerado) */}
      <div className="rounded-2xl bg-surface-alt border border-brand/15 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <label className="text-sm font-semibold text-foreground">Diagnóstico em PDF</label>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              Opcional. Se você anexar um PDF, a cliente verá <strong>esse PDF</strong> no lugar do
              panorama e da SWOT abaixo. Para usar o diagnóstico do sistema, deixe sem PDF.
            </p>
          </div>
          <label className="inline-flex items-center gap-1.5 rounded-full bg-brand text-brand-foreground px-3.5 py-1.5 text-xs font-semibold hover:bg-brand/90 transition-colors cursor-pointer shrink-0 disabled:opacity-50">
            <Upload className="w-3.5 h-3.5" />
            {uploadingPdf ? "Enviando..." : pdfPath ? "Trocar PDF" : "Anexar PDF"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={uploadingPdf}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadPdf(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {pdfPath && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-card px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-brand text-brand-foreground flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{pdfName ?? "Diagnóstico.pdf"}</p>
                <p className="text-[11px] text-brand">Ativo — a cliente está vendo este PDF.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removePdf}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>
        )}
      </div>

      {/* Panorama */}
      <div className="rounded-2xl bg-surface-alt border border-brand/15 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <label className="text-sm font-semibold text-foreground">Panorama geral</label>
            <p className="text-xs text-muted-foreground">
              Resumo de quem é a cliente, momento atual e contexto da marca.
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand text-brand-foreground px-3.5 py-1.5 text-xs font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <RichTextEditor
          value={panorama}
          onChange={setPanorama}
          placeholder="Escreva o panorama da cliente... (use a barra acima para negrito, itálico e listas)"
        />
        <p className="text-[11px] text-muted-foreground mt-2">
          Dica: <strong>Ctrl/Cmd+B</strong> negrito, <strong>Ctrl/Cmd+I</strong> itálico.
          Digite <strong>"- "</strong> para tópicos ou <strong>"1. "</strong> para lista numerada.
        </p>
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
                onAdd={(vals) => addItems(q.key, vals)}
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
  onAdd: (values: string[]) => void;
  onRemove: (i: number) => void;
}) {
  const [value, setValue] = useState("");
  function submit() {
    if (!value.trim()) return;
    onAdd(value.split("\n"));
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

      <div className="flex items-end gap-2">
        <textarea
          value={value}
          rows={1}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Enter envia; Shift+Enter quebra linha
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text.includes("\n")) {
              e.preventDefault();
              onAdd((value + text).split("\n"));
              setValue("");
            }
          }}
          placeholder="Adicionar item... (cole vários — cada linha vira um item)"
          className="flex-1 bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-colors resize-y min-h-[38px]"
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
