export enum GameState {
  SETUP = 'SETUP',
  GENERATING_OPTIONS = 'GENERATING_OPTIONS',
  VOTING = 'VOTING',
  ANALYZING = 'ANALYZING',
  DECISION = 'DECISION', // New state for team's final decision
  RESULTS_READY = 'RESULTS_READY',
}

export interface ThreatOption {
  id: string; // e.g., 'A', 'B', 'C'
  description: string;
}

export interface PlayerResponse {
  playerId: number;
  selectedOption: ThreatOption;
  justification: string;
}

// Represents the AI's analysis of a single threat option
export interface AnalyzedThreat {
  id: string;
  description: string;
  risk: 'baixo' | 'médio' | 'alto' | 'crítico';
  mitigationEffort: 'baixo' | 'médio' | 'alto' | 'muito alto';
  analysis: string; // The AI's expert opinion on this specific option
  sammPractice: string; // e.g., 'Verification > Security Testing'
}

export interface Gamecard {
  task: string;
  chosenThreat: string;
  risk: 'baixo' | 'médio' | 'alto' | 'crítico';
  mitigationEffort: 'baixo' | 'médio' | 'alto' | 'muito alto';
  consolidatedExplanation: string;
  suggestedAction: string;
  sammPractice: string;
}