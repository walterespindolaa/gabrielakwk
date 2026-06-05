import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, X, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  createLeadInvite,
  listLeads,
  approveLeadInvite,
} from "@/lib/public-forms.functions";

export const Route = createFileRoute("/admin/leads")({
  component: LeadsPage,
});

interface Lead {
  token: string;
  form_id: string;
  cliente_id: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_whatsapp: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_cliente_id: string | null;
  answers: Record<string, any> | null;
  created_at: string;
}

interface Form {
  id: string;
  title: string;
  schema: { fields?: Array<{ id: string; label: string; type: string }>; stages?: any[] } | null;
}

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const listFn = useServerFn(listLeads);

  async function load() {
    setLoading(true);
    try {
      const [{ leads: l }, formsRes] = await Promise.all([
        listFn(),
        supabase.from("forms").select("id, title, schema").order("created_at"),
      ]);
      setLeads(l as any);
      setForms((formsRes.data as any) ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function getFormFields(formId: string) {
    const f = forms.find((x) => x.id === formId);
    if (!f?.schema) return [];
    if (Array.isArray(f.schema.fields)) return f.schema.fields;
    // Suporta schema com stages
    const stages = (f.schema as any).stages;
    if (Array.isArray(stages)) {
      return stages.flatMap((s: any) => s.fields ?? []);
    }
    return [];
  }

  function toggle(token: string) {
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(token)) n.delete(token);
      else n.add(token);
      return n;
    });
  }

  function copy(token: string) {
    const url = `${window.location.origin}/f/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">
            Envie o formulário de pré-consultoria, receba as respostas e libere o acesso à área de membros.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Novo lead
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lead ainda. Crie um para gerar o link do formulário.</p>
        ) : (
          leads.map((l) => {
            const isOpen = expanded.has(l.token);
            const fields = getFormFields(l.form_id);
            const status = l.approved_at
              ? { label: "Aprovado", cls: "bg-emerald-100 text-emerald-700" }
              : l.submitted_at
              ? { label: "Respondido", cls: "bg-amber-100 text-amber-800" }
              : { label: "Pendente", cls: "bg-muted text-muted-foreground" };
            return (
              <div key={l.token} className="bg-card border border-border/60 rounded-xl">
                <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => toggle(l.token)}
                    className="flex items-center gap-3 text-left min-w-0 flex-1"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{l.lead_name ?? "Sem nome"}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {l.lead_email ?? "sem e-mail"} · criado em{" "}
                        {new Date(l.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </button>
                  <span className={`text-xs px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                  <button
                    onClick={() => copy(l.token)}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted"
                    title="Copiar link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Link
                  </button>
                </div>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border/60 pt-4 space-y-4">
                    <div className="text-xs text-muted-foreground break-all">
                      Link: {`${typeof window !== "undefined" ? window.location.origin : ""}/f/${l.token}`}
                    </div>

                    {l.answers ? (
                      <div>
                        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                          Respostas
                        </h3>
                        <dl className="space-y-2 text-sm">
                          {fields.map((field: any) => {
                            const v = l.answers?.[field.id];
                            if (v === undefined || v === null || v === "") return null;
                            return (
                              <div key={field.id}>
                                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                                <dd className="whitespace-pre-wrap">
                                  {Array.isArray(v) ? v.join(", ") : String(v)}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aguardando preenchimento do formulário.</p>
                    )}

                    {l.submitted_at && !l.approved_at && (
                      <ApproveBlock token={l.token} email={l.lead_email} onDone={load} />
                    )}
                    {l.approved_at && (
                      <p className="text-sm text-emerald-700">
                        ✓ Acesso criado em {new Date(l.approved_at).toLocaleString("pt-BR")}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showNew && (
        <NewLeadModal
          forms={forms}
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewLeadModal({
  forms,
  onClose,
  onCreated,
}: {
  forms: Form[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const createFn = useServerFn(createLeadInvite);
  const [form, setForm] = useState({
    form_id: forms[0]?.id ?? "",
    lead_name: "",
    lead_email: "",
    lead_whatsapp: "",
  });
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.form_id) {
      toast.error("Crie um formulário antes.");
      return;
    }
    setBusy(true);
    try {
      const res = await createFn({ data: form });
      const url = `${window.location.origin}/f/${res.token}`;
      setLink(url);
      navigator.clipboard.writeText(url);
      toast.success("Link gerado e copiado!");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-2xl">Novo lead</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Crie o convite e envie o link para ela preencher. Você só cria o acesso depois de aprovar.
        </p>

        {link ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm">Link gerado:</p>
            <div className="p-3 rounded-lg bg-muted text-xs break-all">{link}</div>
            <button
              onClick={onCreated}
              className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90"
            >
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Formulário</span>
              <select
                required
                value={form.form_id}
                onChange={(e) => setForm({ ...form, form_id: e.target.value })}
                className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm"
              >
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Nome do lead</span>
              <input
                required
                maxLength={200}
                value={form.lead_name}
                onChange={(e) => setForm({ ...form, lead_name: e.target.value })}
                className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">E-mail (opcional, necessário para criar acesso)</span>
              <input
                type="email"
                maxLength={255}
                value={form.lead_email}
                onChange={(e) => setForm({ ...form, lead_email: e.target.value })}
                className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp (opcional)</span>
              <input
                maxLength={40}
                value={form.lead_whatsapp}
                onChange={(e) => setForm({ ...form, lead_whatsapp: e.target.value })}
                className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Gerando..." : "Gerar link do formulário"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ApproveBlock({
  token,
  email,
  onDone,
}: {
  token: string;
  email: string | null;
  onDone: () => void;
}) {
  const approveFn = useServerFn(approveLeadInvite);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Lead sem e-mail. Edite antes de aprovar.");
      return;
    }
    if (password.length < 8) {
      toast.error("Senha precisa ter ao menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      await approveFn({ data: { token, password } });
      toast.success(`Acesso criado para ${email}.`);
      onDone();
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao aprovar.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90"
      >
        <Check className="w-4 h-4" />
        Aprovar e criar acesso
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-3">
      <p className="text-sm">
        Será criado o usuário <strong>{email}</strong> com a senha definida abaixo.
      </p>
      <input
        required
        type="text"
        minLength={8}
        placeholder="Senha inicial"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm font-mono"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-2 rounded-lg border border-border/60 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex-1 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-semibold disabled:opacity-50"
        >
          {busy ? "Criando..." : "Confirmar"}
        </button>
      </div>
    </form>
  );
}
