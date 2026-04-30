import type { TechQualification } from './survey';

/** A single answer option in a verification question. */
export type VerificationOption = {
  /** Unique identifier within the parent question. */
  id: string;
  /** Ukrainian text shown to the respondent. */
  textUa: string;
  /** Whether this option is the correct answer. */
  isCorrect: boolean;
};

/**
 * A knowledge-marker question used to verify a declared technical qualification.
 * Not shown to the respondent as correct/incorrect — stored for later scoring.
 */
export type VerificationQuestion = {
  /** Unique question identifier (e.g. 'ver_dem_01'). */
  id: string;
  /** The qualification domain this question tests. */
  qualification: TechQualification;
  /** Question prompt in Ukrainian. */
  promptUa: string;
  /** Exactly 4 answer options (exactly 1 with isCorrect = true). */
  options: VerificationOption[];
  /** ID of the option with isCorrect = true (denormalised for quick lookup). */
  correctOptionId: string;
  /** Source/rationale note for expert review — not shown to respondent. */
  sourceNote: string;
};

/**
 * Recorded result for a single verification question answer.
 * isCorrect is computed at answer time and stored for scoring.
 */
export type VerificationResult = {
  /** ID of the VerificationQuestion that was answered. */
  questionId: string;
  /** ID of the option the respondent selected. */
  selectedOptionId: string;
  /** Whether the selected option was correct. */
  isCorrect: boolean;
  /** Time in ms between the question being shown and the answer being submitted. */
  responseTimeMs: number;
};
