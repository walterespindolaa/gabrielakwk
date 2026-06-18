-- ============================================================
-- KWK · SQL 02 — Workspace do cliente: Diagnóstico + Demandas
-- Rodar no editor SQL do Lovable / Supabase. Idempotente.
-- ============================================================

-- ---------- 1) Diagnóstico (Panorama + SWOT) — cliente VÊ ----------
CREATE TABLE IF NOT EXISTS public.client_diagnostico (
  cliente_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  panorama   text,
  swot       jsonb NOT NULL DEFAULT '{"forcas":[],"fraquezas":[],"oportunidades":[],"ameacas":[]}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_diagnostico ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_diagnostico TO authenticated;
GRANT ALL ON public.client_diagnostico TO service_role;

DROP POLICY IF EXISTS "Staff manage diagnostico" ON public.client_diagnostico;
CREATE POLICY "Staff manage diagnostico" ON public.client_diagnostico
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Client reads own diagnostico" ON public.client_diagnostico;
CREATE POLICY "Client reads own diagnostico" ON public.client_diagnostico
  FOR SELECT TO authenticated USING (auth.uid() = cliente_id);

-- ---------- 2) Demandas Gerais — só ADMIN ----------
CREATE TABLE IF NOT EXISTS public.client_demandas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo     text NOT NULL,
  descricao  text,
  status     text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','em_andamento','concluida')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_demandas ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_demandas TO authenticated;
GRANT ALL ON public.client_demandas TO service_role;

DROP POLICY IF EXISTS "Staff manage demandas" ON public.client_demandas;
CREATE POLICY "Staff manage demandas" ON public.client_demandas
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE INDEX IF NOT EXISTS idx_client_demandas_cliente ON public.client_demandas(cliente_id);

-- Pronto. Diagnóstico aparece para a cliente em /area/diagnostico; Demandas só no admin.
