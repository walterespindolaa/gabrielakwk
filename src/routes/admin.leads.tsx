import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, X, Copy, Check, Trash2, Archive, Inbox } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createLeadInvite, listLeads, approveLeadInvite } from "@/lib/public-forms.functions";

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
  answers: Record<string, any> | null;
  status?: string | null;
  archived?: boolean | null;
  created_at: string;
}

interface Form {
  id: string;
  title: string;
  schema: { fields?: Array<{ id: string; label: string; type: string }>; stages?: any[] } | null;
}

const COLUMNS = [
  { key: "novo", label: "Novos" },
  { key: "respondido", label: "Respondidos" },
  { key: "em_contato", label: "Em contato" },
  { key: "apta", label: "Aptas" },
  { key: "nao_apta", label: "Não aptas" },
];

function statusOf(l: Lead): string {
  if (l.status) return l.status;
  if (l.approved_at) return "cliente";
  if (l.submitted_at) return "respondido";
  return "novo";
}

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState<Lead | null>(null);

  const listFn = useServerFn(listLeads);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function load() {
    setLoading(true);
    try {
      const [{ leads: l }, formsRes] = await Promise.all([
        listFn(),
        supabase.from("forms").select("id, title, schema").order("created_at"),
      ]);
      setLeads((l as any[]).filter((x) => !x.archived));
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
    const stages = (f.schema as any).stages;
    if (Array.isArray(stages)) return stages.flatMap((s: any) => s.fields ?? []);
    return [];
  }

  async function setStatus(token: string, status: string) {
    setLeads((prev) => prev.map((l) => (l.token === token ? { ...l, status } : l)));
    const { error } = await supabase.from("form_invites").update({ status } as any).eq("token", token);
    if (error) {
      toast.error("Erro ao mover o lead.");
      load();
    }
  }

  async function archive(token: string) {
    const { error } = await supabase.from("form_invites").update({ archived: true } as any).eq("token", token);
    if (error) return toast.error("Erro ao arquivar.");
    setLeads((prev) => prev.filter((l) => l.token !== token));
    setDetail(null);
    toast.success("Lead arquivado.");
  }

  async function remove(token: string, name: string | null) {
    if (!confirm(`Excluir o lead "${name ?? "Sem nome"}"? Não pode ser desfeito.`)) return;
    const { error } = await supabase.from("form_invites").delete().eq("token", token);
    if (error) return toast.error("Erro ao excluir.");
    setLeads((prev) => prev.filter((l) => l.token !== token));
    setDetail(null);
    toast.success("Lead excluído.");
  }

  function copy(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/f/${token}`);
    toast.success("Link copiado!");
  }

  function onDragEnd(e: DragEndEvent) {
    const token = String(e.active.id);
    const col = e.over?.id ? String(e.over.id) : null;
    if (!col) return;
    const lead = leads.find((l) => l.token === token);
    if (lead && statusOf(lead) !== col) setStatus(token, col);
  }

  const boardLeads = leads.filter((l) => statusOf(l) !== "cliente");

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">
            Arraste os cards entre as colunas. Quando uma lead estiver apta, abra e crie o acesso.
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

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="mt-8 flex gap-3 overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const items = boardLeads.filter((l) => statusOf(l) === col.key);
              return (
                <Column key={col.key} id={col.key} label={col.label} count={items.length}>
                  {items.map((l) => (
                    <Card key={l.token} lead={l} onOpen={() => setDetail(l)} onCopy={() => copy(l.token)} />
                  ))}
                </Column>
              );
            })}
          </div>
        </DndContext>
      )}

      {detail && (
        <LeadDetailModal
          lead={detail}
          fields={getFormFields(detail.form_id)}
          onClose={() => setDetail(null)}
          onStatus={(s) => setStatus(detail.token, s)}
          onArchive={() => archive(detail.token)}
          onDelete={() => remove(detail.token, detail.lead_name)}
          onCopy={() => copy(detail.token)}
          onApproved={() => {
            setDetail(null);
            load();
          }}
        />
      )}

      {showNew && (
        <NewLeadModal forms={forms} onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />
      )}
    </div>
  );
}

function Column({ id, label, count, children }: { id: string; label: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-[270px] flex-none rounded-2xl border p-2.5 transition-colors ${
        isOver ? "border-brand bg-brand-soft/30" : "border-border/60 bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground bg-card border border-border/60 rounded-full px-2">{count}</span>
      </div>
      <div className="space-y-2 mt-1 min-h-[60px]">{children}</div>
    </div>
  );
}

function Card({ lead, onOpen, onCopy }: { lead: Lead; onOpen: () => void; onCopy: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.token });
  const responded = !!lead.submitted_at;
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={`bg-card border border-border/60 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-brand/50 transition-colors ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{lead.lead_name ?? "Sem nome"}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            {lead.lead_email || lead.lead_whatsapp || "sem contato"}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onCopy(); }}
          className="text-muted-foreground hover:text-brand shrink-0"
          aria-label="Copiar link"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${responded ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"}`}>
          {responded ? "Respondido" : "Aguardando"}
        </span>
      </div>
    </div>
  );
}

function LeadDetailModal({
  lead,
  fields,
  onClose,
  onStatus,
  onArchive,
  onDelete,
  onCopy,
  onApproved,
}: {
  lead: Lead;
  fields: any[];
  onClose: () => void;
  onStatus: (s: string) => void;
  onArchive: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onApproved: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border/60 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-2xl tracking-tight">{lead.lead_name ?? "Sem nome"}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {lead.lead_email || "sem e-mail"}
          {lead.lead_whatsapp ? ` · ${lead.lead_whatsapp}` : ""}
        </p>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <select
            value={statusOf(lead)}
            onChange={(e) => onStatus(e.target.value)}
            className="text-sm bg-background border border-border/60 rounded-lg px-2.5 py-1.5"
          >
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <button onClick={onCopy} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted">
            <Copy className="w-3.5 h-3.5" /> Link
          </button>
          <button onClick={onArchive} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted">
            <Archive className="w-3.5 h-3.5" /> Arquivar
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border/60 text-destructive hover:border-destructive/40">
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>
        </div>

        {lead.answers ? (
          <div className="mt-5">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Respostas</h3>
            <dl className="space-y-2 text-sm">
              {fields.map((field: any) => {
                const v = lead.answers?.[field.id];
                if (v === undefined || v === null || v === "") return null;
                return (
                  <div key={field.id}>
                    <dt className="text-xs text-muted-foreground">{field.label}</dt>
                    <dd className="whitespace-pre-wrap">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">Aguardando preenchimento do formulário.</p>
        )}

        <div className="mt-6 border-t border-border/60 pt-5">
          {lead.approved_at ? (
            <p className="text-sm text-success inline-flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Acesso criado em {new Date(lead.approved_at).toLocaleString("pt-BR")}.
            </p>
          ) : lead.submitted_at ? (
            <ApproveBlock token={lead.token} email={lead.lead_email} onDone={onApproved} />
          ) : (
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <Inbox className="w-4 h-4" /> A lead ainda não preencheu o formulário.
            </p>
          )}
        </div>
      </div>
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
            <button onClick={onCreated} className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90">
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
                  <option key={f.id} value={f.id}>{f.title}</option>
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

function ApproveBlock({ token, email, onDone }: { token: string; email: string | null; onDone: () => void }) {
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
        Virar cliente (criar acesso)
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
        <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2 rounded-lg border border-border/60 text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={busy} className="flex-1 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-semibold disabled:opacity-50">
          {busy ? "Criando..." : "Confirmar"}
        </button>
      </div>
    </form>
  );
}
