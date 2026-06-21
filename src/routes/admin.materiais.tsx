import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STAGES } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/materiais")({
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
  created_at: string;
}

const TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Vídeo" },
  { value: "link", label: "Link" },
];

function MateriaisPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [assignFor, setAssignFor] = useState<Material | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });
    setMaterials((data as Material[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(m: Material) {
    if (!confirm(`Excluir "${m.title}"?`)) return;
    if (m.file_path) {
      await supabase.storage.from("materiais").remove([m.file_path]);
    }
    const { error } = await supabase.from("materials").delete().eq("id", m.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Material excluído.");
      load();
    }
  }

  const filtered =
    filter === "all" ? materials : materials.filter((m) => (m.stage ?? "geral") === filter);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Materiais</h1>
          <p className="text-muted-foreground mt-2">PDFs, vídeos e links da consultoria.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Novo material
        </button>
      </div>

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
            {k === "all" ? "Todos" : k === "geral" ? "Geral" : STAGES.find((s) => s.key === k)?.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum material nesse filtro.</p>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col hover:shadow-md hover:shadow-brand/5 transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-brand font-semibold">
                    {m.type} · {m.stage ?? "geral"}
                  </div>
                  <h3 className="font-semibold mt-1 truncate">{m.title}</h3>
                </div>
                <button
                  onClick={() => handleDelete(m)}
                  className="text-muted-foreground hover:text-destructive p-1"
                  aria-label="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {m.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{m.description}</p>
              )}
              <button
                onClick={() => setAssignFor(m)}
                className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand hover:bg-brand-soft py-2 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                Atribuir a clientes
              </button>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <CreateMaterialModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      {assignFor && (
        <AssignModal material={assignFor} onClose={() => setAssignFor(null)} />
      )}
    </div>
  );
}

function CreateMaterialModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    stage: "geral",
    type: "pdf",
    external_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      let file_path: string | null = null;
      let external_url: string | null = form.external_url || null;

      if (form.type === "pdf") {
        if (!file) throw new Error("Selecione um arquivo PDF.");
        if (file.size > 50 * 1024 * 1024) throw new Error("Arquivo maior que 50MB.");
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        file_path = `${crypto.randomUUID()}-${safeName}`;
        const up = await supabase.storage
          .from("materiais")
          .upload(file_path, file, { contentType: file.type || "application/pdf" });
        if (up.error) throw up.error;
        external_url = null;
      } else {
        if (!external_url) throw new Error("Informe a URL do conteúdo.");
        file_path = null;
      }

      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("materials").insert({
        title: form.title,
        description: form.description || null,
        stage: form.stage,
        type: form.type,
        file_path,
        external_url,
        created_by: userData.user?.id,
      });
      if (error) throw error;

      toast.success("Material criado.");
      onCreated();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-2xl">Novo material</h2>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            required
            placeholder="Título"
            maxLength={200}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
          <textarea
            placeholder="Descrição (opcional)"
            maxLength={500}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm"
            >
              <option value="geral">Geral</option>
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-background border border-border/60 rounded-lg px-3 py-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {form.type === "pdf" ? (
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Arquivo PDF
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm"
                required
              />
            </label>
          ) : (
            <input
              type="url"
              required
              maxLength={500}
              placeholder="https://..."
              value={form.external_url}
              onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border/60 text-sm font-semibold hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-2.5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Salvando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const [clients, setClients] = useState<{ id: string; full_name: string | null }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: cs }, { data: ass }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "cliente")
          .order("full_name"),
        supabase
          .from("material_assignments")
          .select("cliente_id")
          .eq("material_id", material.id),
      ]);
      setClients(cs ?? []);
      setSelected(new Set((ass ?? []).map((a: any) => a.cliente_id)));
      setLoading(false);
    })();
  }, [material.id]);

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function save() {
    setBusy(true);
    try {
      const { data: existing } = await supabase
        .from("material_assignments")
        .select("cliente_id")
        .eq("material_id", material.id);
      const existingSet = new Set((existing ?? []).map((e: any) => e.cliente_id));

      const toAdd = [...selected].filter((id) => !existingSet.has(id));
      const toRemove = [...existingSet].filter((id) => !selected.has(id));

      if (toAdd.length) {
        const { error } = await supabase.from("material_assignments").insert(
          toAdd.map((cliente_id) => ({
            cliente_id,
            material_id: material.id,
            unlocked: true,
          })),
        );
        if (error) throw error;
      }
      if (toRemove.length) {
        const { error } = await supabase
          .from("material_assignments")
          .delete()
          .eq("material_id", material.id)
          .in("cliente_id", toRemove);
        if (error) throw error;
      }
      toast.success("Atribuições atualizadas.");
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-xl">Atribuir material</h2>
        <p className="text-sm text-muted-foreground mt-1 truncate">{material.title}</p>

        <div className="flex-1 mt-4 overflow-y-auto -mx-2 px-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando clientes...</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p>
          ) : (
            <ul className="space-y-1">
              {clients.map((c) => (
                <li key={c.id}>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      className="accent-brand w-4 h-4"
                    />
                    <span className="text-sm">{c.full_name ?? "Sem nome"}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-border/60 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border/60 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="flex-1 py-2.5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
