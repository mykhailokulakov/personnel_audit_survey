import type { ValidityLevel } from '../types';
import { VALIDITY_THRESHOLDS } from '../calibration';

/**
 * Derives the overall validity classification from individual metrics.
 *
 * Rules (evaluated in order):
 * - unreliable: lieScore ≥ 60 OR consistencyScore ≥ 60 OR attentionScore < 50 OR speedFlag
 * - reliable:   lieScore ≤ 30 AND consistencyScore ≤ 30 AND attentionScore ≥ 75 AND !speedFlag
 * - questionable: everything else
 */
export function computeOverallValidity(
  lie: { score: number },
  consistency: { score: number },
  attention: { score: number },
  speedFlag: boolean,
): ValidityLevel {
  if (
    lie.score >= VALIDITY_THRESHOLDS.lie.unreliable ||
    consistency.score >= VALIDITY_THRESHOLDS.consistency.unreliable ||
    attention.score < VALIDITY_THRESHOLDS.attention.unreliable ||
    speedFlag
  ) {
    return 'unreliable';
  }

  if (
    lie.score <= VALIDITY_THRESHOLDS.lie.reliable &&
    consistency.score <= VALIDITY_THRESHOLDS.consistency.reliable &&
    attention.score >= VALIDITY_THRESHOLDS.attention.reliable &&
    !speedFlag
  ) {
    return 'reliable';
  }

  return 'questionable';
}
