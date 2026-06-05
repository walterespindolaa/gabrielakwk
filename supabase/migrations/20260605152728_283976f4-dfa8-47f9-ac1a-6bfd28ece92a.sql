
-- 1) ENUM
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin','consultora','cliente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Estender profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'cliente';
UPDATE public.profiles SET full_name = display_name WHERE full_name IS NULL;

-- 3) Helper is_staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','consultora')
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon, service_role;

-- 4) Trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) Tabelas (todas primeiro, depois GRANTs/RLS, depois policies)
CREATE TABLE IF NOT EXISTS public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  stage text CHECK (stage IN ('C','R_reconhecer','I','A','R_reorganizar','geral')),
  type text NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf','form','video','link')),
  file_path text,
  external_url text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.material_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unlocked boolean NOT NULL DEFAULT true,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (material_id, cliente_id)
);

CREATE TABLE IF NOT EXISTS public.forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  stage text,
  schema jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stage text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluido')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, stage)
);

-- 6) GRANTs
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_progress TO authenticated;
GRANT ALL ON public.materials, public.material_assignments, public.forms, public.form_responses, public.journey_progress TO service_role;

-- 7) Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;

-- 8) Policies — profiles (staff)
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_staff());
DROP POLICY IF EXISTS "Staff can update all profiles" ON public.profiles;
CREATE POLICY "Staff can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Staff can insert profiles" ON public.profiles;
CREATE POLICY "Staff can insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.is_staff());

-- materials
CREATE POLICY "Staff manage materials" ON public.materials
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Clients view assigned materials" ON public.materials
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.material_assignments ma
            WHERE ma.material_id = materials.id AND ma.cliente_id = auth.uid() AND ma.unlocked = true)
  );

-- material_assignments
CREATE POLICY "Staff manage assignments" ON public.material_assignments
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Clients view own assignments" ON public.material_assignments
  FOR SELECT TO authenticated USING (cliente_id = auth.uid());

-- forms
CREATE POLICY "Staff manage forms" ON public.forms
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "Clients view assigned forms" ON public.forms
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.materials m
            JOIN public.material_assignments ma ON ma.material_id = m.id
            WHERE m.type = 'form' AND m.external_url = forms.id::text
              AND ma.cliente_id = auth.uid() AND ma.unlocked = true)
  );

-- form_responses
CREATE POLICY "Clients manage own responses" ON public.form_responses
  FOR ALL TO authenticated USING (cliente_id = auth.uid()) WITH CHECK (cliente_id = auth.uid());
CREATE POLICY "Staff view all responses" ON public.form_responses
  FOR SELECT TO authenticated USING (public.is_staff());

-- journey_progress
CREATE POLICY "Clients manage own progress" ON public.journey_progress
  FOR ALL TO authenticated USING (cliente_id = auth.uid()) WITH CHECK (cliente_id = auth.uid());
CREATE POLICY "Staff manage all progress" ON public.journey_progress
  FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- 9) Storage policies para bucket 'materiais'
DROP POLICY IF EXISTS "Staff manage materiais bucket" ON storage.objects;
CREATE POLICY "Staff manage materiais bucket" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'materiais' AND public.is_staff())
  WITH CHECK (bucket_id = 'materiais' AND public.is_staff());

DROP POLICY IF EXISTS "Clients read assigned files" ON storage.objects;
CREATE POLICY "Clients read assigned files" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'materiais' AND EXISTS (
      SELECT 1 FROM public.materials m
      JOIN public.material_assignments ma ON ma.material_id = m.id
      WHERE m.file_path = storage.objects.name
        AND ma.cliente_id = auth.uid() AND ma.unlocked = true
    )
  );
