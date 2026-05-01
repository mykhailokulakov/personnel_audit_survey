import { describe, it, expect } from 'vitest';
import { computeLieScore } from '@/lib/scoring/validity/lie-score';
import { makeAnswers, likert, sc } from './_helpers';

const LIE_IDS = ['psych_lie01', 'psych_lie02', 'psych_lie03', 'psych_lie04'] as const;

describe('computeLieScore', () => {
  it('returns score=0 and total=0 when no lie questions are answered', () => {
    const answers = makeAnswers([['psych_r01', likert(3)]]);
    const result = computeLieScore(answers);
    expect(result).toEqual({ score: 0, flaggedCount: 0, total: 0 });
  });

  it('returns score=100 when all lie questions are answered with value 5', () => {
    const answers = makeAnswers([...LIE_IDS].map((id) => [id, likert(5)]));
    const result = computeLieScore(answers);
    expect(result.score).toBe(100);
    expect(result.flaggedCount).toBe(4);
    expect(result.total).toBe(4);
  });

  it('returns score=100 when all lie questions are answered with value 4', () => {
    const answers = makeAnswers([...LIE_IDS].map((id) => [id, likert(4)]));
    expect(computeLieScore(answers).score).toBe(100);
  });

  it('returns score=0 when all lie questions are answered with value 1', () => {
    const answers = makeAnswers([...LIE_IDS].map((id) => [id, likert(1)]));
    const result = computeLieScore(answers);
    expect(result.score).toBe(0);
    expect(result.flaggedCount).toBe(0);
  });

  it('returns score=0 when all lie questions are answered with value 3', () => {
    const answers = makeAnswers([...LIE_IDS].map((id) => [id, likert(3)]));
    expect(computeLieScore(answers).score).toBe(0);
  });

  it('returns score=50 when exactly half the lie questions are flagged', () => {
    const answers = makeAnswers([
      ['psych_lie01', likert(5)],
      ['psych_lie02', likert(5)],
      ['psych_lie03', likert(1)],
      ['psych_lie04', likert(2)],
    ]);
    const result = computeLieScore(answers);
    expect(result.score).toBe(50);
    expect(result.flaggedCount).toBe(2);
  });

  it('handles partial data: 2 of 4 answered with 1 flagged → score=50', () => {
    const answers = makeAnswers([
      ['psych_lie01', likert(5)],
      ['psych_lie02', likert(1)],
    ]);
    const result = computeLieScore(answers);
    expect(result.score).toBe(50);
    expect(result.total).toBe(2);
  });

  it('skips lie questions answered with non-likert type', () => {
    const answers = makeAnswers([['psych_lie01', sc('option_a')]]);
    const result = computeLieScore(answers);
    expect(result.total).toBe(0);
    expect(result.score).toBe(0);
  });

  it('counts value=4 as flagged and value=3 as not flagged', () => {
    const answers = makeAnswers([
      ['psych_lie01', likert(4)],
      ['psych_lie02', likert(3)],
      ['psych_lie03', likert(2)],
      ['psych_lie04', likert(1)],
    ]);
    const result = computeLieScore(answers);
    expect(result.flaggedCount).toBe(1);
    expect(result.score).toBe(25);
  });
});
