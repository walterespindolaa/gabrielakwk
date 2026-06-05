import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, FolderOpen, FileText, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

interface RecentClient {
  id: string;
  full_name: string | null;
  created_at: string;
}

function DashboardPage() {
  const [stats, setStats] = useState({ clientes: 0, materiais: 0, forms: 0, responses: 0 });
  const [recent, setRecent] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [clientes, materiais, forms, responses, recentList] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "cliente"),
        supabase.from("materials").select("id", { count: "exact", head: true }),
        supabase.from("forms").select("id", { count: "exact", head: true }),
        supabase.from("form_responses").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id, full_name, created_at")
          .eq("role", "cliente")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);
      setStats({
        clientes: clientes.count ?? 0,
        materiais: materiais.count ?? 0,
        forms: forms.count ?? 0,
        responses: responses.count ?? 0,
      });
      setRecent((recentList.data as RecentClient[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Clientes", value: stats.clientes, icon: Users, to: "/admin/clientes" },
    { label: "Materiais", value: stats.materiais, icon: FolderOpen, to: "/admin/materiais" },
    { label: "Formulários", value: stats.forms, icon: FileText, to: "/admin/formularios" },
    { label: "Respostas", value: stats.responses, icon: Inbox, to: "/admin/formularios" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Visão geral da consultoria.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="bg-card border border-border/60 rounded-xl p-5 hover:border-brand/60 transition-colors group"
            >
              <Icon className="w-5 h-5 text-brand mb-3" />
              <div className="text-3xl font-display tracking-tight">
                {loading ? "—" : c.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {c.label}
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-10 bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="font-semibold">Últimos clientes</h2>
          <Link to="/admin/clientes" className="text-sm text-brand hover:underline">
            Ver todos
          </Link>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando...</p>
        ) : recent.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhum cliente ainda.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recent.map((c) => (
              <li key={c.id} className="px-5 py-3 flex items-center justify-between">
                <Link
                  to="/admin/clientes/$id"
                  params={{ id: c.id }}
                  className="text-sm hover:text-brand"
                >
                  {c.full_name ?? "Sem nome"}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
