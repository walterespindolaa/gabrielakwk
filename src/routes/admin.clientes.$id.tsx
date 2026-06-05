import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Send, Copy, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { STAGES, type StageKey } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth-guard";
import { updateUserRole, deleteUser } from "@/lib/admin.functions";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/clientes/$id")({
  component: ClienteDetail,
});

interface Profile {
  id: string;
  full_name: string | null;
  role: "admin" | "consultora" | "cliente";
  created_at: string;
}

interface Material {
  id: string;
  title: string;
  stage: string | null;
  type: string;
}

interface Assignment {
  material_id: string;
  unlocked: boolean;
}

const STATUS_OPTIONS = ["pendente", "em_andamento", "concluido"] as const;

function ClienteDetail() {
  const { id } = Route.useParams();
  const me = useCurrentUser();
  const navigate = useNavigate();
  const updateRoleFn = useServerFn(updateUserRole);
  const deleteUserFn = useServerFn(deleteUser);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedRole, setEditedRole] = useState<Profile["role"]>("cliente");
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Set<string>>(new Set());
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [p, jp, mats, ass, resp] = await Promise.all([
      supabase.from("profiles").select("id, full_name, role, created_at").eq("id", id).maybeSingle(),
      supabase.from("journey_progress").select("stage, status").eq("cliente_id", id),
      supabase.from("materials").select("id, title, stage, type").order("created_at", { ascending: false }),
      supabase.from("material_assignments").select("material_id, unlocked").eq("cliente_id", id),
      supabase
        .from("form_responses")
        .select("id, form_id, answers, submitted_at, forms:form_id(title)")
        .eq("cliente_id", id)
        .order("submitted_at", { ascending: false }),
    ]);
    const prof = p.data as Profile | null;
    setProfile(prof);
    setEditedName(prof?.full_name ?? "");
    setEditedRole(prof?.role ?? "cliente");

    const prog: Record<string, string> = {};
    STAGES.forEach((s) => (prog[s.key] = "pendente"));
    (jp.data ?? []).forEach((row: any) => (prog[row.stage] = row.status));
    setProgress(prog);

    setMaterials((mats.data as Material[]) ?? []);
    setAssignments(new Set(((ass.data as Assignment[]) ?? []).map((a) => a.material_id)));
    setResponses(resp.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function saveProfile() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editedName })
        .eq("id", id);
      if (error) throw error;

      if (editedRole !== profile?.role) {
        if (me.role !== "admin") {
          toast.error("Apenas admin pode alterar papéis.");
        } else {
          await updateRoleFn({ data: { user_id: id, role: editedRole } });
        }
      }
      toast.success("Dados atualizados.");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function setStageStatus(stage: StageKey, status: string) {
    setProgress((prev) => ({ ...prev, [stage]: status }));
    const { error } = await supabase
      .from("journey_progress")
      .upsert({ cliente_id: id, stage, status }, { onConflict: "cliente_id,stage" });
    if (error) {
      toast.error("Erro ao atualizar etapa.");
    }
  }

  async function toggleMaterial(materialId: string, assign: boolean) {
    if (assign) {
      const { error } = await supabase
        .from("material_assignments")
        .insert({ cliente_id: id, material_id: materialId, unlocked: true });
      if (error) {
        toast.error("Erro ao atribuir material.");
        return;
      }
      setAssignments((s) => new Set(s).add(materialId));
    } else {
      const { error } = await supabase
        .from("material_assignments")
        .delete()
        .eq("cliente_id", id)
        .eq("material_id", materialId);
      if (error) {
        toast.error("Erro ao remover material.");
        return;
      }
      setAssignments((s) => {
        const n = new Set(s);
        n.delete(materialId);
        return n;
      });
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este usuário permanentemente?")) return;
    try {
      await deleteUserFn({ data: { user_id: id } });
      toast.success("Usuário excluído.");
      navigate({ to: "/admin/clientes" });
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao excluir.");
    }
  }

  if (loading) {
    return <p className="p-10 text-sm text-muted-foreground">Carregando...</p>;
  }
  if (!profile) {
    return <p className="p-10 text-sm text-muted-foreground">Usuário não encontrado.</p>;
  }

  const canEditRole = me.role === "admin";
  const canDelete = me.role === "admin" || profile.role === "cliente";

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <Link
        to="/admin/clientes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para clientes
      </Link>

      <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">
            {profile.full_name ?? "Sem nome"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="capitalize">{profile.role}</span> · Desde{" "}
            {new Date(profile.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 text-sm text-destructive hover:underline"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        )}
      </div>

      {/* Dados */}
      <section className="mt-8 bg-card border border-border/60 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Dados</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Nome</span>
            <input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Papel</span>
            <select
              disabled={!canEditRole}
              value={editedRole}
              onChange={(e) => setEditedRole(e.target.value as any)}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand disabled:opacity-60"
            >
              <option value="cliente">Cliente</option>
              <option value="consultora">Consultora</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="mt-4 px-4 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </section>

      {/* Jornada */}
      <section className="mt-6 bg-card border border-border/60 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Jornada CRIAR</h2>
        <div className="space-y-2">
          {STAGES.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30"
            >
              <div>
                <span className="inline-block w-7 h-7 rounded-md bg-brand text-brand-foreground text-xs font-bold leading-7 text-center mr-3">
                  {s.short}
                </span>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              <select
                value={progress[s.key] ?? "pendente"}
                onChange={(e) => setStageStatus(s.key, e.target.value)}
                className="bg-background border border-border/60 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o === "pendente" ? "Pendente" : o === "em_andamento" ? "Em andamento" : "Concluído"}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Materiais */}
      <section className="mt-6 bg-card border border-border/60 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Materiais atribuídos</h2>
        {materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum material disponível.{" "}
            <Link to="/admin/materiais" className="text-brand hover:underline">
              Criar material
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {materials.map((m) => {
              const assigned = assignments.has(m.id);
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/30"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.type.toUpperCase()} · {m.stage ?? "geral"}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMaterial(m.id, !assigned)}
                    className={`text-xs px-3 py-1.5 rounded-md font-semibold ${
                      assigned
                        ? "bg-brand-soft text-brand"
                        : "bg-background border border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {assigned ? "Atribuído" : "Atribuir"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Respostas */}
      <section className="mt-6 mb-10 bg-card border border-border/60 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Respostas de formulários</h2>
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma resposta enviada.</p>
        ) : (
          <ul className="space-y-3">
            {responses.map((r: any) => (
              <li key={r.id} className="p-4 rounded-lg bg-muted/30">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">{r.forms?.title ?? "Formulário"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.submitted_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                  {JSON.stringify(r.answers, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
