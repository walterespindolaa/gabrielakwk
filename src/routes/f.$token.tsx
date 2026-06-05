import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { StickerCollage } from "@/components/ui/sticker-collage";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";
import { getInviteForm, submitInviteForm } from "@/lib/public-forms.functions";

export const Route = createFileRoute("/f/$token")({
  component: PublicFormPage,
  head: () => ({
    meta: [
      { title: "Pré-Consultoria · KWK" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type FieldType = "short" | "long" | "choice" | "multichoice" | "section";
interface Field {
  id: string;
  type: FieldType;
  label: string;
  helper?: string;
  required?: boolean;
  options?: string[];
}
interface IntroBlock {
  titulo: string;
  texto: string;
}
interface Schema {
  intro?: {
    como_funciona?: IntroBlock[];
    condicoes?: IntroBlock[];
  };
  fields: Field[];
}
interface FormPayload {
  invite: { token: string; already_submitted: boolean };
  cliente: { full_name: string | null };
  form: { id: string; title: string; description: string | null; schema: Schema };
}

function PublicFormPage() {
  const { token } = Route.useParams();
  const fetchForm = useServerFn(getInviteForm);
  const submitFn = useServerFn(submitInviteForm);

  const [payload, setPayload] = useState<FormPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    fetchForm({ data: { token } })
      .then((res) => {
        if (!active) return;
        setPayload(res as FormPayload);
        if ((res as FormPayload).invite.already_submitted) setDone(true);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message ?? "Convite inválido.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token, fetchForm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payload) return;
    // basic required validation
    const missing = payload.form.schema.fields.find((f) => {
      if (f.type === "section" || !f.required) return false;
      const v = answers[f.id];
      if (f.type === "multichoice") return !Array.isArray(v) || v.length === 0;
      return !v || (typeof v === "string" && v.trim() === "");
    });
    if (missing) {
      toast.error(`Preencha: ${missing.label}`);
      return;
    }
    setBusy(true);
    try {
      // normalize multichoice to JSON string-stored values
      const normalized: Record<string, string | string[]> = {};
      for (const f of payload.form.schema.fields) {
        if (f.type === "section") continue;
        const v = answers[f.id];
        if (v === undefined) continue;
        normalized[f.id] = v;
      }
      await submitFn({ data: { token, answers: normalized } });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Carregando convite...
      </div>
    );
  }
  if (error || !payload) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-3xl text-foreground">Convite indisponível</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {error ?? "Este link expirou ou não existe."}
          </p>
        </div>
      </div>
    );
  }

  const schema = payload.form.schema;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="relative overflow-hidden bg-brand text-brand-foreground">
        <StickerCollage variant="pullquote" />
        <div className="relative max-w-3xl mx-auto px-5 py-12 md:py-16">
          <div className="flex items-center gap-3">
            <img src={monogramAsset.url} alt="KWK" className="h-14 w-auto" />
            <div className="text-xs uppercase tracking-[0.25em] opacity-80">
              Consultoria CRIAR · KWK
            </div>
          </div>
          <h1 className="mt-6 font-display text-3xl md:text-5xl tracking-tight">
            {payload.form.title}
          </h1>
          {payload.cliente.full_name && (
            <p className="mt-3 text-sm opacity-80">
              Olá, <span className="font-semibold">{payload.cliente.full_name}</span> — esse
              formulário foi preparado especialmente pra você.
            </p>
          )}
          {payload.form.description && (
            <p className="mt-5 text-base md:text-lg opacity-90 leading-relaxed max-w-2xl">
              {payload.form.description}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 md:py-14">
        {done ? (
          <div className="bg-card border border-border/60 rounded-3xl p-10 text-center shadow-sm">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <h2 className="font-display text-3xl mt-5">Recebido. Obrigada!</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Suas respostas chegaram com sucesso. Em breve entro em contato pelo WhatsApp pra
              alinharmos os próximos passos.
            </p>
          </div>
        ) : (
          <>
            {/* Intro: Como funciona */}
            {schema.intro?.como_funciona && (
              <IntroSection
                badge="Como funciona"
                icon={<Sparkles className="w-3.5 h-3.5" />}
                items={schema.intro.como_funciona}
              />
            )}
            {/* Intro: Condições */}
            {schema.intro?.condicoes && (
              <IntroSection
                badge="Condições importantes"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                items={schema.intro.condicoes}
              />
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {schema.fields.map((f) =>
                f.type === "section" ? (
                  <SectionHeader key={f.id} label={f.label} helper={f.helper} />
                ) : (
                  <FieldCard
                    key={f.id}
                    field={f}
                    value={answers[f.id]}
                    onChange={(v) => setAnswers((prev) => ({ ...prev, [f.id]: v }))}
                  />
                ),
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground py-4 text-sm font-semibold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {busy ? "Enviando..." : "Enviar respostas"}
                  {!busy && <ArrowRight className="w-4 h-4" />}
                </button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Consultoria CRIAR · Gabriela Kawikioni · KWK
                </p>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

function IntroSection({
  badge,
  icon,
  items,
}: {
  badge: string;
  icon: React.ReactNode;
  items: IntroBlock[];
}) {
  return (
    <section className="mt-2 mb-10">
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft text-brand px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold">
        {icon}
        {badge}
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="bg-surface-alt border border-brand/15 rounded-2xl p-5 shadow-sm"
          >
            <h3 className="font-display text-lg text-foreground">{it.titulo}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{it.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ label, helper }: { label: string; helper?: string }) {
  return (
    <div className="pt-8 first:pt-0">
      <div className="inline-block rounded-full bg-brand text-brand-foreground px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold">
        {label}
      </div>
      {helper && <p className="text-sm text-muted-foreground mt-2">{helper}</p>}
    </div>
  );
}

function FieldCard({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 md:p-6 shadow-sm">
      <label className="block">
        <span className="text-sm md:text-base font-semibold text-foreground">
          {field.label}
          {field.required && <span className="text-brand ml-1">*</span>}
        </span>
        {field.helper && (
          <span className="block text-xs text-muted-foreground mt-1">{field.helper}</span>
        )}
      </label>

      {field.type === "short" && (
        <input
          maxLength={300}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
        />
      )}

      {field.type === "long" && (
        <textarea
          rows={4}
          maxLength={2000}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full bg-background border border-border/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-y"
        />
      )}

      {field.type === "choice" && (
        <div className="mt-3 space-y-2">
          {(field.options ?? []).map((opt) => {
            const checked = value === opt;
            return (
              <label
                key={opt}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? "border-brand bg-brand-soft/50"
                    : "border-border/60 bg-background hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={checked}
                  onChange={() => onChange(opt)}
                  className="mt-0.5 accent-brand"
                />
                <span className="text-sm leading-snug">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {field.type === "multichoice" && (
        <div className="mt-3 space-y-2">
          {(field.options ?? []).map((opt) => {
            const arr = (value as string[]) ?? [];
            const checked = arr.includes(opt);
            return (
              <label
                key={opt}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  checked
                    ? "border-brand bg-brand-soft/50"
                    : "border-border/60 bg-background hover:bg-muted/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? arr.filter((x) => x !== opt) : [...arr, opt];
                    onChange(next);
                  }}
                  className="mt-0.5 accent-brand"
                />
                <span className="text-sm leading-snug">{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
