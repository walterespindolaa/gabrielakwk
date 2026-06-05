import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser, homeForRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — Consultoria CRIAR" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const auth = useCurrentUser();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (!auth.loading && auth.userId && auth.role) {
      navigate({ to: homeForRole(auth.role) as any });
    }
  }, [auth.loading, auth.userId, auth.role, navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      // Redirect handled by effect once role loads
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Enviamos um link de recuperação para o seu e-mail.");
      setMode("signin");
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível enviar o e-mail.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-gradient-to-br from-brand-soft via-background to-background">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o site
        </Link>

        <div className="bg-card rounded-3xl shadow-xl shadow-brand/10 border border-border/60 p-8">
          <div className="text-center mb-8">
            <span className="font-display text-3xl font-semibold tracking-tight text-foreground">
              KWK
            </span>
            <h1 className="mt-3 font-display text-2xl font-medium text-foreground" style={{ lineHeight: "1.2" }}>
              {mode === "signin" ? "Área de membros" : "Recuperar senha"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {mode === "signin"
                ? "Acesse seus materiais da Consultoria CRIAR"
                : "Enviaremos um link para redefinir sua senha"}
            </p>
          </div>

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <EmailField email={email} setEmail={setEmail} />
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full rounded-xl border border-input bg-background pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Mostrar senha"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand text-brand-foreground py-3.5 text-sm font-semibold hover:bg-brand/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-brand/20"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="w-full text-center text-sm text-muted-foreground hover:text-brand transition-colors pt-2"
              >
                Esqueci minha senha
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-3">
              <EmailField email={email} setEmail={setEmail} />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand text-brand-foreground py-3.5 text-sm font-semibold hover:bg-brand/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-brand/20"
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="w-full text-center text-sm text-muted-foreground hover:text-brand transition-colors pt-2"
              >
                Voltar para o login
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          O acesso é criado pela consultora. Em caso de dúvida, fale com a Gabriela.
        </p>
      </div>
    </div>
  );
}

function EmailField({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div className="relative">
      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail"
        className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/40"
        required
      />
    </div>
  );
}
