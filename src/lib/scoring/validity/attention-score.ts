import type { QuestionId, AnswerRecord } from '../../types/survey';

/** Psychometric attention checks: question id → expected Likert value. */
const PSYCH_ATTENTION_CHECKS: ReadonlyArray<{ qid: string; expectedValue: number }> = [
  { qid: 'ac_psych_01', expectedValue: 2 },
  { qid: 'ac_psych_02', expectedValue: 3 },
];

/** Scenario attention checks: question id → expected mature option id. */
const SJT_ATTENTION_CHECKS: ReadonlyArray<{ qid: string; matureOptionId: string }> = [
  { qid: 'ac_sjt_01', matureOptionId: 'ac_sjt_01_d' },
  { qid: 'ac_sjt_02', matureOptionId: 'ac_sjt_02_d' },
];

/**
 * Computes the attention score from embedded attention-check questions.
 *
 * Psychometric checks require a specific Likert value; scenario checks
 * require the "mature" (score=3) option to be selected.
 * When no attention checks were presented, returns score=100 (no failures).
 *
 * @returns score 0–100 (higher = more checks passed) and raw counts.
 */
export function computeAttentionScore(answers: Map<QuestionId, AnswerRecord>): {
  score: number;
  passed: number;
  total: number;
} {
  let passed = 0;
  let total = 0;

  for (const { qid, expectedValue } of PSYCH_ATTENTION_CHECKS) {
    const record = answers.get(qid as QuestionId);
    if (!record) continue;
    total++;
    if (record.answer.type === 'likert' && record.answer.value === expectedValue) passed++;
  }

  for (const { qid, matureOptionId } of SJT_ATTENTION_CHECKS) {
    const record = answers.get(qid as QuestionId);
    if (!record) continue;
    total++;
    if (record.answer.type === 'single-choice' && record.answer.optionId === matureOptionId)
      passed++;
  }

  const score = total === 0 ? 100 : (passed / total) * 100;
  return { score, passed, total };
}
