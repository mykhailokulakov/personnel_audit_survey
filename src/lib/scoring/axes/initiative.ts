import type { QuestionId, AnswerRecord } from '../../types/survey';
import { getLikertValue, getSjtScore } from './_helpers';

/** Psychometric questions for the initiative axis. */
const PSYCH_INITIATIVE: ReadonlyArray<{ id: string; reversed: boolean; weight: number }> = [
  { id: 'psych_i01', reversed: false, weight: 1.0 },
  { id: 'psych_i02', reversed: false, weight: 1.0 },
  { id: 'psych_i03', reversed: false, weight: 1.0 },
  { id: 'psych_i04', reversed: false, weight: 1.0 },
  { id: 'psych_i05', reversed: true, weight: 1.0 },
  { id: 'psych_i06', reversed: false, weight: 1.0 },
];

/** SJT scenarios contributing to initiative (scenarios 2 and 5). */
const SJT_INITIATIVE: ReadonlyArray<{ id: string; weight: number }> = [
  { id: 'sjt_02', weight: 2.0 },
  { id: 'sjt_05', weight: 2.0 },
];

const MAX_PSYCH = 6 * 5 * 1.0; // 30
const MAX_SJT = 2 * 3 * 2.0; // 12
const MAX_INITIATIVE = MAX_PSYCH + MAX_SJT; // 42

/**
 * Scores the initiative axis (readiness to address problems proactively)
 * combining psychometric (Block 4) and scenario (Block 5, scenarios 2 & 5)
 * answers.
 *
 * Reverse-scored psychometric items are inverted: effectiveValue = 6 − value.
 * Result is normalised to [0, 100].
 */
export function scoreInitiative(answers: Map<QuestionId, AnswerRecord>): number {
  let rawSum = 0;

  for (const { id, reversed, weight } of PSYCH_INITIATIVE) {
    const value = getLikertValue(answers, id);
    if (value === null) continue;
    rawSum += (reversed ? 6 - value : value) * weight;
  }

  for (const { id, weight } of SJT_INITIATIVE) {
    rawSum += getSjtScore(answers, id) * weight;
  }

  return Math.round((rawSum / MAX_INITIATIVE) * 100);
}
