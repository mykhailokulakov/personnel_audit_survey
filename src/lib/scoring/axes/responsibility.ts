import type { QuestionId, AnswerRecord } from '../../types/survey';
import { getLikertValue, getSjtScore } from './_helpers';

/** Psychometric questions for the responsibility axis. */
const PSYCH_RESPONSIBILITY: ReadonlyArray<{ id: string; reversed: boolean; weight: number }> = [
  { id: 'psych_r01', reversed: false, weight: 1.0 },
  { id: 'psych_r02', reversed: false, weight: 1.0 },
  { id: 'psych_r03', reversed: false, weight: 1.0 },
  { id: 'psych_r04', reversed: true, weight: 1.0 },
  { id: 'psych_r05', reversed: false, weight: 1.0 },
  { id: 'psych_r06', reversed: true, weight: 1.0 },
];

/** SJT scenarios contributing to responsibility (scenarios 1, 4, 7). */
const SJT_RESPONSIBILITY: ReadonlyArray<{ id: string; weight: number }> = [
  { id: 'sjt_01', weight: 2.0 },
  { id: 'sjt_04', weight: 2.0 },
  { id: 'sjt_07', weight: 2.0 },
];

const MAX_PSYCH = 6 * 5 * 1.0; // 30
const MAX_SJT = 3 * 3 * 2.0; // 18
const MAX_RESPONSIBILITY = MAX_PSYCH + MAX_SJT; // 48

/**
 * Scores the responsibility axis combining psychometric (Block 4) and
 * scenario (Block 5, scenarios 1, 4 & 7) answers.
 *
 * Reverse-scored psychometric items are inverted: effectiveValue = 6 − value.
 * Result is normalised to [0, 100].
 */
export function scoreResponsibility(answers: Map<QuestionId, AnswerRecord>): number {
  let rawSum = 0;

  for (const { id, reversed, weight } of PSYCH_RESPONSIBILITY) {
    const value = getLikertValue(answers, id);
    if (value === null) continue;
    rawSum += (reversed ? 6 - value : value) * weight;
  }

  for (const { id, weight } of SJT_RESPONSIBILITY) {
    rawSum += getSjtScore(answers, id) * weight;
  }

  return Math.round((rawSum / MAX_RESPONSIBILITY) * 100);
}
