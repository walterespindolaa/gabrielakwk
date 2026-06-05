import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, ExternalLink, Download, X, Loader2, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { STAGES } from "@/components/area/AreaLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/area/materiais")({
  component: MateriaisPage,
});

interface Material {
  id: string;
  title: string;
  description: string | null;
  stage: string | null;
  type: string;
  file_path: string | null;
  external_url: string | null;
}

function MateriaisPage() {
  const auth = useCurrentUser();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<{ material: Material; url: string } | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      // RLS limits to assigned materials.
      const { data } = await supabase
        .from("materials")
        .select("id, title, description, stage, type, file_path, external_url")
        .order("created_at", { ascending: false });
      setMaterials((data as Material[]) ?? []);
      setLoading(false);
    })();
  }, [auth.userId]);

  async function getSignedUrl(path: string) {
    const { data, error } = await supabase.storage
      .from("materiais")
      .createSignedUrl(path, 300);
    if (error || !data) throw new Error(error?.message ?? "Erro ao gerar URL.");
    return data.signedUrl;
  }

  async function handleOpen(m: Material) {
    setOpening(m.id);
    try {
      if (m.type === "pdf" && m.file_path) {
        const url = await getSignedUrl(m.file_path);
        setPreview({ material: m, url });
      } else if (m.external_url) {
        window.open(m.external_url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível abrir o material.");
    } finally {
      setOpening(null);
    }
  }

  async function handleDownload(m: Material) {
    if (!m.file_path) return;
    setOpening(m.id);
    try {
      const url = await getSignedUrl(m.file_path);
      const a = document.createElement("a");
      a.href = url;
      a.download = m.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao baixar.");
    } finally {
      setOpening(null);
    }
  }

  const filtered =
    filter === "all"
      ? materials
      : materials.filter((m) => (m.stage ?? "geral") === filter);

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight">Materiais</h1>
      <p className="text-muted-foreground mt-2">
        Sua biblioteca de conteúdos da consultoria.
      </p>

      <div className="mt-6 flex gap-2 flex-wrap">
        {["all", "geral", ...STAGES.map((s) => s.key)].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === k
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {k === "all"
              ? "Todos"
              : k === "geral"
              ? "Geral"
              : STAGES.find((s) => s.key === k)?.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border/60 rounded-2xl p-6 h-40 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filtered={filter !== "all"} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((m) => (
              <div
                key={m.id}
                className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-brand" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {m.type} · {m.stage ?? "geral"}
                    </div>
                    <h3 className="font-semibold mt-0.5">{m.title}</h3>
                  </div>
                </div>
                {m.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                    {m.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2 pt-2 border-t border-border/60">
                  <button
                    onClick={() => handleOpen(m)}
                    disabled={opening === m.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                  >
                    {opening === m.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : m.type === "pdf" ? (
                      "Abrir"
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Abrir
                      </>
                    )}
                  </button>
                  {m.type === "pdf" && m.file_path && (
                    <button
                      onClick={() => handleDownload(m)}
                      disabled={opening === m.id}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/60 text-sm hover:bg-muted disabled:opacity-50"
                      aria-label="Baixar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
          <div className="bg-card border-b border-border/60 px-5 h-14 flex items-center justify-between flex-shrink-0">
            <div className="font-semibold truncate pr-4">{preview.material.title}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(preview.material)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-border/60 hover:bg-muted"
              >
                <Download className="w-4 h-4" />
                Baixar
              </button>
              <button
                onClick={() => setPreview(null)}
                className="p-2 text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <iframe
            src={preview.url}
            title={preview.material.title}
            className="flex-1 w-full bg-white"
          />
        </div>
      )}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center mx-auto">
        <FolderOpen className="w-6 h-6 text-brand" />
      </div>
      <h3 className="font-display text-xl mt-4">
        {filtered ? "Nenhum material nessa etapa" : "Nenhum material por enquanto"}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
        Quando a consultora liberar conteúdos para você, eles aparecem aqui.
      </p>
    </div>
  );
}
