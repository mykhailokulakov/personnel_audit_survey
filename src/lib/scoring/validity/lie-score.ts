import type { QuestionId, AnswerRecord } from '../../types/survey';
import { VALIDITY_THRESHOLDS } from '../calibration';

const LIE_QUESTION_IDS = ['psych_lie01', 'psych_lie02', 'psych_lie03', 'psych_lie04'] as const;

/**
 * Computes the lie-scale score from psychometric answers.
 *
 * A question is flagged when the respondent selects value 4 ("Agree") or
 * 5 ("Strongly agree") on a known social-desirability item, since these
 * claims are implausibly universally true.
 *
 * @returns score 0–100 (higher = stronger social-desirability bias),
 *   plus raw counts.
 */
export function computeLieScore(answers: Map<QuestionId, AnswerRecord>): {
  score: number;
  flaggedCount: number;
  total: number;
} {
  let flaggedCount = 0;
  let total = 0;

  for (const qid of LIE_QUESTION_IDS) {
    const record = answers.get(qid as QuestionId);
    if (!record || record.answer.type !== 'likert') continue;
    total++;
    if (record.answer.value >= VALIDITY_THRESHOLDS.lie.flagValue) flaggedCount++;
  }

  const score = total === 0 ? 0 : (flaggedCount / total) * 100;
  return { score, flaggedCount, total };
}
