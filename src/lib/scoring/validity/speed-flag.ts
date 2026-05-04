import type { QuestionId, AnswerRecord } from '../../types/survey';
import { VALIDITY_THRESHOLDS } from '../calibration';

const PSYCH_QUESTION_IDS: ReadonlyArray<string> = [
  'psych_r01',
  'psych_r02',
  'psych_r03',
  'psych_r04',
  'psych_r05',
  'psych_r06',
  'psych_l01',
  'psych_l02',
  'psych_l03',
  'psych_l04',
  'psych_l05',
  'psych_l06',
  'psych_n01',
  'psych_n02',
  'psych_n03',
  'psych_n04',
  'psych_n05',
  'psych_i01',
  'psych_i02',
  'psych_i03',
  'psych_i04',
  'psych_i05',
  'psych_i06',
  'psych_lie01',
  'psych_lie02',
  'psych_lie03',
  'psych_lie04',
  'ac_psych_01',
  'ac_psych_02',
];

const SJT_QUESTION_IDS: ReadonlyArray<string> = [
  'sjt_01',
  'sjt_02',
  'sjt_03',
  'sjt_04',
  'sjt_05',
  'sjt_06',
  'sjt_07',
  'ac_sjt_01',
  'ac_sjt_02',
];


function medianOf(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const midVal = sorted[mid];
  const midPrev = sorted[mid - 1];
  if (sorted.length % 2 !== 0) return midVal ?? 0;
  return ((midPrev ?? 0) + (midVal ?? 0)) / 2;
}

/**
 * Returns true when response patterns in Blocks 4–5 suggest careless or
 * scripted answering.
 *
 * Two conditions trigger the flag (either is sufficient):
 * 1. Median response time across psychometric + scenario questions < 3 000 ms.
 * 2. ≥ 80 % of Likert answers in the psychometric block share the same value.
 */
export function computeSpeedFlag(answers: Map<QuestionId, AnswerRecord>): boolean {
  const responseTimes: number[] = [];
  const likertValues: number[] = [];

  for (const qid of PSYCH_QUESTION_IDS) {
    const record = answers.get(qid as QuestionId);
    if (!record) continue;
    if (record.responseTimeMs !== null) responseTimes.push(record.responseTimeMs);
    if (record.answer.type === 'likert') likertValues.push(record.answer.value);
  }

  for (const qid of SJT_QUESTION_IDS) {
    const record = answers.get(qid as QuestionId);
    if (!record) continue;
    if (record.responseTimeMs !== null) responseTimes.push(record.responseTimeMs);
  }

  if (responseTimes.length > 0 && medianOf(responseTimes) < VALIDITY_THRESHOLDS.speed.minMedianMs) return true;

  if (likertValues.length >= VALIDITY_THRESHOLDS.speed.minLikertCount) {
    const valueCounts = new Map<number, number>();
    for (const v of likertValues) valueCounts.set(v, (valueCounts.get(v) ?? 0) + 1);
    const counts = Array.from(valueCounts.values());
    const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
    if (maxCount / likertValues.length >= VALIDITY_THRESHOLDS.speed.uniformityFraction) return true;
  }

  return false;
}
