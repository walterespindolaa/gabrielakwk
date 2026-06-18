import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { StepForm } from "@/components/forms/StepForm";
import { StickerCollage } from "@/components/ui/sticker-collage";
import monogramAsset from "@/assets/kwk-monogram.png.asset.json";
import {
  LEAD_FORM_FIELDS,
  LEAD_FORM_TITLE,
  LEAD_FORM_DESCRIPTION,
} from "@/lib/lead-form";
import { submitPublicLead } from "@/lib/public-forms.functions";
import type { FormAnswers } from "@/lib/form-types";

export const Route = createFileRoute("/aplicar")({
  component: LeadPage,
});

function LeadPage() {
  const submit = useServerFn(submitPublicLead);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  // Honeypot anti-spam: campo escondido que bots tendem a preencher.
  const [website, setWebsite] = useState("");

  async function handleSubmit(answers: FormAnswers) {
    if (busy) return;
    setBusy(true);
    try {
      await submit({ data: { answers: answers as any, website } });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.message ?? "Não consegui enviar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="relative overflow-hidden bg-brand text-brand-foreground">
        <StickerCollage variant="pullquote" />
        <div className="relative max-w-3xl mx-auto px-5 py-12 md:py-14 text-center">
          <img src={monogramAsset.url} alt="KWK" className="h-16 md:h-20 w-auto mx-auto" />
          <div className="mt-4 text-[10px] md:text-xs uppercase tracking-[0.25em] opacity-80">
            Consultoria CRIAR · KWK
          </div>
          <h1 className="mt-4 font-display text-3xl md:text-5xl tracking-tight">
            {LEAD_FORM_TITLE}
          </h1>
          {!done && (
            <p className="mt-4 text-base md:text-lg opacity-90 leading-relaxed max-w-xl mx-auto">
              {LEAD_FORM_DESCRIPTION}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 md:py-14">
        {done ? (
          <div className="bg-card border border-border/60 rounded-3xl p-10 text-center shadow-sm max-w-xl mx-auto">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <h2 className="font-display text-3xl mt-5">Candidatura recebida!</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
              Obrigada por compartilhar. Vou analisar com carinho e, se fizer sentido, entro em
              contato pelo WhatsApp para conversarmos sobre os próximos passos.
            </p>
          </div>
        ) : (
          <>
            {/* Honeypot — invisível para humanos */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              aria-hidden="true"
            />
            <StepForm
              fields={LEAD_FORM_FIELDS}
              onSubmit={handleSubmit}
              submitting={busy}
              submitLabel="Enviar candidatura"
            />
          </>
        )}
      </main>
    </div>
  );
}
