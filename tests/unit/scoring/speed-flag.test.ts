import { describe, it, expect } from 'vitest';
import { computeSpeedFlag } from '@/lib/scoring/validity/speed-flag';
import { makeAnswers, makeRecord, likert, sc } from './_helpers';
import type { QuestionId, AnswerRecord, Answer, LikertValue } from '@/lib/types/survey';

function makeAnswersWithTimes(
  entries: Array<[string, Answer, number | null]>,
): Map<QuestionId, AnswerRecord> {
  const map = new Map<QuestionId, AnswerRecord>();
  for (const [id, answer, ms] of entries) {
    map.set(id as QuestionId, makeRecord(id, answer, ms));
  }
  return map;
}

function variedLikert(i: number): LikertValue {
  return ((i % 5) + 1) as LikertValue;
}

const PSYCH_IDS = [
  'psych_r01',
  'psych_r02',
  'psych_r03',
  'psych_r04',
  'psych_r05',
  'psych_r06',
  'psych_l01',
  'psych_l02',
  'psych_l03',
];

describe('computeSpeedFlag', () => {
  it('returns false when there are no answers', () => {
    expect(computeSpeedFlag(new Map())).toBe(false);
  });

  it('returns false when all response times are well above 3000ms (with varied values)', () => {
    const answers = makeAnswersWithTimes(
      PSYCH_IDS.map((id, i) => [id, likert(variedLikert(i)), 5000]),
    );
    expect(computeSpeedFlag(answers)).toBe(false);
  });

  it('returns true when median response time is below 3000ms', () => {
    // 5 fast + 4 slow → median is at 1000
    const answers = makeAnswersWithTimes(
      PSYCH_IDS.map((id, i) => [id, likert(variedLikert(i)), i < 5 ? 1000 : 6000]),
    );
    expect(computeSpeedFlag(answers)).toBe(true);
  });

  it('returns true when median is exactly at the boundary (2999ms)', () => {
    const answers = makeAnswersWithTimes([
      ['psych_r01', likert(1), 2999],
      ['psych_r02', likert(2), 2999],
      ['psych_r03', likert(3), 2999],
    ]);
    expect(computeSpeedFlag(answers)).toBe(true);
  });

  it('returns false when median is exactly 3000ms', () => {
    const answers = makeAnswersWithTimes([
      ['psych_r01', likert(1), 3000],
      ['psych_r02', likert(2), 3000],
      ['psych_r03', likert(3), 3000],
    ]);
    expect(computeSpeedFlag(answers)).toBe(false);
  });

  it('returns false when response times are null (not tracked, with varied values)', () => {
    const answers = makeAnswersWithTimes(
      PSYCH_IDS.map((id, i) => [id, likert(variedLikert(i)), null]),
    );
    expect(computeSpeedFlag(answers)).toBe(false);
  });

  it('returns true when ≥80% of psychometric Likert answers are the same value', () => {
    // 8 out of 9 = 88.9% → flag
    const entries: Array<[string, Answer]> = [
      ...PSYCH_IDS.slice(0, 8).map((id): [string, Answer] => [id, likert(5)]),
      ['psych_l03', likert(3)],
    ];
    const answers = makeAnswers(entries);
    expect(computeSpeedFlag(answers)).toBe(true);
  });

  it('returns true when exactly 80% of psychometric Likert answers are the same', () => {
    const ids = PSYCH_IDS.slice(0, 5);
    const entries: Array<[string, Answer]> = [
      ...ids.slice(0, 4).map((id): [string, Answer] => [id, likert(4)]),
      [ids[4]!, likert(1)],
    ];
    const answers = makeAnswers(entries);
    expect(computeSpeedFlag(answers)).toBe(true);
  });

  it('returns false when uniformity is below 80%', () => {
    // 7 of 9 = 77.8% → no flag
    const entries: Array<[string, Answer]> = [
      ...PSYCH_IDS.slice(0, 7).map((id): [string, Answer] => [id, likert(5)]),
      [PSYCH_IDS[7]!, likert(1)],
      [PSYCH_IDS[8]!, likert(2)],
    ];
    const answers = makeAnswers(entries);
    expect(computeSpeedFlag(answers)).toBe(false);
  });

  it('does not trigger uniformity flag when fewer than 5 Likert answers exist', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(5)],
      ['psych_r02', likert(5)],
      ['psych_r03', likert(5)],
      ['psych_r04', likert(5)],
    ]);
    expect(computeSpeedFlag(answers)).toBe(false);
  });

  it('also checks scenario response times', () => {
    const answers = makeAnswersWithTimes([
      ['sjt_01', sc('sjt_01_d'), 1000],
      ['sjt_02', sc('sjt_02_d'), 1000],
      ['sjt_03', sc('sjt_03_d'), 1000],
    ]);
    expect(computeSpeedFlag(answers)).toBe(true);
  });
});
