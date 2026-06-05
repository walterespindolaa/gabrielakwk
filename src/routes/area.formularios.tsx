import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Check, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { toast } from "sonner";

export const Route = createFileRoute("/area/formularios")({
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
}

function FormulariosPage() {
  const auth = useCurrentUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<Form | null>(null);

  async function load() {
    if (!auth.userId) return;
    setLoading(true);
    const [{ data: fs }, { data: rs }] = await Promise.all([
      supabase
        .from("forms")
        .select("id, title, description, stage, schema")
        .order("created_at", { ascending: false }),
      supabase.from("form_responses").select("form_id").eq("cliente_id", auth.userId!),
    ]);
    setForms((fs as Form[]) ?? []);
    setAnswered(new Set((rs ?? []).map((r: any) => r.form_id)));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [auth.userId]);

  if (activeForm) {
    return (
      <FillForm
        form={activeForm}
        onClose={() => setActiveForm(null)}
        onSubmitted={() => {
          setActiveForm(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight">Formulários</h1>
      <p className="text-muted-foreground mt-2">
        Materiais reflexivos para sua jornada CRIAR.
      </p>

      <div className="mt-8 space-y-3">
        {loading ? (
          [0, 1].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-5 h-24 animate-pulse"
            />
          ))
        ) : forms.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-soft flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-brand" />
            </div>
            <h3 className="font-display text-xl mt-4">Nenhum formulário disponível</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Quando a consultora liberar um formulário para você, ele aparece aqui.
            </p>
          </div>
        ) : (
          forms.map((f) => {
            const done = answered.has(f.id);
            return (
              <button
                key={f.id}
                onClick={() => setActiveForm(f)}
                className="w-full bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4 hover:border-brand/60 transition-colors text-left"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    done ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand"
                  }`}
                >
                  {done ? <Check className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{f.title}</div>
                  {f.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {f.description}
                    </p>
                  )}
                </div>
                {done && (
                  <span className="text-xs font-semibold text-brand bg-brand-soft px-2.5 py-1 rounded-full flex-shrink-0">
                    Respondido
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function FillForm({
  form,
  onClose,
  onSubmitted,
}: {
  form: Form;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const auth = useCurrentUser();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const fields = form.schema?.fields ?? [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.userId) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("form_responses").insert({
        form_id: form.id,
        cliente_id: auth.userId,
        answers,
      });
      if (error) throw error;
      toast.success("Resposta enviada!");
      onSubmitted();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </button>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight mt-4">{form.title}</h1>
      {form.description && (
        <p className="text-muted-foreground mt-2">{form.description}</p>
      )}

      <form onSubmit={submit} className="mt-8 space-y-5">
        {fields.map((f) => (
          <div key={f.id} className="bg-card border border-border/60 rounded-2xl p-5">
            <label className="block">
              <span className="text-sm font-semibold">{f.label}</span>
            </label>
            {f.type === "short" && (
              <input
                required
                maxLength={300}
                value={answers[f.id] ?? ""}
                onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })}
                className="mt-3 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              />
            )}
            {f.type === "long" && (
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={answers[f.id] ?? ""}
                onChange={(e) => setAnswers({ ...answers, [f.id]: e.target.value })}
                className="mt-3 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
              />
            )}
            {f.type === "choice" && (
              <div className="mt-3 space-y-2">
                {(f.options ?? []).map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted"
                  >
                    <input
                      type="radio"
                      name={f.id}
                      required
                      value={opt}
                      checked={answers[f.id] === opt}
                      onChange={() => setAnswers({ ...answers, [f.id]: opt })}
                      className="accent-brand"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border/60 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 py-3 rounded-xl bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
    </div>
  );
}
