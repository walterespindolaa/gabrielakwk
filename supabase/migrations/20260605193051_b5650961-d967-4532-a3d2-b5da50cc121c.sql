
-- 1. Add organizational fields to forms
ALTER TABLE public.forms
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'formulario',
  ADD COLUMN IF NOT EXISTS encontro int,
  ADD COLUMN IF NOT EXISTS order_index int NOT NULL DEFAULT 0;

-- 2. Exercise submissions (lições de casa entregues pela cliente)
CREATE TABLE IF NOT EXISTS public.exercise_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  cliente_id uuid NOT NULL,
  answers jsonb,
  attachments jsonb,
  notes text,
  status text NOT NULL DEFAULT 'pendente', -- pendente | entregue | revisado
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_submissions TO authenticated;
GRANT ALL ON public.exercise_submissions TO service_role;
ALTER TABLE public.exercise_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients manage own submissions" ON public.exercise_submissions
  FOR ALL TO authenticated
  USING (cliente_id = auth.uid()) WITH CHECK (cliente_id = auth.uid());

CREATE POLICY "Staff manage all submissions" ON public.exercise_submissions
  FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

-- 3. Encontros (sessions log)
CREATE TABLE IF NOT EXISTS public.encontros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  numero int NOT NULL, -- 1..4
  scheduled_at timestamptz,
  completed_at timestamptz,
  meet_url text,
  notes text,
  next_steps text,
  status text NOT NULL DEFAULT 'agendar', -- agendar | agendado | realizado
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cliente_id, numero)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.encontros TO authenticated;
GRANT ALL ON public.encontros TO service_role;
ALTER TABLE public.encontros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own encontros" ON public.encontros
  FOR SELECT TO authenticated USING (cliente_id = auth.uid());

CREATE POLICY "Staff manage encontros" ON public.encontros
  FOR ALL TO authenticated
  USING (is_staff()) WITH CHECK (is_staff());

-- 4. Update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_exsub_updated ON public.exercise_submissions;
CREATE TRIGGER trg_exsub_updated BEFORE UPDATE ON public.exercise_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_encontros_updated ON public.encontros;
CREATE TRIGGER trg_encontros_updated BEFORE UPDATE ON public.encontros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Seed forms (idempotent: delete existing method forms first by title prefix)
DELETE FROM public.forms WHERE title LIKE 'Método CRIAR%';

-- PRE-CONSULTORIA
INSERT INTO public.forms (title, description, stage, kind, encontro, order_index, schema) VALUES
('Método CRIAR · Pré-consultoria',
 'Formulário de Expectativas — preenchido antes do Encontro 1.',
 'pre', 'formulario', 0, 0,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Dados básicos','questions', jsonb_build_array(
     jsonb_build_object('id','nome','label','Qual é o seu nome e como prefere ser chamada?','type','text','required',true),
     jsonb_build_object('id','segmento','label','Qual é o seu segmento ou área de atuação?','type','text','required',true),
     jsonb_build_object('id','servicos','label','Quais serviços ou produtos você oferece hoje?','type','textarea','required',true),
     jsonb_build_object('id','tempo','label','Há quanto tempo você atua nessa área?','type','text','required',true),
     jsonb_build_object('id','canais','label','Quais canais usa para se comunicar hoje? (Instagram, WhatsApp, site...)','type','textarea','required',true),
     jsonb_build_object('id','conteudo','label','Você já produz conteúdo? Se sim, com qual frequência?','type','textarea','required',true)
   )),
   jsonb_build_object('title','Panorama inicial','questions', jsonb_build_array(
     jsonb_build_object('id','frase','label','Em uma frase, como você descreveria o que faz e para quem?','type','textarea','required',true),
     jsonb_build_object('id','valores','label','Quais são os 3 valores mais importantes para você como profissional?','type','textarea','required',true),
     jsonb_build_object('id','impacto','label','Qual é o maior impacto que você quer gerar na vida de quem te contrata?','type','textarea','required',true)
   )),
   jsonb_build_object('title','Expectativas','questions', jsonb_build_array(
     jsonb_build_object('id','porque','label','Por que você decidiu contratar essa consultoria agora?','type','textarea','required',true),
     jsonb_build_object('id','dificuldade','label','Qual é a sua maior dificuldade hoje com sua marca ou conteúdo?','type','textarea','required',true),
     jsonb_build_object('id','resolvido','label','O que você espera ter resolvido ou transformado ao final?','type','textarea','required',true),
     jsonb_build_object('id','duvida','label','Existe alguma dúvida que você carrega há muito tempo e quer destravar?','type','textarea','required',false),
     jsonb_build_object('id','perfeita','label','Se essa consultoria fosse perfeita, o que teria mudado na sua marca ao final?','type','textarea','required',true)
   ))
 ))
),

-- E1 - COMPREENDER
('Método CRIAR · E1 — Compreender',
 'Quem é sua marca? Trajetória, essência, diferencial e bagagem.',
 'compreender', 'formulario', 1, 1,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Trajetória e essência','questions', jsonb_build_array(
     jsonb_build_object('id','trajetoria','label','O que te levou a chegar onde está hoje? Conte sua trajetória.','type','textarea','required',true),
     jsonb_build_object('id','escolha','label','Por que você escolheu essa área — e o que te faz permanecer nela?','type','textarea','required',true),
     jsonb_build_object('id','inegociaveis','label','Quais valores são inegociáveis, mesmo que o mercado peça o contrário?','type','textarea','required',true),
     jsonb_build_object('id','motiva','label','O que te motiva a criar conteúdo? Qual é o seu propósito com ele?','type','textarea','required',true),
     jsonb_build_object('id','temas','label','Que temas você fala com fluidez e brilho no olho?','type','textarea','required',true),
     jsonb_build_object('id','frustra','label','O que te frustra ou incomoda no seu mercado hoje?','type','textarea','required',true)
   )),
   jsonb_build_object('title','Diferencial e bagagem','questions', jsonb_build_array(
     jsonb_build_object('id','domina','label','O que você domina com uma profundidade que a maioria no seu segmento não tem?','type','textarea','required',true),
     jsonb_build_object('id','experiencias','label','Que experiências da sua trajetória ninguém mais no seu mercado viveu da mesma forma?','type','textarea','required',true),
     jsonb_build_object('id','clientes_dizem','label','O que clientes costumam dizer que você faz diferente — mesmo que você ache óbvio?','type','textarea','required',true),
     jsonb_build_object('id','comparada','label','Se alguém te comparasse com outro profissional do mesmo segmento, o que seria inegociável a seu favor?','type','textarea','required',true),
     jsonb_build_object('id','bagagem','label','Qual é a sua bagagem — técnica, humana ou de vida — que mais influencia como você trabalha?','type','textarea','required',true),
     jsonb_build_object('id','entrega_alem','label','O que você entrega que vai além do que o cliente contratou?','type','textarea','required',true)
   ))
 ))
),

-- LIÇÃO E1 → E2
('Método CRIAR · Lição de casa E1 → E2',
 'Pesquisa de percepção: envie a 8–12 pessoas (clientes, parceiros, amigos próximos do trabalho) e cole as respostas.',
 'compreender', 'licao_casa', 1, 2,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Pesquisa de percepção','questions', jsonb_build_array(
     jsonb_build_object('id','enviados','label','Para quantas pessoas você enviou e quem são (perfis/relação)?','type','textarea','required',true),
     jsonb_build_object('id','respostas','label','Cole aqui as respostas recebidas (anônimas ou nominais, como preferir).','type','textarea','required',true),
     jsonb_build_object('id','surpresa','label','O que mais te surpreendeu nas respostas?','type','textarea','required',false),
     jsonb_build_object('id','padroes','label','Identificou padrões? Quais palavras/temas se repetiram?','type','textarea','required',false)
   ))
 ))
),

-- E2 - RECONHECER
('Método CRIAR · E2 — Reconhecer',
 'Para quem sua marca existe? Persona, público e posicionamento.',
 'reconhecer', 'formulario', 2, 3,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Persona e público','questions', jsonb_build_array(
     jsonb_build_object('id','atrair','label','Quem você quer atrair e impactar com sua marca?','type','textarea','required',true),
     jsonb_build_object('id','sente','label','O que essa pessoa sente no dia a dia? Quais frases ela repete em silêncio?','type','textarea','required',true),
     jsonb_build_object('id','desafio','label','Qual o maior desafio ou dor dela hoje?','type','textarea','required',true),
     jsonb_build_object('id','busca','label','O que ela busca ao te contratar — na superfície e no fundo?','type','textarea','required',true),
     jsonb_build_object('id','nao_quer','label','O que ela definitivamente não quer sentir ou receber?','type','textarea','required',true),
     jsonb_build_object('id','consome','label','Quais redes, formatos e linguagens ela mais consome?','type','textarea','required',true)
   )),
   jsonb_build_object('title','Posicionamento','questions', jsonb_build_array(
     jsonb_build_object('id','transformacao','label','Qual é a transformação real que você entrega? (antes x depois)','type','textarea','required',true),
     jsonb_build_object('id','unico','label','O que você faz que nenhum outro profissional do seu segmento faz da mesma forma?','type','textarea','required',true),
     jsonb_build_object('id','nicho','label','Existe um nicho ou estilo de cliente com quem você se conecta mais naturalmente?','type','textarea','required',true)
   ))
 ))
),

-- LIÇÃO E2 → E3
('Método CRIAR · Lição de casa E2 → E3',
 'Duas atividades: (1) Checklist do perfil digital atual e (2) Refinamento da persona.',
 'reconhecer', 'licao_casa', 2, 4,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Atividade 1 — Checklist do perfil','questions', jsonb_build_array(
     jsonb_build_object('id','bio','label','Sua bio reflete quem você é hoje? O que mudaria?','type','textarea','required',true),
     jsonb_build_object('id','destaques','label','Seus destaques contam sua história? O que falta ou sobra?','type','textarea','required',true),
     jsonb_build_object('id','fixados','label','Seus posts fixados representam a marca atual?','type','textarea','required',true),
     jsonb_build_object('id','feed','label','Seu feed comunica o que você quer comunicar? Por quê?','type','textarea','required',true),
     jsonb_build_object('id','sente_ver','label','O que você sente ao ver seu próprio perfil de fora?','type','textarea','required',true)
   )),
   jsonb_build_object('title','Atividade 2 — Persona refinada','questions', jsonb_build_array(
     jsonb_build_object('id','persona_nome','label','Dê um nome e uma idade à sua persona principal.','type','text','required',true),
     jsonb_build_object('id','persona_rotina','label','Descreva um dia típico dela.','type','textarea','required',true),
     jsonb_build_object('id','persona_gatilho','label','Qual é o gatilho/momento exato em que ela decide te procurar?','type','textarea','required',true)
   ))
 ))
),

-- E3 - IDENTIFICAR
('Método CRIAR · E3 — Identificar',
 'Como sua marca deve falar? Tom de voz, comunicação e estrutura digital.',
 'identificar', 'formulario', 3, 5,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Tom de voz e comunicação','questions', jsonb_build_array(
     jsonb_build_object('id','percebida','label','Como você deseja ser percebida: inspiradora, técnica, acolhedora, direta?','type','textarea','required',true),
     jsonb_build_object('id','estilo','label','Você prefere um estilo mais pessoal (bastidores, histórias) ou mais técnico?','type','textarea','required',true),
     jsonb_build_object('id','expressoes','label','Quais expressões e frases fazem parte do seu vocabulário natural?','type','textarea','required',true),
     jsonb_build_object('id','nunca','label','O que você nunca gostaria de fazer na sua comunicação?','type','textarea','required',true),
     jsonb_build_object('id','sentimento','label','Qual sentimento você quer provocar em quem consome seu conteúdo?','type','textarea','required',true),
     jsonb_build_object('id','aparecer','label','Como você se sente ao aparecer — vídeos, stories, bastidores?','type','textarea','required',true)
   )),
   jsonb_build_object('title','Estrutura digital','questions', jsonb_build_array(
     jsonb_build_object('id','checklist_revelou','label','O que o checklist revelou? O que você mesma identificou que não está funcionando?','type','textarea','required',true),
     jsonb_build_object('id','bio_destaques','label','Bio, destaques e fixados — o que precisa mudar para refletir quem você realmente é?','type','textarea','required',true)
   ))
 ))
),

-- LIÇÃO E3 → E4
('Método CRIAR · Lição de casa E3 → E4',
 'Banco de autoridade + material de conteúdo: temas que domina, histórias, fotos e formatos preferidos.',
 'identificar', 'licao_casa', 3, 6,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Banco de autoridade','questions', jsonb_build_array(
     jsonb_build_object('id','temas_dominio','label','Liste 10 temas que você domina e poderia falar por horas.','type','textarea','required',true),
     jsonb_build_object('id','historias','label','Liste 5 histórias da sua trajetória que ilustram o que você defende.','type','textarea','required',true),
     jsonb_build_object('id','perguntas','label','Liste as 10 perguntas que mais te fazem sobre seu trabalho.','type','textarea','required',true)
   )),
   jsonb_build_object('title','Material de conteúdo','questions', jsonb_build_array(
     jsonb_build_object('id','fotos','label','Links/descrição das fotos que você tem disponíveis (banco).','type','textarea','required',true),
     jsonb_build_object('id','formatos','label','Quais formatos você se sente confortável produzindo (reels, carrossel, foto+texto, vídeo falado)?','type','textarea','required',true),
     jsonb_build_object('id','tempo_disponivel','label','Quanto tempo por semana você consegue dedicar à produção?','type','text','required',true)
   ))
 ))
),

-- E4 - ATIVAR (no questionnaire; placeholder for entrega final)
('Método CRIAR · E4 — Ativar (Entrega final)',
 'Encontro de entrega: funil de conteúdo, linha editorial, plano semana a semana e relatório completo.',
 'ativar', 'formulario', 4, 7,
 jsonb_build_object('sections', jsonb_build_array(
   jsonb_build_object('title','Validação final','questions', jsonb_build_array(
     jsonb_build_object('id','recebido','label','O relatório foi entregue e revisado com você?','type','textarea','required',false),
     jsonb_build_object('id','duvidas','label','Ainda restou alguma dúvida sobre o plano?','type','textarea','required',false),
     jsonb_build_object('id','primeiros_passos','label','Quais serão seus 3 primeiros passos nesta semana?','type','textarea','required',false)
   ))
 ))
);
