import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  buildSteps,
  isAnswerEmpty,
  type FormField,
  type FormAnswers,
  type FieldValue,
} from "@/lib/form-types";
import { VoiceButton } from "@/components/forms/VoiceButton";

interface StepFormProps {
  fields: FormField[];
  /** Called with all answers when the user finishes the last step. */
  onSubmit: (answers: FormAnswers) => void | Promise<void>;
  submitting?: boolean;
  initialAnswers?: FormAnswers;
  submitLabel?: string;
}

/**
 * Page-by-page (typeform-style) form renderer driven by `schema.fields[]`.
 * One question per screen, progress bar, back/next, validation, animated
 * transitions and a free voice-dictation button on text fields.
 * Reusable across lead form, briefing and the 4 encontros.
 */
export function StepForm({
  fields,
  onSubmit,
  submitting = false,
  initialAnswers = {},
  submitLabel = "Enviar respostas",
}: StepFormProps) {
  const steps = useMemo(() => buildSteps(fields), [fields]);
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [error, setError] = useState<string | null>(null);

  const total = steps.length;
  const step = steps[index];
  const isLast = index === total - 1;
  const value = answers[step.field.id];

  const setValue = useCallback(
    (v: FieldValue) => {
      setError(null);
      setAnswers((prev) => ({ ...prev, [step.field.id]: v }));
    },
    [step.field.id],
  );

  const goNext = useCallback(() => {
    if (step.field.required && isAnswerEmpty(step.field, answers[step.field.id])) {
      setError("Essa pergunta é obrigatória.");
      return;
    }
    setError(null);
    if (isLast) {
      void onSubmit(answers);
      return;
    }
    setDir(1);
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [step.field, answers, isLast, onSubmit, total]);

  const goBack = useCallback(() => {
    setError(null);
    setDir(-1);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="uppercase tracking-[0.2em]">
            {index + 1} <span className="opacity-50">/ {total}</span>
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-brand/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-brand"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step.field.id}
          custom={dir}
          initial={{ opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -40 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {step.section && (
            <div className="mb-4">
              <span className="inline-block rounded-full bg-brand-soft text-brand px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold">
                {step.section.label}
              </span>
            </div>
          )}

          <StepField field={step.field} value={value} onChange={setValue} onEnter={goNext} />

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-7 py-3.5 text-sm font-semibold shadow-lg shadow-brand/20 hover:bg-brand/90 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {isLast ? (
            <>
              {submitting ? "Enviando..." : submitLabel}
              {!submitting && <Check className="w-4 h-4" />}
            </>
          ) : (
            <>
              Avançar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Pressione <kbd className="px-1 rounded bg-muted">Enter</kbd> para avançar · Consultoria CRIAR · KWK
      </p>
    </div>
  );
}

/* ─── Single field renderer ─── */

function StepField({
  field,
  value,
  onChange,
  onEnter,
}: {
  field: FormField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  onEnter: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Autofocus the text field when the step appears.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [field.id]);

  const appendTranscript = (text: string) => {
    const current = typeof value === "string" ? value : "";
    onChange(current ? `${current} ${text}` : text);
  };

  const isText = field.type === "short" || field.type === "long";

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-foreground leading-snug">
        {field.label}
        {field.required && <span className="text-brand ml-1">*</span>}
      </h2>
      {field.helper && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{field.helper}</p>
      )}

      <div className="mt-6">
        {field.type === "short" && (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              maxLength={300}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnter();
                }
              }}
              className="flex-1 bg-background border-0 border-b-2 border-border focus:border-brand rounded-none px-1 py-3 text-lg focus:outline-none transition-colors"
            />
            <VoiceButton onTranscript={appendTranscript} />
          </div>
        )}

        {field.type === "long" && (
          <div>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              rows={4}
              maxLength={2000}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onEnter();
                }
              }}
              className="w-full bg-background border border-border/60 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-y"
            />
            <div className="mt-2 flex justify-end">
              <VoiceButton onTranscript={appendTranscript} />
            </div>
          </div>
        )}

        {field.type === "choice" && (
          <div className="space-y-2.5">
            {(field.options ?? []).map((opt) => {
              const checked = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    checked
                      ? "border-brand bg-brand-soft/50 shadow-sm"
                      : "border-border/60 bg-background hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ${
                      checked ? "border-brand bg-brand" : "border-muted-foreground/40"
                    }`}
                  />
                  <span className="text-sm md:text-base leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {field.type === "multichoice" && (
          <div className="space-y-2.5">
            {(field.options ?? []).map((opt) => {
              const arr = (value as string[]) ?? [];
              const checked = arr.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    onChange(checked ? arr.filter((x) => x !== opt) : [...arr, opt])
                  }
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                    checked
                      ? "border-brand bg-brand-soft/50 shadow-sm"
                      : "border-border/60 bg-background hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded-md border-2 flex items-center justify-center ${
                      checked ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/40"
                    }`}
                  >
                    {checked && <Check className="w-3 h-3" />}
                  </span>
                  <span className="text-sm md:text-base leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isText && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Dica: toque em <span className="text-brand font-medium">Falar</span> para ditar por voz.
        </p>
      )}
    </div>
  );
}

export default StepForm;
