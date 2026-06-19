import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  Inbox,
  CalendarRange,
  ClipboardCheck,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { listLeads } from "@/lib/public-forms.functions";
import { ENCONTROS } from "@/lib/method-criar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { NotificationsMenu, type NotifItem } from "@/components/NotificationsMenu";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
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
const letterFor = (n: number) => ENCONTROS.find((e) => e.numero === n)?.letterFull ?? `Encontro ${n}`;

function DashboardPage() {
  const auth = useCurrentUser();
  const listFn = useServerFn(listLeads);
  const [greeting, setGreeting] = useState("Olá");
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [respCount, setRespCount] = useState(0);
  const [nameById, setNameById] = useState<Record<string, string>>({});

  useEffect(() => setGreeting(greetingFor(new Date().getHours())), []);

  useEffect(() => {
    (async () => {
      const nowIso = new Date().toISOString();
      const [{ leads: l }, profs, enc, resp] = await Promise.all([
        listFn().catch(() => ({ leads: [] })),
        supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }),
        supabase
          .from("encontros")
          .select("numero, scheduled_at, status, cliente_id")
          .gte("scheduled_at", nowIso)
          .neq("status", "realizado")
          .order("scheduled_at", { ascending: true })
          .limit(6),
        supabase.from("form_responses").select("id", { count: "exact", head: true }),
      ]);
      const allProfiles = (profs.data as any[]) ?? [];
      setClientes(allProfiles.filter((p) => p.role === "cliente"));
      setNameById(Object.fromEntries(allProfiles.map((p) => [p.id, p.full_name ?? "Sem nome"])));
      setLeads((l as any[]) ?? []);
      setUpcoming((enc.data as any[]) ?? []);
      setRespCount(resp.count ?? 0);
      setLoading(false);
    })();
  }, []);

  const leadsAguardando = leads.filter((l) => l.submitted_at && !l.approved_at && !l.cliente_id);
  const recentLeads = leads.filter((l) => !l.cliente_id).slice(0, 5);

  const notifItems: NotifItem[] = leadsAguardando.slice(0, 8).map((l) => ({
    title: `${l.lead_name ?? "Lead"} respondeu o formulário`,
    sub: "Aguardando sua aprovação",
    href: "/admin/leads",
  }));

  const metrics = [
    { label: "Clientes", value: clientes.length, icon: Users, to: "/admin/clientes" },
    { label: "Leads aguardando", value: leadsAguardando.length, icon: Inbox, to: "/admin/leads" },
    { label: "Encontros agendados", value: upcoming.length, icon: CalendarRange, to: "/admin/clientes" },
    { label: "Respostas", value: respCount, icon: ClipboardCheck, to: "/admin/formularios" },
  ];

  return (
    <div className="px-5 md:px-8 py-6 md:py-8 max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm text-muted-foreground">{greeting},</div>
          <div className="font-display text-2xl sm:text-3xl tracking-tight leading-none mt-0.5">
            {auth.fullName?.split(" ")[0] ?? "Gabriela"}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeSwitcher />
          <NotificationsMenu items={notifItems} />
          <div className="flex items-center gap-2.5 bg-card border border-border/60 rounded-full pl-1.5 pr-3.5 py-1.5">
            <div className="w-8 h-8 rounded-full bg-brand text-brand-foreground flex items-center justify-center text-xs font-medium">
              {initials(auth.fullName)}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-medium text-foreground">{auth.fullName?.split(" ")[0] ?? "Admin"}</div>
              <div className="text-[10px] text-muted-foreground capitalize">{auth.role ?? "admin"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              to={m.to}
              className="rounded-2xl bg-card border border-border/60 p-5 hover:shadow-md hover:shadow-brand/5 transition-shadow block"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-display text-3xl tracking-tight">{loading ? "—" : m.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{m.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Próximos encontros */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="px-5 py-3.5 bg-brand text-brand-foreground flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            <span className="font-display text-base">Próximos encontros</span>
          </div>
          {loading ? (
            <p className="p-5 text-sm text-muted-foreground">Carregando...</p>
          ) : upcoming.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Nenhum encontro agendado.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {upcoming.map((e, i) => (
                <li key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center font-display text-base shrink-0">
                    {ENCONTROS.find((x) => x.numero === e.numero)?.letter ?? e.numero}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/admin/clientes/$id"
                      params={{ id: e.cliente_id }}
                      className="text-sm font-medium hover:text-brand truncate block"
                    >
                      {nameById[e.cliente_id] ?? "Cliente"}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      Encontro {e.numero} · {letterFor(e.numero)}
                    </div>
                  </div>
                  <div className="text-xs text-right text-muted-foreground shrink-0">
                    {new Date(e.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Leads recentes + Clientes */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-border/60">
              <h2 className="font-display text-base">Leads recentes</h2>
              <Link to="/admin/leads" className="text-xs text-brand hover:underline">Ver todos</Link>
            </div>
            {loading ? (
              <p className="p-5 text-sm text-muted-foreground">Carregando...</p>
            ) : recentLeads.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Nenhum lead ainda.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {recentLeads.map((l) => {
                  const st = l.approved_at
                    ? { label: "Aprovado", cls: "bg-success/15 text-success" }
                    : l.submitted_at
                      ? { label: "Respondido", cls: "bg-brand-soft text-brand" }
                      : { label: "Pendente", cls: "bg-muted text-muted-foreground" };
                  return (
                    <li key={l.token} className="px-5 py-3 flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{l.lead_name ?? "Sem nome"}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${st.cls}`}>{st.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-border/60">
              <h2 className="font-display text-base">Últimos clientes</h2>
              <Link to="/admin/clientes" className="text-xs text-brand hover:underline">Ver todos</Link>
            </div>
            {loading ? (
              <p className="p-5 text-sm text-muted-foreground">Carregando...</p>
            ) : clientes.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Nenhum cliente ainda.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {clientes.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/admin/clientes/$id"
                      params={{ id: c.id }}
                      className="px-5 py-3 flex items-center justify-between gap-2 hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-sm truncate">{c.full_name ?? "Sem nome"}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
