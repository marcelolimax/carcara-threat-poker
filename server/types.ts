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

// ASP inputs for prioritization calculation.
// Risco: diretamente proporcional. Esforço: inversamente proporcional (menor esforço => maior valor).
export interface ASPInputs {
  risco: {
    nivel: 'baixo' | 'médio' | 'alto' | 'crítico';
    valor: number; // 1-10 (mapeado pela tabela)
  };
  esforco: {
    nivel: 'baixo' | 'médio' | 'alto' | 'muito alto';
    valor: number; // 1-10 (mapeado, inverso ao esforço)
  };
}

// Security Card v2 - complete structure
export interface SecurityCard {
  card_id: string;
  user_story: string;
  ameaca_titulo: string;
  descricao_ameaca: string;
  classificacoes: {
    stride: string[]; // STRIDE: técnica central de modelagem de ameaças (CATM)
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
  stride: string[]; // Classificação STRIDE da ameaça (modelagem de ameaças)
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

// ───────────────────────── Salas multiplayer (v1 grupo / v2 colaborativo) ─────────────────────────

export type RoomPhase = 'lobby' | 'generating' | 'voting' | 'revealed' | 'decision' | 'generating_cards' | 'cards' | 'finished';

export interface Participant {
  id: string;            // id do socket/sessão
  name: string;          // nome da persona (ex.: "Ghost//Runner")
  icon: string;          // emoji/ícone da persona
  isHost: boolean;
  connected: boolean;
}

// Voto de um participante (sem expor antes da revelação)
export interface RoomVote {
  participantId: string;
  selectedOptionId: string;
  justification: string;
}

export interface Room {
  code: string;                          // código de convite (ex.: "CARCARA-7F3K")
  mode: 'v1' | 'v2';                     // modo do jogo
  phase: RoomPhase;
  hostId: string;
  participants: { [participantId: string]: Participant };
  userStory?: string;                    // história em análise (v1)
  options?: ThreatOption[];              // opções geradas
  votes: { [participantId: string]: RoomVote };
  analysis?: AnalyzedThreat[];           // análise da IA por opção (após revelar) — v1
  chosenOptionId?: string;               // decisão final da equipe — v1
  // ── Campos específicos do v2 colaborativo ──
  // Fluxo v2: gera os Cards de Segurança e a equipe vota em QUAIS implementar.
  stories?: { id: string; content: string }[];
  contextoOpcional?: string;
  cards?: SecurityCard[];                // cards gerados
  cardVotes?: { [participantId: string]: string[] }; // card_ids votados por participante
  chosenCardIds?: string[];              // selecionados para o backlog (após revelar)
  createdAt: number;
  updatedAt: number;
}

// Snapshot enviado aos clientes (não vaza o conteúdo dos votos antes da revelação)
export interface RoomSnapshot {
  code: string;
  mode: 'v1' | 'v2';
  phase: RoomPhase;
  hostId: string;
  youId: string;
  participants: Participant[];
  userStory?: string;
  options?: ThreatOption[];
  votedParticipantIds: string[];         // quem já votou (sem o conteúdo)
  votes?: RoomVote[];                    // v1: preenchido apenas quando revelado
  analysis?: AnalyzedThreat[];           // v1: análise da IA por opção
  chosenOptionId?: string;               // v1: decisão final
  // ── v2 colaborativo (votação nos cards) ──
  cards?: SecurityCard[];                // cards gerados (visíveis a partir da votação)
  youVotedCardIds?: string[];            // seleção do próprio participante
  cardTally?: { [cardId: string]: number }; // contagem por card (apenas após revelar)
  chosenCardIds?: string[];              // selecionados para o backlog (após revelar)
}

// Mensagens cliente -> servidor
export type ClientMessage =
  | { type: 'create_room'; mode: 'v1' | 'v2'; persona: { name: string; icon: string } }
  | { type: 'join_room'; code: string; persona: { name: string; icon: string } }
  | { type: 'update_persona'; persona: { name: string; icon: string } }
  | { type: 'leave_room' }
  | { type: 'start_round'; userStory: string }
  | { type: 'start_v2'; stories: string[]; contexto?: string }
  | { type: 'submit_vote'; selectedOptionId: string; justification: string }
  | { type: 'vote_cards'; cardIds: string[] }
  | { type: 'reveal' }
  | { type: 'decide'; optionId: string };

// Mensagens servidor -> cliente
export type ServerMessage =
  | { type: 'room_state'; room: RoomSnapshot }
  | { type: 'error'; message: string };
