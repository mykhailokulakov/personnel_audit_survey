import type { QuestionOption } from './question-spec';

/**
 * A single-choice question used in Block 3 (Cognitive Proxy).
 * Includes scoring metadata for the future scoring module.
 */
export type CognitiveQuestion = {
  id: string;
  promptUa: string;
  type: 'single-choice';
  options: QuestionOption[];
  axisHint: 'cognitive-proxy';
  /** Reduced weight reflecting the indirect nature of cognitive indicators. */
  weight: number;
  /** Maps each option id to its score value (0–4). */
  optionScores: Record<string, number>;
};

export type CognitiveQuestionBank = {
  questions: CognitiveQuestion[];
};
