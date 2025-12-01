// src/components/Step3PersonaEvaluation/types.ts

export type Persona = {
  id: string;
  name: string;
  description: string;
  weights: { emotion: number; offer: number; cta: number; local: number; trend: number };
};

export interface Feedback {
  score: number;
  comment: string;
}

export interface BreakdownItem {
  score: number;
  reason: string;
}

export interface PersonaEvaluationResult {
  personaId: string;
  personaName: string;
  overall_score: number;
  feedback: string;
  captionFeedback: Feedback;
  oneLinerFeedback: Feedback;
  hashtagsFeedback: Feedback;
  breakdown: Record<string, BreakdownItem>;
}

export interface PersonaEvaluationResponse {
  results: PersonaEvaluationResult[];
  summary: {
    bestPersonaId: string | null;
    averageScore: number;
    notes: string[];
  };
}

export interface Props {
  selectedPersonas: string[];
  setSelectedPersonas: (ids: string[]) => void;
  caption: string;
  oneLiner: string;
  hashtags: string[];
  onEvaluate: () => void;
}
