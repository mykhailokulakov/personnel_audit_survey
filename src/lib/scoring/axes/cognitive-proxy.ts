import type { QuestionId, AnswerRecord } from '../../types/survey';

/** Cognitive question metadata: id → {optionScores, weight}. */
const COGNITIVE_QUESTIONS: ReadonlyArray<{
  id: string;
  optionScores: Record<string, number>;
  weight: number;
}> = [
  { id: 'cog_01', optionScores: { a: 0, b: 1, c: 2, d: 3, e: 4 }, weight: 0.5 },
  { id: 'cog_02', optionScores: { a: 0, b: 1, c: 2, d: 3, e: 4 }, weight: 0.5 },
  { id: 'cog_03', optionScores: { a: 0, b: 1, c: 2, d: 3 }, weight: 0.5 },
  { id: 'cog_04', optionScores: { a: 0, b: 1, c: 2, d: 3, e: 4 }, weight: 0.5 },
  { id: 'cog_05', optionScores: { a: 0, b: 1, c: 2, d: 3 }, weight: 0.5 },
  { id: 'cog_06', optionScores: { a: 0, b: 1 }, weight: 0.5 },
  { id: 'cog_07', optionScores: { a: 0, b: 1 }, weight: 0.5 },
  { id: 'cog_08', optionScores: { a: 0, b: 1 }, weight: 0.5 },
  { id: 'cog_09', optionScores: { a: 0, b: 0, c: 1, d: 0 }, weight: 0.5 },
  { id: 'cog_10', optionScores: { a: 0, b: 0, c: 1, d: 0 }, weight: 0.5 },
  { id: 'cog_11', optionScores: { a: 0, b: 0, c: 1, d: 0 }, weight: 0.5 },
];

/** Maximum possible weighted sum: sum of (maxOptionScore × weight) per question. */
const MAX_COGNITIVE_RAW = (4 + 4 + 3 + 4 + 3 + 1 + 1 + 1 + 1 + 1 + 1) * 0.5; // = 12.0

/**
 * Scores the cognitive-proxy axis from Block 3 (cognitive) answers.
 *
 * Each question uses a custom option-score mapping; the weighted sum is
 * normalised to [0, 100]. Missing answers contribute 0.
 */
export function scoreCognitiveProxy(answers: Map<QuestionId, AnswerRecord>): number {
  let rawSum = 0;

  for (const { id, optionScores, weight } of COGNITIVE_QUESTIONS) {
    const record = answers.get(id as QuestionId);
    if (!record || record.answer.type !== 'single-choice') continue;
    rawSum += (optionScores[record.answer.optionId] ?? 0) * weight;
  }

  return Math.round((rawSum / MAX_COGNITIVE_RAW) * 100);
}
