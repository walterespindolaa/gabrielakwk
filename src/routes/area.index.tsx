import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth-guard";
import { STAGES, type StageKey } from "@/components/area/AreaLayout";

export const Route = createFileRoute("/area/")({
  component: JornadaPage,
});

type Status = "pendente" | "em_andamento" | "concluido";

function JornadaPage() {
  const auth = useCurrentUser();
  const [progress, setProgress] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.userId) return;
    (async () => {
      const { data } = await supabase
        .from("journey_progress")
        .select("stage, status")
        .eq("cliente_id", auth.userId);
      const map: Record<string, Status> = {};
      STAGES.forEach((s) => (map[s.key] = "pendente"));
      (data ?? []).forEach((row: any) => (map[row.stage] = row.status));
      setProgress(map);
      setLoading(false);
    })();
  }, [auth.userId]);

  const firstName = auth.fullName?.split(" ")[0] ?? "olá";
  const completed = STAGES.filter((s) => progress[s.key] === "concluido").length;
  const pct = Math.round((completed / STAGES.length) * 100);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-brand font-semibold mb-3">
        Sistema CRIA
      </p>
      <h1
        className="font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight"
        style={{ lineHeight: "1.15" }}
      >
        Olá, <span className="italic text-brand">{firstName}</span>.
      </h1>
      <p className="mt-4 text-muted-foreground max-w-xl">
        Acompanhe sua jornada pelo método CRIAR. Cada etapa marca um movimento da sua presença
        digital.
      </p>

      {/* Progress bar */}
      <div className="mt-10 bg-card border border-border/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Sua jornada</span>
          <span className="text-sm text-muted-foreground">
            {completed} de {STAGES.length} concluída{completed === 1 ? "" : "s"}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="mt-6 space-y-3">
        {loading
          ? STAGES.map((s) => (
              <div
                key={s.key}
                className="bg-card border border-border/60 rounded-2xl p-5 h-24 animate-pulse"
              />
            ))
          : STAGES.map((s, idx) => <StageCard key={s.key} stage={s} status={progress[s.key]} index={idx} />)}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/area/materiais"
          className="inline-block text-sm font-semibold text-brand hover:underline"
        >
          Ver materiais →
        </Link>
      </div>
    </div>
  );
}

function StageCard({
  stage,
  status,
  index,
}: {
  stage: { key: StageKey; label: string; short: string };
  status: Status;
  index: number;
}) {
  const statusConfig = {
    pendente: {
      icon: Circle,
      label: "Pendente",
      cls: "text-muted-foreground bg-muted",
    },
    em_andamento: {
      icon: Loader2,
      label: "Em andamento",
      cls: "text-brand bg-brand-soft",
    },
    concluido: {
      icon: Check,
      label: "Concluído",
      cls: "text-brand-foreground bg-brand",
    },
  } as const;
  const cfg = statusConfig[status ?? "pendente"];
  const Icon = cfg.icon;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-display text-lg font-bold ${
          status === "concluido" ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand"
        }`}
      >
        {stage.short}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">Etapa {index + 1}</div>
        <div className="font-semibold">{stage.label}</div>
      </div>
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.cls}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {cfg.label}
      </div>
    </div>
  );
}
