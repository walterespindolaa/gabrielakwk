-- ============================================================
-- KWK · SQL 04 — Plano editorial + banco de ideias (conteúdo)
-- Rodar no editor SQL do Lovable / Supabase. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_content (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo        text NOT NULL,
  formato       text,                 -- Reel, Carrossel, Story, Feed...
  pilar         text,                 -- pilar de conteúdo
  status        text NOT NULL DEFAULT 'ideia'
                CHECK (status IN ('ideia','em_producao','agendado','postado')),
  scheduled_for date,
  notas         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_content ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_content TO authenticated;
GRANT ALL ON public.client_content TO service_role;

DROP POLICY IF EXISTS "Staff manage content" ON public.client_content;
CREATE POLICY "Staff manage content" ON public.client_content
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Client reads own content" ON public.client_content;
CREATE POLICY "Client reads own content" ON public.client_content
  FOR SELECT TO authenticated USING (auth.uid() = cliente_id);

CREATE INDEX IF NOT EXISTS idx_client_content_cliente ON public.client_content(cliente_id);
