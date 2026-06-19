-- ============================================================
-- KWK · SQL 03 — Cliente vê as próprias Demandas
-- Rodar no editor SQL do Lovable / Supabase. Idempotente.
-- ============================================================

-- Permite que a cliente leia (somente leitura) as demandas dela.
-- A gestão (criar/editar/excluir) continua só com a equipe (policy "Staff manage demandas").
DROP POLICY IF EXISTS "Client reads own demandas" ON public.client_demandas;
CREATE POLICY "Client reads own demandas" ON public.client_demandas
  FOR SELECT TO authenticated USING (auth.uid() = cliente_id);
