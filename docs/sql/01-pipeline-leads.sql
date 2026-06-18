-- ============================================================
-- KWK · SQL 01 — Pipeline de leads (CRM Kanban)
-- Rodar no editor SQL do Lovable / Supabase.
-- Idempotente: pode rodar mais de uma vez sem quebrar.
-- ============================================================

-- 1) Colunas de pipeline em form_invites
ALTER TABLE public.form_invites
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo','respondido','em_contato','apta','cliente','nao_apta')),
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pipeline_order integer;

-- 2) Backfill do status a partir dos timestamps já existentes
UPDATE public.form_invites SET status =
  CASE
    WHEN approved_at  IS NOT NULL THEN 'cliente'
    WHEN submitted_at IS NOT NULL THEN 'respondido'
    ELSE 'novo'
  END
WHERE status = 'novo';

-- 3) Índice para listar o board rápido
CREATE INDEX IF NOT EXISTS idx_form_invites_status ON public.form_invites(status) WHERE archived = false;

-- Pronto. O kanban no /admin/leads usa essas colunas.
