import type { QuestionId, AnswerRecord, Answer, LikertValue } from '@/lib/types/survey';

/** Creates an AnswerRecord from a raw answer, with optional responseTimeMs. */
export function makeRecord(
  id: string,
  answer: Answer,
  responseTimeMs: number | null = null,
): AnswerRecord {
  return {
    questionId: id as QuestionId,
    answer,
    respondedAt: Date.now(),
    responseTimeMs,
  };
}

/** Creates an answers Map from an array of [questionId, answer, responseTimeMs?] tuples. */
export function makeAnswers(
  entries: Array<[string, Answer, number?]>,
): Map<QuestionId, AnswerRecord> {
  const map = new Map<QuestionId, AnswerRecord>();
  for (const [id, answer, ms] of entries) {
    map.set(id as QuestionId, makeRecord(id, { ...answer }, ms ?? null));
  }
  return map;
}

export const likert = (value: LikertValue): Answer => ({ type: 'likert', value });
export const sc = (optionId: string): Answer => ({ type: 'single-choice', optionId });
export const mc = (optionIds: string[]): Answer => ({ type: 'multi-choice', optionIds });
export const bool = (value: boolean): Answer => ({ type: 'boolean', value });
