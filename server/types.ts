// Server-side types for Carcará Threat Poker v2

export interface ThreatOption {
  id: string; // e.g., 'A', 'B', 'C'
  description: string;
}

export interface PlayerResponse {
  playerId: number;
  selectedOption: ThreatOption;
  justification: string;
}

// OWASP Top 10 classification with confidence
export interface OwaspTop10Classification {
  categoria: string;
  confianca: number; // 0-1
}

// CWE classification with confidence
export interface CWEClassification {
  id: string;
  nome: string;
  confianca: number; // 0-1
}

// CVSS information (informative only) - using CVSS 4.0
export interface CVSSInfo {
  versao: '4.0';
  vetor: string; // CVSS:4.0/...
  pontuacao_base: number;
  severidade: 'Low' | 'Medium' | 'High' | 'Critical';
  confianca: number; // 0-1
}

// OWASP Cheat Sheet reference
export interface CheatSheetReference {
  titulo: string;
  url: string;
}

// ASP inputs for prioritization calculation
export interface ASPInputs {
  risco: {
    escala: '1-10';
    valor: number; // 1-10
  };
  esforco: {
    escala: '1-10';
    valor: number; // 1-10
  };
}

// Security Card v2 - complete structure
export interface SecurityCard {
  card_id: string;
  user_story: string;
  ameaca_titulo: string;
  descricao_ameaca: string;
  classificacoes: {
    owasp_top10: OwaspTop10Classification;
    cwe: CWEClassification;
    cvss: CVSSInfo;
  };
  cheat_sheets: CheatSheetReference[];
  insumos_asp: ASPInputs;
  asp_score?: number; // Calculated ASP score for prioritization
  decisao_sprint_sugerida: 'Selecionar' | 'Adiar' | 'Avaliar';
  subtarefas_sugeridas: string[];
  dod_segurança: string[];
  observacoes: string;
  versao_esquema: string;
}

// Legacy types for backward compatibility
export interface AnalyzedThreat {
  id: string;
  description: string;
  risk: 'baixo' | 'médio' | 'alto' | 'crítico';
  mitigationEffort: 'baixo' | 'médio' | 'alto' | 'muito alto';
  analysis: string;
  sammPractice: string;
  // New v2 fields
  securityCard?: SecurityCard;
}

// New types for v2 multi-story workflow
export interface UserStoryInput {
  id: string;
  content: string;
  selected: boolean;
}

export interface SecurityAnalysisRequest {
  userStories: UserStoryInput[];
  contextoOpcional?: string;
}

export interface SecurityAnalysisResponse {
  cards: SecurityCard[];
  aspRanking: SecurityCard[]; // Cards sorted by ASP score
}

// v2 Voting types
export interface V2VotingData {
  storyId: string;
  selectedOptionId: string;
  quickJustification: string;
}

export interface V2AnalysisRequest {
  userStories: UserStoryInput[];
  contextoOpcional?: string;
  votingData?: V2VotingData[];
  includeVoting: boolean;
}
