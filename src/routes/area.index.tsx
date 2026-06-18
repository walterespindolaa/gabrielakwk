import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Calendar,
  FileText,
  Pencil,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { ENCONTROS, PRE_CONSULTORIA, PLATAFORMA_CRIA_URL } from "@/lib/method-criar";
import { StickerCollage } from "@/components/ui/sticker-collage";

export const Route = createFileRoute("/area/")({
  component: JornadaPage,
});

function greetingFor(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function JornadaPage() {
  const auth = useCurrentUser();
  const [forms, setForms] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [encontros, setEncontros] = useState<any[]>([]);
  const [matCount, setMatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => setGreeting(greetingFor(new Date().getHours())), []);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const [fs, rs, inv, enc, mat] = await Promise.all([
        supabase
          .from("forms")
          .select("id, title, kind, encontro, order_index")
          .like("title", "Método CRIAR%")
          .order("order_index"),
        supabase.from("form_responses").select("form_id, submitted_at").eq("cliente_id", auth.userId!),
        supabase.from("form_invites").select("form_id, token, submitted_at").eq("cliente_id", auth.userId!),
        supabase
          .from("encontros")
          .select("numero, scheduled_at, completed_at, meet_url, notes, next_steps, status")
          .eq("cliente_id", auth.userId!)
          .order("numero"),
        supabase
          .from("material_assignments")
          .select("material_id", { count: "exact", head: true })
          .eq("cliente_id", auth.userId!),
      ]);
      setForms(fs.data ?? []);
      setResponses(rs.data ?? []);
      setInvites(inv.data ?? []);
      setEncontros(enc.data ?? []);
      setMatCount(mat.count ?? 0);
      setLoading(false);
    })();
  }, [auth.userId]);

  const firstName = auth.fullName?.split(" ")[0] ?? "olá";
  const isFormDone = (formId: string) =>
    responses.some((r) => r.form_id === formId) ||
    invites.some((i) => i.form_id === formId && i.submitted_at);
  const inviteFor = (formId: string) => invites.find((i) => i.form_id === formId);

  const total = ENCONTROS.length;
  const realizados = encontros.filter((e) => e.status === "realizado").length;
  const allDone = realizados === total;
  const preForm = forms.find((f) => f.kind === "formulario" && f.encontro === 0);
  const licoesPendentes = forms.filter(
    (f) => f.kind === "licao_casa" && !isFormDone(f.id),
  ).length;
  const currentNumero = ENCONTROS.find(
    (e) => encontros.find((x) => x.numero === e.numero)?.status !== "realizado",
  )?.numero;

  // Próximo passo
  let nextStep: { title: string; sub?: string; href?: string; cta?: string; external?: boolean } | null = null;
  if (preForm && !isFormDone(preForm.id)) {
    const inv = inviteFor(preForm.id);
    nextStep = inv
      ? { title: "Responda a pré-consultoria", sub: "O formulário de expectativas antes do Encontro 1", href: `/f/${inv.token}`, cta: "Responder" }
      : { title: "Pré-consultoria a caminho", sub: "A Gabriela vai te enviar o formulário em breve." };
  } else {
    const nextEnc = ENCONTROS.find(
      (e) => encontros.find((x) => x.numero === e.numero)?.status !== "realizado",
    );
    if (nextEnc) {
      const enc = encontros.find((x) => x.numero === nextEnc.numero);
      nextStep = {
        title: `Encontro ${nextEnc.numero} · ${nextEnc.letterFull}`,
        sub: enc?.scheduled_at
          ? new Date(enc.scheduled_at).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })
          : "Encontro a agendar com a Gabriela.",
        href: enc?.meet_url ?? undefined,
        cta: enc?.meet_url ? "Entrar na call" : undefined,
        external: true,
      };
    } else {
      nextStep = { title: "Jornada concluída!", sub: "Sua casa está em ordem. Acesse a plataforma CRIA.", href: PLATAFORMA_CRIA_URL, cta: "Acessar CRIA", external: true };
    }
  }

  return (
    <div className="space-y-7">
      {/* Hero: saudação + próximo passo */}
      <section className="relative overflow-hidden rounded-3xl border border-brand/15 bg-card p-6 sm:p-8">
        <div aria-hidden className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <StickerCollage variant="about" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-mint text-mint-foreground flex items-center justify-center text-base font-medium shrink-0">
              {initials(auth.fullName)}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{greeting},</div>
              <div className="font-display text-2xl sm:text-3xl tracking-tight leading-none mt-0.5">
                {firstName}
              </div>
            </div>
          </div>

          {nextStep && (
            <div className="mt-6 rounded-2xl bg-brand text-brand-foreground p-5 sm:p-6 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Seu próximo passo</div>
                <div className="font-display text-xl sm:text-2xl mt-1.5">{nextStep.title}</div>
                {nextStep.sub && <div className="text-sm opacity-80 mt-1">{nextStep.sub}</div>}
              </div>
              {nextStep.href && nextStep.cta && (
                <a
                  href={nextStep.href}
                  {...(nextStep.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-foreground text-brand px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  {nextStep.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Chips */}
      <div className="grid grid-cols-3 gap-3">
        <Chip value={`${realizados}/${total}`} label="Encontros" />
        <Chip value={licoesPendentes} label="Lições pendentes" />
        <Chip value={matCount} label="Materiais" />
      </div>

      {/* Jornada */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-xl tracking-tight">Sua jornada CRIAR</h2>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Compreender · Reconhecer · Identificar · Ativar · Reorganizar
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border/60 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {preForm && (
              <ClientCard
                letter="0"
                tag="Etapa inicial"
                title={PRE_CONSULTORIA.title}
                subtitle={PRE_CONSULTORIA.subtitle}
                done={isFormDone(preForm.id)}
                actionLabel={isFormDone(preForm.id) ? "Respondido" : "Preencher"}
                actionHref={inviteFor(preForm.id) ? `/f/${inviteFor(preForm.id)!.token}` : undefined}
                actionHint={!inviteFor(preForm.id) ? "Aguardando envio" : undefined}
              />
            )}

            {ENCONTROS.map((e) => {
              const fForm = forms.find((f) => f.kind === "formulario" && f.encontro === e.numero);
              const lForm = forms.find((f) => f.kind === "licao_casa" && f.encontro === e.numero);
              const enc = encontros.find((x) => x.numero === e.numero);
              const fInv = fForm ? inviteFor(fForm.id) : undefined;
              const lInv = lForm ? inviteFor(lForm.id) : undefined;
              const status = enc?.status === "realizado" ? "realizado" : "pendente";
              const isCurrent = e.numero === currentNumero;
              return (
                <div
                  key={e.numero}
                  className={`bg-card rounded-2xl p-5 border transition-shadow ${
                    isCurrent ? "border-brand/40 shadow-md shadow-brand/5" : "border-brand/15"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-xl flex-shrink-0 ${
                        status === "realizado"
                          ? "bg-brand text-brand-foreground"
                          : isCurrent
                            ? "bg-brand text-brand-foreground"
                            : "bg-brand-soft text-brand"
                      }`}
                    >
                      {e.letter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                        Encontro {e.numero} · {e.letterFull}
                      </div>
                      <div className="font-display text-lg mt-0.5">{e.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{e.pergunta}</p>
                    </div>
                    <StatusPill status={status} isCurrent={isCurrent} />
                  </div>

                  <div className="mt-4 space-y-2">
                    {fForm && (
                      <TaskRow
                        icon={FileText}
                        label="Formulário do encontro"
                        done={isFormDone(fForm.id)}
                        href={fInv ? `/f/${fInv.token}` : undefined}
                        hint={!fInv ? "Aguardando envio" : undefined}
                      />
                    )}
                    {lForm && (
                      <TaskRow
                        icon={Pencil}
                        label={
                          e.numero < total
                            ? `Lição de casa → prepara o E${e.numero + 1}`
                            : "Lição de casa final"
                        }
                        done={isFormDone(lForm.id)}
                        href={lInv ? `/f/${lInv.token}` : undefined}
                        hint={!lInv ? `Liberada após o E${e.numero}` : undefined}
                      />
                    )}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40">
                      <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-sm">
                        {enc?.scheduled_at ? (
                          <>
                            <span className="font-medium">
                              {new Date(enc.scheduled_at).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                            {enc.meet_url && (
                              <a
                                href={enc.meet_url}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-2 text-brand font-semibold hover:underline inline-flex items-center gap-1"
                              >
                                entrar <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Encontro a agendar</span>
                        )}
                      </div>
                    </div>
                    {enc?.next_steps && (
                      <div className="px-3 py-2 rounded-xl bg-brand-soft/50 text-sm">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-brand block mb-0.5">
                          Próximos passos
                        </span>
                        {enc.next_steps}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Plataforma CRIA */}
            <div
              className={`rounded-2xl p-6 border ${
                allDone ? "bg-brand text-brand-foreground border-brand" : "bg-card border-dashed border-brand/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    allDone ? "bg-brand-foreground text-brand" : "bg-brand-soft text-brand"
                  }`}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">
                    Pós-consultoria
                  </div>
                  <div className="font-display text-lg">Plataforma CRIA</div>
                  <p className={`text-sm mt-1 ${allDone ? "opacity-90" : "text-muted-foreground"}`}>
                    {allDone
                      ? "Seu acesso está liberado. Continue sua jornada de social media."
                      : `Liberada após concluir os ${total} encontros.`}
                  </p>
                  {allDone && (
                    <a
                      href={PLATAFORMA_CRIA_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 mt-3 bg-brand-foreground text-brand px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90"
                    >
                      Acessar CRIA <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="text-center">
        <Link to="/area/materiais" className="text-sm font-semibold text-brand hover:underline">
          Ver todos os materiais →
        </Link>
      </div>
    </div>
  );
}

function Chip({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 px-4 py-3">
      <div className="font-display text-2xl text-foreground leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1.5">{label}</div>
    </div>
  );
}

function StatusPill({ status, isCurrent }: { status: string; isCurrent: boolean }) {
  if (status === "realizado") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success bg-success/15 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" /> Realizado
      </span>
    );
  }
  if (isCurrent) {
    return (
      <span className="text-xs text-brand bg-brand-soft px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
        Atual
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
      Em breve
    </span>
  );
}

function ClientCard({
  letter,
  tag,
  title,
  subtitle,
  done,
  actionLabel,
  actionHref,
  actionHint,
}: {
  letter: string;
  tag: string;
  title: string;
  subtitle: string;
  done: boolean;
  actionLabel: string;
  actionHref?: string;
  actionHint?: string;
}) {
  return (
    <div className="bg-card border border-brand/15 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
      <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center font-display text-xl flex-shrink-0">
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">{tag}</div>
        <div className="font-display text-lg">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      {done ? (
        <span className="inline-flex items-center gap-1.5 bg-success/15 text-success text-xs font-semibold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> {actionLabel}
        </span>
      ) : actionHref ? (
        <a
          href={actionHref}
          className="inline-flex items-center gap-1.5 bg-brand text-brand-foreground text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90"
        >
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      ) : (
        <span className="text-xs text-muted-foreground italic" title={actionHint}>
          {actionHint ?? actionLabel}
        </span>
      )}
    </div>
  );
}

function TaskRow({
  icon: Icon,
  label,
  done,
  href,
  hint,
}: {
  icon: any;
  label: string;
  done: boolean;
  href?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm flex-1 min-w-0">{label}</span>
      {done ? (
        <span className="text-[10px] uppercase tracking-wider font-bold text-success">Feito</span>
      ) : href ? (
        <a href={href} className="text-xs font-semibold text-brand hover:underline">
          Abrir →
        </a>
      ) : (
        <span className="text-[10px] text-muted-foreground italic">{hint}</span>
      )}
    </div>
  );
}
