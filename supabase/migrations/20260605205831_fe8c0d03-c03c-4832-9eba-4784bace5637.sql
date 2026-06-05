UPDATE public.forms
SET
  title = 'Formulário de Pré-Consultoria, Método CRIAR',
  description = 'Antes do nosso primeiro encontro, preciso te conhecer melhor. Reserve uns minutinhos e responda com calma. Suas respostas são a base de tudo que vamos construir juntas.',
  schema = $json${
    "intro": {
      "como_funciona": [
        {"titulo":"Pré-consultoria","texto":"Você preenche este formulário. Chega ao primeiro encontro já com o contexto preparado, sem perder tempo com o básico."},
        {"titulo":"4 encontros online","texto":"Cada um com foco em uma etapa do Método CRIAR: Compreender, Reconhecer, Identificar e Ativar. Um por semana, pelo Google Meet."},
        {"titulo":"Entrega final","texto":"Relatório mestre completo com posicionamento, persona, plano de 60 dias + 6 materiais de apoio para continuar criando com autonomia."},
        {"titulo":"Suporte pós-consultoria","texto":"30 dias de suporte via WhatsApp para dúvidas sobre posicionamento, comunicação e aplicação do método."}
      ],
      "condicoes": [
        {"titulo":"Pagamento","texto":"O primeiro pagamento deve ser feito com pelo menos 5 dias de antecedência do Encontro 1 para garantir sua vaga."},
        {"titulo":"Vagas","texto":"São abertas vagas limitadas por mês. A confirmação acontece após o pagamento."},
        {"titulo":"Próximo passo","texto":"Após enviar este formulário, entrarei em contato pelo WhatsApp para alinhar os próximos passos e datas."}
      ]
    },
    "fields": [
      {"id":"pagamento","type":"choice","label":"Forma de pagamento","required":true,"options":["Pagar à vista no Pix, R$ 700,00","Parcelar em até 5x sem juros, R$ 750,00"]},
      {"id":"parcelas","type":"choice","label":"Se parcelado, em quantas vezes?","required":false,"options":["2x","3x","4x","5x"]},
      {"id":"ciencia","type":"choice","label":"Confirmação","required":true,"options":["Li e estou ciente de todas as informações e condições acima."]},

      {"id":"sec1","type":"section","label":"Etapa 1 de 3: Dados básicos","helper":"Informações sobre você, seu negócio e como chegou até aqui."},
      {"id":"nome","type":"short","label":"Como você prefere ser chamada?","required":true},
      {"id":"email","type":"short","label":"E-mail para agendamentos via Meet e compartilhar arquivos pelo Google Drive","required":true},
      {"id":"telefone","type":"short","label":"Telefone para contato","required":true},
      {"id":"nicho","type":"short","label":"Qual é o seu nicho de atuação?","helper":"Ex: social media, designer, empreendedora, nutrição, arquitetura de interiores, coaching...","required":true},
      {"id":"servicos","type":"long","label":"Quais serviços ou produtos você oferece hoje?","required":true},
      {"id":"tempo","type":"choice","label":"Há quanto tempo você atua nessa área?","options":["Menos de 1 ano","Entre 1 e 3 anos","Entre 3 e 5 anos","Mais de 5 anos"]},
      {"id":"canais","type":"multichoice","label":"Quais canais você usa para se comunicar hoje?","options":["Instagram","WhatsApp","Site / Blog","TikTok","LinkedIn","Não uso nenhum ainda"]},
      {"id":"conteudo","type":"choice","label":"Você já produz conteúdo? Com qual frequência?","options":["Não produzo nada ainda","Raramente, quando me animo","Algumas vezes por semana","Todos os dias ou quase"]},
      {"id":"origem","type":"long","label":"Por onde você me conheceu?","helper":"Reels, patrocinado, explorar, indicação de alguém (quem?)...","required":true},

      {"id":"sec2","type":"section","label":"Etapa 2 de 3: Sua essência","helper":"O que te torna única: sua história, seus valores e seu diferencial real."},
      {"id":"frase","type":"long","label":"Em uma frase: o que você faz e para quem?","helper":"Tente ser específica, mesmo que ainda não esteja tão claro.","required":true},
      {"id":"valores","type":"long","label":"Quais são os 3 valores mais importantes para você como profissional?","helper":"Ex: autenticidade, cuidado, liberdade...","required":true},
      {"id":"impacto","type":"long","label":"Qual é o maior impacto que você quer gerar na vida de quem te contrata?"},
      {"id":"profundidade","type":"long","label":"O que você domina com uma profundidade que a maioria no seu segmento não tem?","helper":"Pode ser técnico, humano ou de experiência de vida..."},
      {"id":"elogios","type":"long","label":"O que clientes costumam dizer que você faz diferente?","helper":"Elogios que se repetem, feedbacks que você recebe com frequência..."},

      {"id":"sec3","type":"section","label":"Etapa 3 de 3: Expectativas","helper":"Me conta por que você chegou até aqui e o que espera levar da consultoria."},
      {"id":"porque_agora","type":"long","label":"Por que você decidiu contratar essa consultoria agora?","required":true},
      {"id":"maior_dificuldade","type":"multichoice","label":"Qual é a sua maior dificuldade com sua marca ou conteúdo hoje?","helper":"Pode selecionar mais de uma opção.","required":true,"options":["Não sei por onde começar","Falta de consistência e fio condutor","Posto mas não vejo resultado","Dificuldade em mostrar quem eu sou","Dependo de terceiros para criar","Já contratei social media e me frustrei"]},
      {"id":"esperado","type":"long","label":"O que você espera ter resolvido ao final da consultoria?"},
      {"id":"duvida","type":"long","label":"Existe alguma dúvida que você carrega há muito tempo e quer destravar?"},
      {"id":"sonho","type":"long","label":"Se essa consultoria fosse perfeita, o que teria mudado na sua marca ao final?","helper":"Sonhe um pouco aqui, me conta o cenário ideal."},
      {"id":"whatsapp","type":"short","label":"Seu WhatsApp para contato","required":true},
      {"id":"email_final","type":"short","label":"Seu e-mail"}
    ]
  }$json$::jsonb
WHERE id = '11111111-1111-1111-1111-111111111111';