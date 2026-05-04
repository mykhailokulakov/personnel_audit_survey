import type { QuestionId, AnswerRecord } from '../../types/survey';
import { getLikertValue, getSjtScore } from './_helpers';

/** Psychometric questions for the learnability axis. */
const PSYCH_LEARNABILITY: ReadonlyArray<{ id: string; reversed: boolean; weight: number }> = [
  { id: 'psych_n01', reversed: false, weight: 1.0 },
  { id: 'psych_n02', reversed: false, weight: 1.0 },
  { id: 'psych_n03', reversed: true, weight: 1.0 },
  { id: 'psych_n04', reversed: false, weight: 1.0 },
  { id: 'psych_n05', reversed: false, weight: 1.0 },
];

/** SJT scenarios that test learnability (scenarios 3 and 6). */
const SJT_LEARNABILITY: ReadonlyArray<{ id: string; weight: number }> = [
  { id: 'sjt_03', weight: 2.0 },
  { id: 'sjt_06', weight: 2.0 },
];

/** Cognitive questions cross-contributing to learnability. */
const COG_CROSS: ReadonlyArray<{
  id: string;
  optionScores: Record<string, number>;
  weight: number;
}> = [
  { id: 'cog_02', optionScores: { a: 0, b: 1, c: 2, d: 3, e: 4 }, weight: 0.5 },
  { id: 'cog_03', optionScores: { a: 0, b: 1, c: 2, d: 3 }, weight: 0.5 },
];

const MAX_PSYCH = 5 * 5 * 1.0; // 5 questions × max Likert 5 × weight 1.0 = 25
const MAX_SJT = 2 * 3 * 2.0; // 2 scenarios × max score 3 × weight 2.0 = 12
const MAX_COG = 4 * 0.5 + 3 * 0.5; // cog_02 max=4, cog_03 max=3, weight 0.5 = 3.5
const MAX_LEARNABILITY = MAX_PSYCH + MAX_SJT + MAX_COG; // 40.5

/**
 * Scores the learnability axis combining psychometric (Block 4), scenario
 * (Block 5, scenarios 3 & 6) and relevant cognitive (Block 3) answers.
 *
 * Reverse-scored psychometric items are inverted: effectiveValue = 6 − value.
 * Missing answers contribute 0. Result is normalised to [0, 100].
 */
export function scoreLearnability(answers: Map<QuestionId, AnswerRecord>): number {
  let rawSum = 0;

  for (const { id, reversed, weight } of PSYCH_LEARNABILITY) {
    const value = getLikertValue(answers, id);
    if (value === null) continue;
    rawSum += (reversed ? 6 - value : value) * weight;
  }

  for (const { id, weight } of SJT_LEARNABILITY) {
    rawSum += getSjtScore(answers, id) * weight;
  }

  for (const { id, optionScores, weight } of COG_CROSS) {
    const record = answers.get(id as QuestionId);
    if (!record || record.answer.type !== 'single-choice') continue;
    rawSum += (optionScores[record.answer.optionId] ?? 0) * weight;
  }

  return Math.round((rawSum / MAX_LEARNABILITY) * 100);
}
