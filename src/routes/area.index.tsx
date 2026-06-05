import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Calendar, FileText, Pencil, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { ENCONTROS, PRE_CONSULTORIA, PLATAFORMA_CRIA_URL } from "@/lib/method-criar";

export const Route = createFileRoute("/area/")({
  component: JornadaPage,
});

function JornadaPage() {
  const auth = useCurrentUser();
  const [forms, setForms] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [encontros, setEncontros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const [fs, rs, inv, enc] = await Promise.all([
        supabase
          .from("forms")
          .select("id, title, kind, encontro, order_index")
          .like("title", "Método CRIAR%")
          .order("order_index"),
        supabase.from("form_responses").select("form_id, submitted_at").eq("cliente_id", auth.userId!),
        supabase
          .from("form_invites")
          .select("form_id, token, submitted_at")
          .eq("cliente_id", auth.userId!),
        supabase
          .from("encontros")
          .select("numero, scheduled_at, completed_at, meet_url, notes, next_steps, status")
          .eq("cliente_id", auth.userId!)
          .order("numero"),
      ]);
      setForms(fs.data ?? []);
      setResponses(rs.data ?? []);
      setInvites(inv.data ?? []);
      setEncontros(enc.data ?? []);
      setLoading(false);
    })();
  }, [auth.userId]);

  const firstName = auth.fullName?.split(" ")[0] ?? "olá";

  const isFormDone = (formId: string) =>
    responses.some((r) => r.form_id === formId) ||
    invites.some((i) => i.form_id === formId && i.submitted_at);
  const inviteFor = (formId: string) => invites.find((i) => i.form_id === formId);

  const totalEncontros = encontros.filter((e) => e.status === "realizado").length;
  const allDone = totalEncontros === 4;

  const preForm = forms.find((f) => f.kind === "formulario" && f.encontro === 0);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">
        Método CRIAR
      </p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight"
        style={{ lineHeight: "1.15" }}
      >
        Olá, <span className="italic text-brand">{firstName}</span>.
      </h1>
      <p className="mt-4 text-muted-foreground max-w-xl">
        Sua jornada acontece em 4 encontros, com uma pré-consultoria e lições de casa entre eles.
        Tudo o que você precisa fazer aparece aqui.
      </p>

      {/* Progresso */}
      <div className="mt-10 bg-card border border-brand/15 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Encontros realizados</span>
          <span className="text-sm text-muted-foreground">{totalEncontros} de 4</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: `${(totalEncontros / 4) * 100}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border/60 rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {/* Pré-consultoria */}
          {preForm && (
            <ClientCard
              letter="0"
              accent={false}
              tag="Etapa inicial"
              title={PRE_CONSULTORIA.title}
              subtitle={PRE_CONSULTORIA.subtitle}
              done={isFormDone(preForm.id)}
              actionLabel={isFormDone(preForm.id) ? "Respondido" : "Preencher formulário"}
              actionHref={inviteFor(preForm.id) ? `/f/${inviteFor(preForm.id)!.token}` : undefined}
              actionDisabled={!inviteFor(preForm.id)}
              actionHint={!inviteFor(preForm.id) ? "Aguardando envio pela consultora" : undefined}
            />
          )}

          {/* Encontros */}
          {ENCONTROS.map((e) => {
            const fForm = forms.find((f) => f.kind === "formulario" && f.encontro === e.numero);
            const lForm = forms.find((f) => f.kind === "licao_casa" && f.encontro === e.numero);
            const enc = encontros.find((x) => x.numero === e.numero);
            const fInv = fForm ? inviteFor(fForm.id) : undefined;
            const lInv = lForm ? inviteFor(lForm.id) : undefined;
            return (
              <div key={e.numero} className="bg-card border border-brand/15 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand text-brand-foreground flex items-center justify-center font-display text-lg font-bold flex-shrink-0">
                    {e.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                      Encontro {e.numero} · {e.letterFull}
                    </div>
                    <div className="font-display text-lg font-semibold mt-0.5">{e.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{e.pergunta}</p>
                  </div>
                  {enc?.status === "realizado" && (
                    <CheckCircle2 className="w-5 h-5 text-brand flex-shrink-0" />
                  )}
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
                      label={`Lição de casa → prepara o E${e.numero + 1}`}
                      done={isFormDone(lForm.id)}
                      href={lInv ? `/f/${lInv.token}` : undefined}
                      hint={!lInv ? "Liberada após o E" + e.numero : undefined}
                    />
                  )}
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40">
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
                    {enc?.status === "realizado" ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-brand">
                        Realizado
                      </span>
                    ) : null}
                  </div>
                  {enc?.next_steps && (
                    <div className="px-3 py-2 rounded-lg bg-brand-soft/50 text-sm">
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

          {/* Plataforma CRIA - desbloqueio */}
          <div
            className={`rounded-2xl p-6 border ${
              allDone
                ? "bg-brand text-brand-foreground border-brand"
                : "bg-card border-dashed border-brand/30 text-muted-foreground"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg font-bold flex-shrink-0 ${
                  allDone ? "bg-brand-foreground text-brand" : "bg-brand-soft text-brand"
                }`}
              >
                ✦
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">
                  Pós-consultoria
                </div>
                <div className="font-display text-lg font-semibold">Plataforma CRIA</div>
                <p className="text-sm mt-1 opacity-90">
                  {allDone
                    ? "Seu acesso está liberado. Continue sua jornada de social media."
                    : "Liberada após concluir os 4 encontros."}
                </p>
                {allDone && (
                  <a
                    href={PLATAFORMA_CRIA_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-3 bg-brand-foreground text-brand px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
                  >
                    Acessar CRIA <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/area/materiais" className="text-sm font-semibold text-brand hover:underline">
          Ver materiais →
        </Link>
      </div>
    </div>
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
  actionDisabled,
  actionHint,
}: {
  letter: string;
  accent: boolean;
  tag: string;
  title: string;
  subtitle: string;
  done: boolean;
  actionLabel: string;
  actionHref?: string;
  actionDisabled?: boolean;
  actionHint?: string;
}) {
  return (
    <div className="bg-card border border-brand/15 rounded-2xl p-5 flex items-center gap-4 flex-wrap">
      <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-display text-lg font-bold flex-shrink-0">
        {letter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          {tag}
        </div>
        <div className="font-display text-lg font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      {done ? (
        <span className="inline-flex items-center gap-1.5 bg-brand text-brand-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> {actionLabel}
        </span>
      ) : actionHref && !actionDisabled ? (
        <a
          href={actionHref}
          className="bg-brand text-brand-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90"
        >
          {actionLabel}
        </a>
      ) : (
        <span
          className="text-xs text-muted-foreground italic"
          title={actionHint}
        >
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
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40">
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-brand flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      )}
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm flex-1 min-w-0">{label}</span>
      {done ? (
        <span className="text-[10px] uppercase tracking-wider font-bold text-brand">Feito</span>
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
