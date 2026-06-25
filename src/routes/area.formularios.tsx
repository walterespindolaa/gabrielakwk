import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Check, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { toast } from "sonner";
import { StepForm } from "@/components/forms/StepForm";
import type { FormField, FormAnswers } from "@/lib/form-types";

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
  const [busy, setBusy] = useState(false);
  const fields = (form.schema?.fields ?? []) as unknown as FormField[];

  async function handleSubmit(answers: FormAnswers) {
    if (!auth.userId) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("form_responses").insert({
        form_id: form.id,
        cliente_id: auth.userId,
        answers: answers as any,
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
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </button>
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl md:text-3xl tracking-tight">{form.title}</h1>
        {form.description && <p className="text-muted-foreground mt-2 text-sm">{form.description}</p>}
      </div>
      <StepForm fields={fields} onSubmit={handleSubmit} submitting={busy} submitLabel="Enviar respostas" />
    </div>
  );
}
