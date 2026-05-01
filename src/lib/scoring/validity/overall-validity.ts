import type { ValidityLevel } from '../types';

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
  if (lie.score >= 60 || consistency.score >= 60 || attention.score < 50 || speedFlag) {
    return 'unreliable';
  }

  if (lie.score <= 30 && consistency.score <= 30 && attention.score >= 75 && !speedFlag) {
    return 'reliable';
  }

  return 'questionable';
}
