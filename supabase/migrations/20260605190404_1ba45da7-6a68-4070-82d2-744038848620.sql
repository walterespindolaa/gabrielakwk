
-- Permitir convite sem cliente prévio: leads preenchem antes de ter conta
ALTER TABLE public.form_invites
  ALTER COLUMN cliente_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS lead_name text,
  ADD COLUMN IF NOT EXISTS lead_email text,
  ADD COLUMN IF NOT EXISTS lead_whatsapp text,
  ADD COLUMN IF NOT EXISTS answers jsonb,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_cliente_id uuid;
