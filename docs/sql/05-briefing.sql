-- ============================================================
-- KWK · SQL 05 — Briefing estratégico (Form B, pós-início)
-- Rodar no editor SQL do Lovable / Supabase. Idempotente.
-- O formulário aparece para a cliente em "Formulários".
-- ============================================================

INSERT INTO public.forms (id, title, description, stage, schema)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Briefing estratégico — Consultoria CRIAR',
  'Um aprofundamento sobre você e sua marca, para começarmos a consultoria com tudo na mão. Pode responder digitando ou ditando por voz.',
  'geral',
  $json${
    "fields": [
      {"id":"email_call","type":"short","label":"Qual e-mail você usa para agendamentos (Meet) e arquivos (Drive)?","required":true},
      {"id":"preferencia","type":"long","label":"Tem algum dia/horário/preferência para os nossos agendamentos?"},
      {"id":"sobre_voce","type":"long","label":"Me conta tudo que é importante eu saber sobre você, antes de te conhecer na call.","required":true},
      {"id":"canais","type":"multichoice","label":"Quais canais você usa para se comunicar hoje?","options":["Instagram","WhatsApp","Site / Blog","TikTok","LinkedIn","Não uso nenhum ainda"]},
      {"id":"frase","type":"long","label":"Em uma frase: o que você faz e para quem?","required":true},
      {"id":"valores","type":"long","label":"Quais são os 3 valores mais importantes para você como profissional?","required":true},
      {"id":"impacto","type":"long","label":"Qual é o maior impacto que você quer gerar na vida de quem te contrata?"},
      {"id":"dominio","type":"long","label":"O que você domina com uma profundidade que a maioria no seu segmento não tem?"},
      {"id":"elogios","type":"long","label":"O que clientes costumam dizer que você faz diferente?"},
      {"id":"duvida","type":"long","label":"Existe alguma dúvida que você carrega há muito tempo e quer destravar?"},
      {"id":"motivo","type":"long","label":"O que te fez fechar essa consultoria comigo?"}
    ]
  }$json$::jsonb
)
ON CONFLICT (id) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      schema = EXCLUDED.schema;
