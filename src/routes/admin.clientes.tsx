import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
// (kept for future server fn usage in modal)
import { supabase } from "@/integrations/supabase/client";
import { createClientUser } from "@/lib/admin.functions";
import { toast } from "sonner";
import { STAGES } from "@/components/admin/AdminLayout";
import { useCurrentUser } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin/clientes")({
  component: ClientesPage,
});

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: "admin" | "consultora" | "cliente";
  created_at: string;
}

function ClientesPage() {
  const me = useCurrentUser();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false });
    const profs = (data as ProfileRow[]) ?? [];
    setRows(profs);

    // progress per client
    const clientIds = profs.filter((p) => p.role === "cliente").map((p) => p.id);
    if (clientIds.length) {
      const { data: prog } = await supabase
        .from("journey_progress")
        .select("cliente_id, status")
        .in("cliente_id", clientIds);
      const counts: Record<string, number> = {};
      (prog ?? []).forEach((p: any) => {
        if (p.status === "concluido") counts[p.cliente_id] = (counts[p.cliente_id] ?? 0) + 1;
      });
      setProgress(counts);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Best-effort email lookup for staff via auth.admin not available client-side;
  // we display id/profile only. Emails appear in detail page via server fn if needed.

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gerencie acessos e acompanhe a jornada.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo acesso
        </button>
      </div>

      <div className="mt-8 bg-card border border-border/60 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhum usuário ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Papel</th>
                  <th className="px-5 py-3 font-medium">Criado</th>
                  <th className="px-5 py-3 font-medium">Jornada</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="px-5 py-3">{r.full_name ?? "Sem nome"}</td>
                    <td className="px-5 py-3 capitalize">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          r.role === "cliente"
                            ? "bg-muted text-muted-foreground"
                            : "bg-brand-soft text-brand"
                        }`}
                      >
                        {r.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.role === "cliente"
                        ? `${progress[r.id] ?? 0} / ${STAGES.length}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to="/admin/clientes/$id"
                        params={{ id: r.id }}
                        className="text-brand hover:underline text-sm"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <NewAccessModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
          canCreateStaff={me.role === "admin"}
        />
      )}
    </div>
  );
}

function NewAccessModal({
  onClose,
  onCreated,
  canCreateStaff,
}: {
  onClose: () => void;
  onCreated: () => void;
  canCreateStaff: boolean;
}) {
  const createFn = useServerFn(createClientUser);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "cliente" as "admin" | "consultora" | "cliente",
  });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      await createFn({ data: form });
      toast.success("Acesso criado com sucesso.");
      onCreated();
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao criar acesso.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-display text-2xl">Novo acesso</h2>
        <p className="text-sm text-muted-foreground mt-1">
          O novo usuário poderá entrar imediatamente com a senha definida.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Nome</span>
            <input
              required
              maxLength={120}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</span>
            <input
              required
              type="email"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Senha inicial
            </span>
            <input
              required
              type="text"
              minLength={8}
              maxLength={128}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand font-mono"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Papel</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            >
              <option value="cliente">Cliente</option>
              {canCreateStaff && <option value="consultora">Consultora</option>}
              {canCreateStaff && <option value="admin">Admin</option>}
            </select>
            {!canCreateStaff && (
              <p className="text-xs text-muted-foreground mt-1">
                Apenas admin pode criar membros da equipe.
              </p>
            )}
          </label>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border/60 text-sm font-semibold hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 py-2.5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Criando..." : "Criar acesso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
