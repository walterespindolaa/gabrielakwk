-- ============================================================
-- KWK · SQL 06 — PDF do diagnóstico (substitui o gerado)
-- Quando há PDF anexado, a cliente vê o PDF no lugar do
-- panorama + SWOT. Rodar no editor SQL do Lovable/Supabase.
-- Idempotente.
-- ============================================================

ALTER TABLE public.client_diagnostico
  ADD COLUMN IF NOT EXISTS pdf_path text,
  ADD COLUMN IF NOT EXISTS pdf_name text;
