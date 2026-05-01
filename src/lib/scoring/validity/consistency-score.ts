import type { QuestionId, AnswerRecord } from '../../types/survey';
import type { ConsistencyPairResult } from '../types';

const CONSISTENCY_PAIRS: ReadonlyArray<{ pairId: string; qA: string; qB: string }> = [
  { pairId: 'cp-r1', qA: 'psych_r01', qB: 'psych_r05' },
  { pairId: 'cp-n2', qA: 'psych_n02', qB: 'psych_n05' },
  { pairId: 'cp-l3', qA: 'psych_l03', qB: 'psych_l06' },
  { pairId: 'cp-i4', qA: 'psych_i04', qB: 'psych_i06' },
];

/**
 * Computes consistency score from paired psychometric questions.
 *
 * Each pair contains two questions expressing the same idea in different words.
 * The absolute delta between Likert values (0–4) is normalised to 0–100.
 * The overall score is the mean normalised delta across all answerable pairs.
 * A score of 0 means perfect consistency; 100 means maximum contradiction.
 *
 * @returns score 0–100 (higher = more contradictory) and per-pair details.
 */
export function computeConsistencyScore(answers: Map<QuestionId, AnswerRecord>): {
  score: number;
  pairs: ConsistencyPairResult[];
} {
  const pairs: ConsistencyPairResult[] = [];

  for (const { pairId, qA, qB } of CONSISTENCY_PAIRS) {
    const recA = answers.get(qA as QuestionId);
    const recB = answers.get(qB as QuestionId);
    if (!recA || !recB) continue;
    if (recA.answer.type !== 'likert' || recB.answer.type !== 'likert') continue;

    const delta = Math.abs(recA.answer.value - recB.answer.value);
    pairs.push({ pairId, delta, normalized: (delta / 4) * 100 });
  }

  if (pairs.length === 0) return { score: 0, pairs: [] };

  const meanNormalized = pairs.reduce((sum, p) => sum + p.normalized, 0) / pairs.length;
  return { score: meanNormalized, pairs };
}
