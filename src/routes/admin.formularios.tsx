import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { STAGES } from "@/components/admin/AdminLayout";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/formularios")({
  component: FormulariosPage,
});

type FieldType = "short" | "long" | "choice";
interface Field {
  id: string;
  type: FieldType;
  label: string;
  options?: string[];
}
interface Form {
  id: string;
  title: string;
  description: string | null;
  stage: string | null;
  schema: { fields: Field[] } | null;
  created_at: string;
}

function FormulariosPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [responses, setResponses] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });
    setForms((data as Form[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function loadResponses(formId: string) {
    if (responses[formId]) return;
    const { data } = await supabase
      .from("form_responses")
      .select("id, cliente_id, answers, submitted_at, profiles:cliente_id(full_name)")
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });
    setResponses((r) => ({ ...r, [formId]: data ?? [] }));
  }

  function toggle(id: string) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else {
        n.add(id);
        loadResponses(id);
      }
      return n;
    });
  }

  async function handleDelete(f: Form) {
    if (!confirm(`Excluir formulário "${f.title}"?`)) return;
    const { error } = await supabase.from("forms").delete().eq("id", f.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Formulário excluído.");
      load();
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Formulários</h1>
          <p className="text-muted-foreground mt-2">Crie formulários e veja as respostas.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Novo formulário
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : forms.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum formulário ainda.</p>
        ) : (
          forms.map((f) => {
            const isOpen = expanded.has(f.id);
            const resps = responses[f.id] ?? [];
            return (
              <div key={f.id} className="bg-card border border-border/60 rounded-xl">
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggle(f.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{f.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {f.stage ?? "geral"} ·{" "}
                        {(f.schema?.fields?.length ?? 0)} campo(s)
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(f)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border/60 pt-4">
                    {f.description && (
                      <p className="text-sm text-muted-foreground mb-4">{f.description}</p>
                    )}
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      Respostas
                    </h3>
                    {resps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma resposta ainda.</p>
                    ) : (
                      <ul className="space-y-3">
                        {resps.map((r: any) => (
                          <li key={r.id} className="p-4 rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">
                                {r.profiles?.full_name ?? "Cliente"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(r.submitted_at).toLocaleString("pt-BR")}
                              </div>
                            </div>
                            <dl className="space-y-1 text-sm">
                              {(f.schema?.fields ?? []).map((field) => (
                                <div key={field.id}>
                                  <dt className="text-xs text-muted-foreground">{field.label}</dt>
                                  <dd className="whitespace-pre-wrap">
                                    {String(r.answers?.[field.id] ?? "—")}
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showCreate && (
        <CreateFormModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ title: "", description: "", stage: "geral" });
  const [fields, setFields] = useState<Field[]>([
    { id: crypto.randomUUID(), type: "short", label: "" },
  ]);
  const [busy, setBusy] = useState(false);

  function addField(type: FieldType) {
    setFields([
      ...fields,
      { id: crypto.randomUUID(), type, label: "", ...(type === "choice" ? { options: [""] } : {}) },
    ]);
  }
  function updateField(id: string, patch: Partial<Field>) {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function removeField(id: string) {
    setFields(fields.filter((f) => f.id !== id));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = fields
      .map((f) => ({
        ...f,
        label: f.label.trim(),
        options: f.options?.map((o) => o.trim()).filter(Boolean),
      }))
      .filter((f) => f.label);
    if (clean.length === 0) {
      toast.error("Adicione ao menos um campo.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("forms").insert({
        title: form.title,
        description: form.description || null,
        stage: form.stage,
        schema: { fields: clean },
      });
      if (error) throw error;
      toast.success("Formulário criado.");
      onCreated();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-2xl">Novo formulário</h2>

        <form onSubmit={submit} className="mt-4 flex-1 overflow-y-auto space-y-4 -mx-2 px-2">
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
            rows={2}
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
            className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm"
          >
            <option value="geral">Geral</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="border-t border-border/60 pt-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Campos</h3>
            <div className="space-y-3">
              {fields.map((f, idx) => (
                <div key={f.id} className="p-3 rounded-lg bg-muted/30 border border-border/60">
                  <div className="flex gap-2 items-start">
                    <input
                      placeholder={`Pergunta ${idx + 1}`}
                      maxLength={200}
                      value={f.label}
                      onChange={(e) => updateField(f.id, { label: e.target.value })}
                      className="flex-1 bg-background border border-border/60 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-brand"
                    />
                    <select
                      value={f.type}
                      onChange={(e) =>
                        updateField(f.id, {
                          type: e.target.value as FieldType,
                          options: e.target.value === "choice" ? [""] : undefined,
                        })
                      }
                      className="bg-background border border-border/60 rounded-md px-2 py-1.5 text-sm"
                    >
                      <option value="short">Texto curto</option>
                      <option value="long">Texto longo</option>
                      <option value="choice">Múltipla escolha</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeField(f.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {f.type === "choice" && (
                    <div className="mt-2 space-y-1">
                      {(f.options ?? []).map((opt, oi) => (
                        <div key={oi} className="flex gap-2">
                          <input
                            placeholder={`Opção ${oi + 1}`}
                            value={opt}
                            maxLength={100}
                            onChange={(e) => {
                              const next = [...(f.options ?? [])];
                              next[oi] = e.target.value;
                              updateField(f.id, { options: next });
                            }}
                            className="flex-1 bg-background border border-border/60 rounded-md px-2 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateField(f.id, {
                                options: (f.options ?? []).filter((_, i) => i !== oi),
                              })
                            }
                            className="text-muted-foreground hover:text-destructive text-xs px-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateField(f.id, { options: [...(f.options ?? []), ""] })}
                        className="text-xs text-brand hover:underline"
                      >
                        + Adicionar opção
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() => addField("short")}
                className="text-xs px-3 py-1.5 rounded-md border border-border/60 hover:bg-muted"
              >
                + Texto curto
              </button>
              <button
                type="button"
                onClick={() => addField("long")}
                className="text-xs px-3 py-1.5 rounded-md border border-border/60 hover:bg-muted"
              >
                + Texto longo
              </button>
              <button
                type="button"
                onClick={() => addField("choice")}
                className="text-xs px-3 py-1.5 rounded-md border border-border/60 hover:bg-muted"
              >
                + Múltipla escolha
              </button>
            </div>
          </div>
        </form>

        <div className="flex gap-3 pt-4 border-t border-border/60 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-border/60 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex-1 py-2.5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Salvando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}
