// Single source of truth for the Método CRIAR structure.
// Mirrors the document "Método CRIAR" sent by the client.

export type StageKey =
  | "compreender"
  | "reconhecer"
  | "identificar"
  | "ativar"
  | "reorganizar";

export interface Encontro {
  numero: 1 | 2 | 3 | 4 | 5;
  key: StageKey;
  letter: string; // C / R / I / A / R
  letterFull: string; // Compreender / Reconhecer / ...
  title: string;
  pergunta: string;
  cor: string; // tailwind bg accent
  licaoCasa?: string; // homework title given at this encontro for next one
}

export const ENCONTROS: Encontro[] = [
  {
    numero: 1,
    key: "compreender",
    letter: "C",
    letterFull: "Compreender",
    title: "Quem é sua marca?",
    pergunta:
      "Aprofunde trajetória, essência, valores inegociáveis e o que te diferencia no mercado.",
    cor: "from-brand to-brand/70",
    licaoCasa: "Pesquisa de percepção",
  },
  {
    numero: 2,
    key: "reconhecer",
    letter: "R",
    letterFull: "Reconhecer",
    title: "Para quem sua marca existe?",
    pergunta:
      "Defina persona, dores, desejos e o posicionamento que entrega a transformação real.",
    cor: "from-brand to-brand/70",
    licaoCasa: "Checklist do perfil + persona refinada",
  },
  {
    numero: 3,
    key: "identificar",
    letter: "I",
    letterFull: "Identificar",
    title: "Como sua marca deve falar?",
    pergunta:
      "Tom de voz, manual de comunicação e ajustes da estrutura digital (bio, destaques, fixados).",
    cor: "from-brand to-brand/70",
    licaoCasa: "Banco de autoridade + material de conteúdo",
  },
  {
    numero: 4,
    key: "ativar",
    letter: "A",
    letterFull: "Ativar",
    title: "Coloque a estratégia no ar",
    pergunta:
      "Funil de conteúdo, linha editorial e o plano de execução dos próximos 90 dias.",
    cor: "from-brand to-brand/70",
    licaoCasa: "Revisão da casa digital",
  },
  {
    numero: 5,
    key: "reorganizar",
    letter: "R",
    letterFull: "Reorganizar",
    title: "Reorganizando a casa",
    pergunta:
      "Organize a estrutura digital, a rotina e os processos para sustentar tudo com autonomia e constância.",
    cor: "from-brand to-brand/70",
  },
];

export const PRE_CONSULTORIA = {
  title: "Pré-consultoria",
  subtitle: "Formulário de expectativas",
  pergunta:
    "Preenchido antes do Encontro 1. Você chega ao primeiro encontro já sabendo segmento, serviços, valores e expectativas.",
};

export const PLATAFORMA_CRIA_URL = "https://gabrielakwk.com.br/cria"; // ajustar quando definido
