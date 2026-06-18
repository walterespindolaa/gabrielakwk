// Tipos do workspace do cliente: Diagnóstico (Panorama + SWOT) e Demandas.
// Tabelas: client_diagnostico, client_demandas (ver docs/sql/02).

export interface SwotData {
  forcas: string[];
  fraquezas: string[];
  oportunidades: string[];
  ameacas: string[];
}

export const EMPTY_SWOT: SwotData = {
  forcas: [],
  fraquezas: [],
  oportunidades: [],
  ameacas: [],
};

/** Normaliza um swot vindo do banco (pode ser parcial/null). */
export function normalizeSwot(raw: unknown): SwotData {
  const s = (raw ?? {}) as Partial<SwotData>;
  return {
    forcas: Array.isArray(s.forcas) ? s.forcas : [],
    fraquezas: Array.isArray(s.fraquezas) ? s.fraquezas : [],
    oportunidades: Array.isArray(s.oportunidades) ? s.oportunidades : [],
    ameacas: Array.isArray(s.ameacas) ? s.ameacas : [],
  };
}

export interface Diagnostico {
  cliente_id: string;
  panorama: string | null;
  swot: SwotData;
  updated_at?: string;
}

export const SWOT_QUADRANTS = [
  { key: "forcas", letter: "S", title: "Forças", scope: "Interno · potencializa", tone: "fill" },
  { key: "fraquezas", letter: "W", title: "Fraquezas", scope: "Interno · limita", tone: "outline" },
  { key: "oportunidades", letter: "O", title: "Oportunidades", scope: "Externo · potencializa", tone: "outline" },
  { key: "ameacas", letter: "T", title: "Ameaças", scope: "Externo · limita", tone: "fill" },
] as const;

export type SwotKey = (typeof SWOT_QUADRANTS)[number]["key"];

export type DemandaStatus = "aberta" | "em_andamento" | "concluida";

export interface Demanda {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao: string | null;
  status: DemandaStatus;
  created_at: string;
}

export const DEMANDA_STATUS: { key: DemandaStatus; label: string }[] = [
  { key: "aberta", label: "Aberta" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "concluida", label: "Concluída" },
];
