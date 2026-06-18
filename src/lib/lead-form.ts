// Form A — Captação de Lead (público, no site).
// Schema fica aqui (código) e é auto-provisionado no banco pela server function
// submitPublicLead, então NÃO precisa de SQL para funcionar.
//
// IDs dos campos são estáveis — a server function usa nome/instagram/whatsapp/email
// para preencher as colunas lead_* em form_invites.

import type { FormField } from "@/lib/form-types";

export const LEAD_FORM_ID = "22222222-2222-2222-2222-222222222222";
export const LEAD_FORM_TITLE = "Candidatura — Consultoria CRIAR";
export const LEAD_FORM_DESCRIPTION =
  "Quero te conhecer antes da nossa conversa. Responde com calma — uma pergunta por vez. Pode digitar ou tocar em Falar para responder por voz.";

export const LEAD_FORM_FIELDS: FormField[] = [
  { id: "sec_voce", type: "section", label: "Sobre você" },
  { id: "nome", type: "short", label: "Qual é o seu nome?", required: true },
  { id: "instagram", type: "short", label: "Qual é o seu @ no Instagram?", required: true },
  { id: "whatsapp", type: "short", label: "Qual o seu WhatsApp?", required: true },
  { id: "email", type: "short", label: "Qual o seu e-mail?", required: true },
  { id: "nicho", type: "short", label: "Qual é o seu nicho ou área de atuação?", required: true },
  {
    id: "servicos",
    type: "long",
    label: "Quais serviços, produtos ou soluções você oferece atualmente?",
    required: true,
  },

  { id: "sec_momento", type: "section", label: "Seu momento digital" },
  {
    id: "tempo",
    type: "choice",
    label: "Há quanto tempo você atua nessa área?",
    options: ["Menos de 1 ano", "Entre 1 e 3 anos", "Entre 3 e 5 anos", "Mais de 5 anos"],
    required: true,
  },
  {
    id: "conteudo",
    type: "choice",
    label: "Como está sua produção de conteúdo hoje?",
    options: [
      "Nunca postei",
      "Posto raramente, sem estratégia",
      "Posto com alguma frequência",
      "Tenho uma rotina consistente de conteúdo",
    ],
    required: true,
  },
  { id: "origem", type: "short", label: "Como me conheceu?", required: true },
  {
    id: "desafio",
    type: "long",
    label: "Qual é o principal desafio que você enfrenta hoje com sua presença digital?",
    required: true,
  },

  { id: "sec_fit", type: "section", label: "Expectativas e fit" },
  {
    id: "decisao",
    type: "long",
    label: "O que fez você decidir buscar ajuda neste momento?",
    required: true,
  },
  {
    id: "sucesso",
    type: "long",
    label: "Se esta consultoria fosse um sucesso para você, o que teria mudado ao final do processo?",
    required: true,
  },
  {
    id: "impedimento",
    type: "long",
    label: "Hoje, o que você acredita que mais está impedindo seu crescimento?",
  },
  {
    id: "ciencia",
    type: "choice",
    label:
      "Você está ciente de que os resultados dependem da sua dedicação, consistência e aplicação das estratégias — e que meu papel é dar direção, clareza e orientação?",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    id: "investimento",
    type: "choice",
    label:
      "Você se sente confortável em investir de R$ 800 a R$ 1000 hoje para desenvolver sua marca pessoal e presença digital?",
    options: ["Sim", "Não"],
    required: true,
  },
  {
    id: "observacao",
    type: "long",
    label: "Existe algo sobre sua marca, negócio ou momento atual que eu deveria saber antes da nossa conversa?",
  },
];

export const LEAD_FORM_SCHEMA = { fields: LEAD_FORM_FIELDS };
