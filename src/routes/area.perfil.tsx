import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User as UserIcon, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { toast } from "sonner";

export const Route = createFileRoute("/area/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const auth = useCurrentUser();
  const [fullName, setFullName] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [pwdBusy, setPwdBusy] = useState(false);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const [{ data: profile }, { data: user }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", auth.userId!)
          .maybeSingle(),
        supabase.auth.getUser(),
      ]);
      setFullName(profile?.full_name ?? "");
      setEmail(user.user?.email ?? "");
      if (profile?.avatar_url) {
        setAvatarPath(profile.avatar_url);
        const { data } = await supabase.storage
          .from("avatars")
          .createSignedUrl(profile.avatar_url, 3600);
        setAvatarUrl(data?.signedUrl ?? null);
      }
    })();
  }, [auth.userId]);

  async function saveName() {
    if (!auth.userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", auth.userId!);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Nome atualizado.");
  }

  async function uploadAvatar(file: File) {
    if (!auth.userId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem maior que 5MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${auth.userId}/avatar-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("avatars").upload(path, file, {
        contentType: file.type,
        upsert: true,
      });
      if (up.error) throw up.error;

      // Remove old file (best-effort)
      if (avatarPath && avatarPath !== path) {
        await supabase.storage.from("avatars").remove([avatarPath]);
      }

      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", auth.userId!);
      if (updErr) throw updErr;

      setAvatarPath(path);
      const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      setAvatarUrl(data?.signedUrl ?? null);
      toast.success("Avatar atualizado.");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao enviar avatar.");
    } finally {
      setUploading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next.length < 8) {
      toast.error("A senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error("As senhas não conferem.");
      return;
    }
    setPwdBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pwd.next });
    setPwdBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada.");
      setPwd({ next: "", confirm: "" });
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl tracking-tight">Perfil</h1>
      <p className="text-muted-foreground mt-2">Gerencie seus dados e acesso.</p>

      {/* Dados */}
      <section className="mt-8 bg-card border border-border/60 rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Seus dados</h2>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-brand-soft flex items-center justify-center overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-brand" />
            )}
          </div>
          <label
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/60 text-sm cursor-pointer hover:bg-muted ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Enviando..." : "Trocar avatar"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
              }}
            />
          </label>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Nome</span>
            <input
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</span>
            <input
              value={email}
              disabled
              className="mt-1 w-full bg-muted/50 border border-border/60 rounded-lg px-3 py-2 text-sm text-muted-foreground"
            />
          </label>
        </div>
        <button
          onClick={saveName}
          disabled={saving}
          className="mt-4 px-4 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </section>

      {/* Senha */}
      <section className="mt-6 bg-card border border-border/60 rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Trocar senha</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Nova senha
            </span>
            <input
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Confirmar nova senha
            </span>
            <input
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="mt-1 w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
          </label>
          <button
            type="submit"
            disabled={pwdBusy}
            className="px-4 py-2 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {pwdBusy ? "Atualizando..." : "Atualizar senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
