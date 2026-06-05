import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ENCONTROS, PRE_CONSULTORIA } from "@/lib/method-criar";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Copy,
  Link as LinkIcon,
  Loader2,
  Send,
  FileText,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  clienteId: string;
}

interface FormRow {
  id: string;
  title: string;
  description: string | null;
  stage: string | null;
  kind: string;
  encontro: number | null;
  order_index: number;
}

interface InviteRow {
  token: string;
  form_id: string;
  submitted_at: string | null;
  answers: any;
}

interface ResponseRow {
  id: string;
  form_id: string;
  answers: any;
  submitted_at: string;
}

interface SubmissionRow {
  id: string;
  form_id: string;
  status: string;
  answers: any;
  submitted_at: string | null;
  notes: string | null;
}

interface EncontroRow {
  id: string;
  numero: number;
  scheduled_at: string | null;
  completed_at: string | null;
  meet_url: string | null;
  notes: string | null;
  next_steps: string | null;
  status: string;
}

export function JornadaCRIARAdmin({ clienteId }: Props) {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [encontros, setEncontros] = useState<EncontroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | "pre" | null>("pre");

  async function load() {
    setLoading(true);
    const [fs, inv, resp, sub, enc] = await Promise.all([
      supabase
        .from("forms")
        .select("id, title, description, stage, kind, encontro, order_index")
        .like("title", "Método CRIAR%")
        .order("order_index", { ascending: true }),
      supabase
        .from("form_invites")
        .select("token, form_id, submitted_at, answers")
        .eq("cliente_id", clienteId),
      supabase
        .from("form_responses")
        .select("id, form_id, answers, submitted_at")
        .eq("cliente_id", clienteId),
      supabase
        .from("exercise_submissions")
        .select("id, form_id, status, answers, submitted_at, notes")
        .eq("cliente_id", clienteId),
      supabase
        .from("encontros")
        .select("id, numero, scheduled_at, completed_at, meet_url, notes, next_steps, status")
        .eq("cliente_id", clienteId)
        .order("numero", { ascending: true }),
    ]);
    setForms((fs.data as FormRow[]) ?? []);
    setInvites((inv.data as InviteRow[]) ?? []);
    setResponses((resp.data as ResponseRow[]) ?? []);
    setSubmissions((sub.data as SubmissionRow[]) ?? []);
    setEncontros((enc.data as EncontroRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [clienteId]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const formsByKey = (kind: string, encontro: number | null) =>
    forms.filter((f) => f.kind === kind && f.encontro === encontro);

  async function generateInvite(formId: string) {
    const { data, error } = await supabase
      .from("form_invites")
      .insert({ form_id: formId, cliente_id: clienteId })
      .select("token")
      .single();
    if (error) return toast.error(error.message);
    const url = `${origin}/f/${data.token}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Link gerado e copiado.");
    load();
  }

  async function copyInvite(token: string) {
    const url = `${origin}/f/${token}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    toast.success("Link copiado.");
  }

  async function upsertEncontro(numero: number, patch: Partial<EncontroRow>) {
    const existing = encontros.find((e) => e.numero === numero);
    if (existing) {
      const { error } = await supabase
        .from("encontros")
        .update(patch)
        .eq("id", existing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase
        .from("encontros")
        .insert({ cliente_id: clienteId, numero, ...patch });
      if (error) return toast.error(error.message);
    }
    load();
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground p-4">Carregando jornada...</p>;
  }

  // Resolve form for invite
  const formTitle = (formId: string) => forms.find((f) => f.id === formId)?.title ?? "Formulário";

  return (
    <div className="space-y-4">
      {/* PRÉ-CONSULTORIA */}
      <PreCard
        forms={formsByKey("formulario", 0)}
        invites={invites}
        responses={responses}
        onGenerate={generateInvite}
        onCopy={copyInvite}
        formTitle={formTitle}
        expanded={expanded === "pre"}
        onToggle={() => setExpanded(expanded === "pre" ? null : "pre")}
      />

      {/* ENCONTROS */}
      {ENCONTROS.map((e) => {
        const formularioForm = formsByKey("formulario", e.numero);
        const licaoForm = formsByKey("licao_casa", e.numero);
        const enc = encontros.find((x) => x.numero === e.numero);
        return (
          <EncontroCard
            key={e.numero}
            encontro={e}
            formulario={formularioForm[0]}
            licao={licaoForm[0]}
            invites={invites}
            responses={responses}
            submissions={submissions}
            enc={enc}
            onGenerate={generateInvite}
            onCopy={copyInvite}
            onSaveEncontro={(patch) => upsertEncontro(e.numero, patch)}
            formTitle={formTitle}
            expanded={expanded === e.numero}
            onToggle={() => setExpanded(expanded === e.numero ? null : e.numero)}
          />
        );
      })}
    </div>
  );
}

/* -------- Pre-consultoria card -------- */

function PreCard({
  forms,
  invites,
  responses,
  onGenerate,
  onCopy,
  formTitle,
  expanded,
  onToggle,
}: any) {
  const form = forms[0];
  const invite = form ? invites.find((i: any) => i.form_id === form.id) : undefined;
  const response = form ? responses.find((r: any) => r.form_id === form.id) : undefined;
  const submitted = !!(invite?.submitted_at || response);
  const answers = response?.answers ?? invite?.answers;

  return (
    <div className="bg-card border border-brand/15 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-brand-soft/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-display text-lg font-bold">
          0
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Etapa inicial
          </div>
          <div className="font-display text-lg font-semibold">{PRE_CONSULTORIA.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{PRE_CONSULTORIA.subtitle}</div>
        </div>
        <StatusBadge done={submitted} pendingLabel="Aguardando" doneLabel="Respondido" />
      </button>

      {expanded && form && (
        <div className="px-5 pb-5 space-y-3 border-t border-brand/10">
          <FormRow
            form={form}
            invite={invite}
            answers={answers}
            onGenerate={onGenerate}
            onCopy={onCopy}
            formTitle={formTitle}
          />
        </div>
      )}
    </div>
  );
}

/* -------- Encontro card -------- */

function EncontroCard({
  encontro,
  formulario,
  licao,
  invites,
  responses,
  submissions,
  enc,
  onGenerate,
  onCopy,
  onSaveEncontro,
  formTitle,
  expanded,
  onToggle,
}: any) {
  const fInvite = formulario ? invites.find((i: any) => i.form_id === formulario.id) : undefined;
  const fResp = formulario ? responses.find((r: any) => r.form_id === formulario.id) : undefined;
  const fAnswers = fResp?.answers ?? fInvite?.answers;
  const fDone = !!(fInvite?.submitted_at || fResp);

  const lInvite = licao ? invites.find((i: any) => i.form_id === licao.id) : undefined;
  const lResp = licao ? responses.find((r: any) => r.form_id === licao.id) : undefined;
  const lSub = licao ? submissions.find((s: any) => s.form_id === licao.id) : undefined;
  const lAnswers = lResp?.answers ?? lInvite?.answers ?? lSub?.answers;
  const lDone = !!(lInvite?.submitted_at || lResp || lSub?.submitted_at);

  const encDone = enc?.status === "realizado";

  return (
    <div className="bg-card border border-brand/15 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-brand-soft/40 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-brand text-brand-foreground flex items-center justify-center font-display text-lg font-bold shadow-sm shadow-brand/20">
          {encontro.letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Encontro {encontro.numero} · {encontro.letterFull}
          </div>
          <div className="font-display text-lg font-semibold">{encontro.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {encontro.pergunta}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge done={fDone} pendingLabel="Form pendente" doneLabel="Form ok" small />
          {encontro.licaoCasa && (
            <StatusBadge done={lDone} pendingLabel="Lição pendente" doneLabel="Lição ok" small />
          )}
          <StatusBadge done={encDone} pendingLabel="Encontro a fazer" doneLabel="Realizado" small />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-brand/10">
          {/* Formulário */}
          {formulario && (
            <div>
              <div className="flex items-center gap-2 mt-4 mb-2">
                <FileText className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-semibold">Formulário do encontro</h3>
              </div>
              <FormRow
                form={formulario}
                invite={fInvite}
                answers={fAnswers}
                onGenerate={onGenerate}
                onCopy={onCopy}
                formTitle={formTitle}
              />
            </div>
          )}

          {/* Lição de casa */}
          {licao && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pencil className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-semibold">
                  Lição de casa → prepara o E{encontro.numero + 1}
                </h3>
              </div>
              <FormRow
                form={licao}
                invite={lInvite}
                answers={lAnswers}
                onGenerate={onGenerate}
                onCopy={onCopy}
                formTitle={formTitle}
              />
            </div>
          )}

          {/* Encontro: anotações da call */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-semibold">Sessão (call)</h3>
            </div>
            <EncontroEditor enc={enc} onSave={onSaveEncontro} numero={encontro.numero} />
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- Sub-components -------- */

function StatusBadge({
  done,
  pendingLabel,
  doneLabel,
  small,
}: {
  done: boolean;
  pendingLabel: string;
  doneLabel: string;
  small?: boolean;
}) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs"
      } ${
        done ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      <Icon className={small ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {done ? doneLabel : pendingLabel}
    </span>
  );
}

function FormRow({
  form,
  invite,
  answers,
  onGenerate,
  onCopy,
}: any) {
  const [showAnswers, setShowAnswers] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{form.title}</div>
          {form.description && (
            <div className="text-xs text-muted-foreground line-clamp-1">{form.description}</div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!invite ? (
            <button
              onClick={() => onGenerate(form.id)}
              className="inline-flex items-center gap-1.5 bg-brand text-brand-foreground px-3 py-1.5 rounded-md font-semibold text-xs hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" />
              Gerar link
            </button>
          ) : (
            <>
              <button
                onClick={() => onCopy(invite.token)}
                className="inline-flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-md text-xs hover:border-brand"
                title={`${origin}/f/${invite.token}`}
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar link
              </button>
              {answers && (
                <button
                  onClick={() => setShowAnswers((v) => !v)}
                  className="inline-flex items-center gap-1.5 bg-background border border-border/60 px-3 py-1.5 rounded-md text-xs hover:border-brand"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {showAnswers ? "Ocultar respostas" : "Ver respostas"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {showAnswers && answers && (
        <pre className="mt-3 text-xs whitespace-pre-wrap break-words bg-background rounded-md p-3 max-h-80 overflow-auto border border-border/40">
          {JSON.stringify(answers, null, 2)}
        </pre>
      )}
    </div>
  );
}

function EncontroEditor({
  enc,
  onSave,
  numero,
}: {
  enc: EncontroRow | undefined;
  onSave: (patch: Partial<EncontroRow>) => void;
  numero: number;
}) {
  const [scheduledAt, setScheduledAt] = useState(enc?.scheduled_at?.slice(0, 16) ?? "");
  const [meetUrl, setMeetUrl] = useState(enc?.meet_url ?? "");
  const [notes, setNotes] = useState(enc?.notes ?? "");
  const [nextSteps, setNextSteps] = useState(enc?.next_steps ?? "");
  const [status, setStatus] = useState(enc?.status ?? "agendar");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setScheduledAt(enc?.scheduled_at?.slice(0, 16) ?? "");
    setMeetUrl(enc?.meet_url ?? "");
    setNotes(enc?.notes ?? "");
    setNextSteps(enc?.next_steps ?? "");
    setStatus(enc?.status ?? "agendar");
  }, [enc?.id]);

  async function save() {
    setSaving(true);
    await onSave({
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      meet_url: meetUrl || null,
      notes: notes || null,
      next_steps: nextSteps || null,
      status,
      completed_at:
        status === "realizado"
          ? enc?.completed_at ?? new Date().toISOString()
          : null,
    });
    toast.success(`Encontro ${numero} atualizado.`);
    setSaving(false);
  }

  return (
    <div className="bg-muted/40 rounded-lg p-3 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Data e hora
          </span>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1 w-full bg-background border border-border/60 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full bg-background border border-border/60 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand"
          >
            <option value="agendar">A agendar</option>
            <option value="agendado">Agendado</option>
            <option value="realizado">Realizado</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Link Meet/Zoom
        </span>
        <input
          type="url"
          value={meetUrl}
          placeholder="https://meet.google.com/..."
          onChange={(e) => setMeetUrl(e.target.value)}
          className="mt-1 w-full bg-background border border-border/60 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand"
        />
      </label>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Anotações do encontro
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 w-full bg-background border border-border/60 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-brand"
        />
      </label>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Próximos passos / tarefas
        </span>
        <textarea
          value={nextSteps}
          onChange={(e) => setNextSteps(e.target.value)}
          rows={2}
          className="mt-1 w-full bg-background border border-border/60 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:border-brand"
        />
      </label>
      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-1.5 bg-brand text-brand-foreground px-3 py-1.5 rounded-md text-xs font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        Salvar encontro
      </button>
    </div>
  );
}
