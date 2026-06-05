import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Nova senha — Consultoria CRIAR" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase handles the recovery token in the URL hash automatically and
    // emits a PASSWORD_RECOVERY event. We just need to wait for a session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada. Faça login novamente.");
      await supabase.auth.signOut();
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-gradient-to-br from-brand-soft via-background to-background">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-3xl shadow-xl shadow-brand/10 border border-border/60 p-8">
          <div className="text-center mb-8">
            <span className="font-display text-3xl font-semibold tracking-tight">KWK</span>
            <h1 className="mt-3 font-display text-2xl font-medium" style={{ lineHeight: "1.2" }}>
              Defina uma nova senha
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {ready ? "Escolha uma senha forte e segura." : "Validando seu link..."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <PasswordField
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              placeholder="Nova senha"
            />
            <PasswordField
              value={confirm}
              onChange={setConfirm}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              placeholder="Confirmar nova senha"
            />
            <button
              type="submit"
              disabled={loading || !ready}
              className="w-full rounded-xl bg-brand text-brand-foreground py-3.5 text-sm font-semibold hover:bg-brand/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-brand/20"
            >
              {loading ? "Salvando..." : "Atualizar senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40"
        required
        minLength={8}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label="Mostrar senha"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
