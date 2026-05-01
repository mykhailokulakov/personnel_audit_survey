import type { ProfileAxis } from './axes';

/** Aggregated result from lie-scale questions. */
export type LieScore = {
  /** Number of lie-scale questions answered with value 5 ("Повністю згоден"). */
  flaggedCount: number;
  /** Total number of lie-scale questions presented. */
  total: number;
  /** Normalised score: 0 = no flags, 1 = all flagged. */
  normalizedScore: number;
};

/** Consistency check result for a single paired-question comparison. */
export type ConsistencyScore = {
  /** Identifier linking the two questions that share the same semantic content. */
  pairId: string;
  /** Absolute difference between the two Likert values (range 0–4). */
  absoluteDelta: number;
  /** True when the delta meets or exceeds the flagging threshold (typically ≥ 2). */
  isFlagged: boolean;
};

/** Validity result from attention-check questions. */
export type AttentionScore = {
  /** Number of attention-check questions answered correctly. */
  passed: number;
  /** Total number of attention-check questions presented. */
  total: number;
};

/** Flag raised when a response time is anomalous. */
export type SpeedFlag = {
  questionId: string;
  responseTimeMs: number;
  reason: 'too-fast' | 'too-slow';
};

/** Raw score for one profile axis before normalization and aggregation. */
export type RawAxisScore = {
  axis: ProfileAxis;
  /** Weighted sum of answer values for this axis. */
  rawSum: number;
  /** Maximum achievable weighted sum for this axis. */
  maxPossible: number;
  /** Normalised score in [0, 1]. */
  normalizedScore: number;
};
