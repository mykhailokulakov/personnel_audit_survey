import type { ProfileAxis } from './axes';

/**
 * A 5-point Likert question used in Block 4 (Psychometric).
 * Includes all metadata needed for scoring and validity checks.
 */
export type PsychometricQuestion = {
  id: string;
  promptUa: string;
  axis: ProfileAxis;
  /** Scoring weight in [0, 1]. Lie-scale questions have weight 0. */
  weight: number;
  /** When true, this question is a lie-scale item: "Fully agree" signals social desirability bias. */
  isLieScale: boolean;
  /**
   * When true, the scoring direction is inverted:
   * a high Likert value indicates a low trait score.
   */
  isReverseScored: boolean;
  /** Links two questions that express the same idea in different words (for consistency checks). */
  consistencyPairId: string | null;
};

export type PsychometricQuestionBank = {
  questions: PsychometricQuestion[];
};
