import type { QuestionId, AnswerRecord } from '../../types/survey';

/**
 * Returns the Likert value (1–5) for a question, or null if unanswered/wrong type.
 * Callers must handle null to avoid treating "not answered" as a valid value.
 */
export function getLikertValue(answers: Map<QuestionId, AnswerRecord>, qid: string): number | null {
  const record = answers.get(qid as QuestionId);
  if (!record || record.answer.type !== 'likert') return null;
  return record.answer.value;
}

/**
 * Returns the SJT option score for a question.
 *
 * All SJT scenarios use the same option suffix convention:
 * _a = passive (0), _b = social-desirable (1), _c = impulsive (0), _d = mature (3).
 */
export function getSjtScore(answers: Map<QuestionId, AnswerRecord>, qid: string): number {
  const record = answers.get(qid as QuestionId);
  if (!record || record.answer.type !== 'single-choice') return 0;
  const optionId = record.answer.optionId;
  if (optionId.endsWith('_d')) return 3;
  if (optionId.endsWith('_b')) return 1;
  return 0;
}
