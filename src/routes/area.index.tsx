import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarRange,
  ClipboardList,
  Compass,
  Target,
  FileText,
  Pencil,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Circle,
  Lock,
  Sparkles,
  Download,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { ENCONTROS, PRE_CONSULTORIA, PLATAFORMA_CRIA_URL } from "@/lib/method-criar";
import { normalizeSwot } from "@/lib/client-workspace";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { NotificationsMenu, type NotifItem } from "@/components/NotificationsMenu";

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
  const [materials, setMaterials] = useState<any[]>([]);
  const [demandasCount, setDemandasCount] = useState(0);
  const [swotCount, setSwotCount] = useState(0);
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => setGreeting(greetingFor(new Date().getHours())), []);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const uid = auth.userId!;
      const [fs, rs, inv, enc, ass, dem, diag] = await Promise.all([
        supabase.from("forms").select("id, title, kind, encontro, order_index").like("title", "Método CRIAR%").order("order_index"),
        supabase.from("form_responses").select("form_id, submitted_at, forms:form_id(title)").eq("cliente_id", uid),
        supabase.from("form_invites").select("form_id, token, submitted_at").eq("cliente_id", uid),
        supabase.from("encontros").select("numero, scheduled_at, meet_url, next_steps, status").eq("cliente_id", uid).order("numero"),
        supabase.from("material_assignments").select("material_id").eq("cliente_id", uid),
        (supabase as any).from("client_demandas").select("id", { count: "exact", head: true }).eq("cliente_id", uid),
        (supabase as any).from("client_diagnostico").select("swot").eq("cliente_id", uid).maybeSingle(),
      ]);
      setForms(fs.data ?? []);
      setResponses(rs.data ?? []);
      setInvites(inv.data ?? []);
      setEncontros(enc.data ?? []);
      const ids = new Set(((ass.data as any[]) ?? []).map((a) => a.material_id));
      if (ids.size) {
        const { data: mats } = await supabase
          .from("materials")
          .select("id, title, stage, type, file_path, external_url")
          .in("id", Array.from(ids));
        setMaterials(mats ?? []);
      }
      setDemandasCount((dem as any)?.count ?? 0);
      const swot = normalizeSwot((diag as any)?.data?.swot);
      setSwotCount(swot.forcas.length + swot.fraquezas.length + swot.oportunidades.length + swot.ameacas.length);
    })();
  }, [auth.userId]);

  const firstName = auth.fullName?.split(" ")[0] ?? "olá";
  const isFormDone = (formId: string) =>
    responses.some((r) => r.form_id === formId) || invites.some((i) => i.form_id === formId && i.submitted_at);
  const inviteFor = (formId: string) => invites.find((i) => i.form_id === formId);

  const total = ENCONTROS.length;
  const realizados = encontros.filter((e) => e.status === "realizado").length;
  const unlockedThrough = realizados + 1; // libera o próximo quando o anterior é realizado
  const preForm = forms.find((f) => f.kind === "formulario" && f.encontro === 0);
  const preDone = preForm ? isFormDone(preForm.id) : false;
  const licoesPendentes = forms.filter((f) => f.kind === "licao_casa" && !isFormDone(f.id)).length;
  const pendingActions = licoesPendentes + (preForm && !preDone && inviteFor(preForm.id) ? 1 : 0);

  const encUnlocked = (numero: number) => numero <= unlockedThrough;
  const stageUnlocked = (stage: string | null) => {
    if (!stage || stage === "geral") return true;
    const e = ENCONTROS.find((x) => x.key === stage);
    return e ? encUnlocked(e.numero) : true;
  };
  const answeredForms = forms.filter((f) => isFormDone(f.id));

  const notifItems: NotifItem[] = [];
  if (preForm && !preDone && inviteFor(preForm.id)) {
    notifItems.push({ title: "Responda a pré-consultoria", sub: "Antes do Encontro 1", href: `/f/${inviteFor(preForm.id)!.token}` });
  }
  forms
    .filter((f) => f.kind === "licao_casa" && !isFormDone(f.id) && inviteFor(f.id))
    .forEach((f) => notifItems.push({ title: "Lição de casa pendente", sub: f.title.replace("Método CRIAR · ", ""), href: `/f/${inviteFor(f.id)!.token}` }));

  return (
    <div className="space-y-6">
      {/* Cabeçalho: saudação + notificações + dados */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-muted-foreground">{greeting},</div>
          <div className="font-display text-2xl sm:text-3xl tracking-tight leading-none mt-0.5">{firstName}</div>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeSwitcher />
          <NotificationsMenu items={notifItems} />
          <div className="flex items-center gap-2.5 bg-card border border-border/60 rounded-full pl-1.5 pr-3.5 py-1.5">
            <div className="w-8 h-8 rounded-full bg-mint text-mint-foreground flex items-center justify-center text-xs font-medium">
              {initials(auth.fullName)}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-medium text-foreground">{firstName}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{auth.role ?? "cliente"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 cards de topo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <TopCard icon={CalendarRange} title="Cronograma" sub={`${realizados}/${total} encontros`} href="#encontros" />
        <TopCard icon={ClipboardList} title="Demandas" sub={`${demandasCount} ${demandasCount === 1 ? "item" : "itens"}`} to="/area/demandas" />
        <TopCard icon={Compass} title="Diagnóstico" sub="Panorama da marca" to="/area/diagnostico" />
        <TopCard icon={Target} title="Análise SWOT" sub={swotCount > 0 ? `${swotCount} pontos` : "Em preparação"} to="/area/diagnostico" hash="swot" />
      </div>

      {/* Inferior: encontros (principal) + forms/materiais (lateral) */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Encontros */}
        <div id="encontros" className="lg:col-span-2 space-y-3 scroll-mt-20">
          <h2 className="font-display text-xl tracking-tight">Seus encontros</h2>

          {preForm && (
            <PreRow
              done={preDone}
              href={inviteFor(preForm.id) ? `/f/${inviteFor(preForm.id)!.token}` : undefined}
              hint={!inviteFor(preForm.id) ? "Aguardando envio" : undefined}
            />
          )}

          {ENCONTROS.map((e) => {
            const unlocked = encUnlocked(e.numero);
            const enc = encontros.find((x) => x.numero === e.numero);
            const status = enc?.status === "realizado" ? "realizado" : e.numero === unlockedThrough ? "atual" : "bloqueado";
            const fForm = forms.find((f) => f.kind === "formulario" && f.encontro === e.numero);
            const lForm = forms.find((f) => f.kind === "licao_casa" && f.encontro === e.numero);
            const fInv = fForm ? inviteFor(fForm.id) : undefined;
            const lInv = lForm ? inviteFor(lForm.id) : undefined;
            return (
              <div
                key={e.numero}
                className={`rounded-2xl border overflow-hidden ${
                  status === "atual" ? "border-brand/40 shadow-md shadow-brand/5" : "border-brand/15"
                } ${unlocked ? "bg-card" : "bg-card/60"}`}
              >
                {/* Capa vinho */}
                <div className={`px-5 py-3.5 flex items-center gap-3 ${unlocked ? "bg-brand text-brand-foreground" : "bg-brand/40 text-brand-foreground"}`}>
                  <div className="w-9 h-9 rounded-xl bg-brand-foreground/15 flex items-center justify-center font-display text-lg">
                    {unlocked ? e.letter : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                      Encontro {e.numero} · {e.letterFull}
                    </div>
                    <div className="font-display text-lg leading-tight">{e.title}</div>
                  </div>
                  {status === "realizado" && <CheckCircle2 className="w-5 h-5 opacity-90" />}
                  {status === "atual" && (
                    <span className="text-[10px] uppercase tracking-wider bg-brand-foreground/15 px-2 py-1 rounded-full">Atual</span>
                  )}
                </div>

                {/* Corpo */}
                {unlocked ? (
                  <div className="p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">{e.pergunta}</p>
                    {fForm && (
                      <TaskRow icon={FileText} label="Formulário do encontro" done={isFormDone(fForm.id)} href={fInv ? `/f/${fInv.token}` : undefined} hint={!fInv ? "Aguardando envio" : undefined} />
                    )}
                    {lForm && (
                      <TaskRow icon={Pencil} label="Lição de casa" done={isFormDone(lForm.id)} href={lInv ? `/f/${lInv.token}` : undefined} hint={!lInv ? "Em breve" : undefined} />
                    )}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40">
                      <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
                      <div className="flex-1 min-w-0 text-sm">
                        {enc?.scheduled_at ? (
                          <>
                            <span className="font-medium">
                              {new Date(enc.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                            </span>
                            {enc.meet_url && (
                              <a href={enc.meet_url} target="_blank" rel="noreferrer" className="ml-2 text-brand font-semibold hover:underline inline-flex items-center gap-1">
                                entrar <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Encontro a agendar</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    Libera após o Encontro {e.numero - 1}.
                  </div>
                )}
              </div>
            );
          })}

          {/* CRIA */}
          <div className={`rounded-2xl p-5 border ${realizados === total ? "bg-brand text-brand-foreground border-brand" : "bg-card border-dashed border-brand/30"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${realizados === total ? "bg-brand-foreground text-brand" : "bg-brand-soft text-brand"}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-display text-lg">Plataforma CRIA</div>
                <p className={`text-sm ${realizados === total ? "opacity-90" : "text-muted-foreground"}`}>
                  {realizados === total ? "Acesso liberado. Continue sua jornada." : `Liberada após os ${total} encontros.`}
                </p>
              </div>
              {realizados === total && (
                <a href={PLATAFORMA_CRIA_URL} target="_blank" rel="noreferrer" className="bg-brand-foreground text-brand px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 inline-flex items-center gap-1.5">
                  Acessar <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Lateral: forms respondidos + materiais */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <h3 className="font-display text-lg mb-3">Formulários respondidos</h3>
            {answeredForms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum ainda.</p>
            ) : (
              <ul className="space-y-2">
                {answeredForms.slice(0, 6).map((f) => (
                  <li key={f.id} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="truncate">{f.title.replace("Método CRIAR · ", "")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">Materiais</h3>
              <Link to="/area/materiais" className="text-xs text-brand hover:underline">Ver todos</Link>
            </div>
            {materials.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada liberado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {materials.slice(0, 6).map((m) => {
                  const open = stageUnlocked(m.stage);
                  return (
                    <li key={m.id} className="flex items-center gap-2.5 text-sm">
                      {open ? (
                        <FileText className="w-4 h-4 text-brand flex-shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`truncate flex-1 ${open ? "" : "text-muted-foreground"}`}>{m.title}</span>
                      {open && m.external_url && (
                        <a href={m.external_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopCard({
  icon: Icon,
  title,
  sub,
  to,
  href,
  hash,
}: {
  icon: any;
  title: string;
  sub: string;
  to?: string;
  href?: string;
  hash?: string;
}) {
  const inner = (
    <div className="rounded-2xl overflow-hidden border border-border/60 bg-card hover:shadow-md hover:shadow-brand/5 transition-shadow h-full">
      <div className="bg-brand text-brand-foreground px-4 py-3 flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="font-display text-base">{title}</span>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{sub}</span>
        <ArrowRight className="w-4 h-4 text-brand" />
      </div>
    </div>
  );
  if (to) return <Link to={to} hash={hash} className="block h-full">{inner}</Link>;
  return <a href={href} className="block h-full">{inner}</a>;
}

function PreRow({ done, href, hint }: { done: boolean; href?: string; hint?: string }) {
  return (
    <div className="bg-card border border-brand/15 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-display text-lg flex-shrink-0">0</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Etapa inicial</div>
        <div className="font-display text-base">{PRE_CONSULTORIA.title}</div>
      </div>
      {done ? (
        <span className="inline-flex items-center gap-1.5 bg-success/15 text-success text-xs font-semibold px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> Respondido
        </span>
      ) : href ? (
        <a href={href} className="inline-flex items-center gap-1.5 bg-brand text-brand-foreground text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90">
          Preencher <ArrowRight className="w-3.5 h-3.5" />
        </a>
      ) : (
        <span className="text-xs text-muted-foreground italic">{hint}</span>
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
      {done ? <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm flex-1 min-w-0">{label}</span>
      {done ? (
        <span className="text-[10px] uppercase tracking-wider font-bold text-success">Feito</span>
      ) : href ? (
        <a href={href} className="text-xs font-semibold text-brand hover:underline">Abrir →</a>
      ) : (
        <span className="text-[10px] text-muted-foreground italic">{hint}</span>
      )}
    </div>
  );
}
