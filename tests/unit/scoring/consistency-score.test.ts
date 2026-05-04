import { describe, it, expect } from 'vitest';
import { computeConsistencyScore } from '@/lib/scoring/validity/consistency-score';
import { makeAnswers, likert } from './_helpers';

describe('computeConsistencyScore', () => {
  it('returns score=0 and empty pairs when no pair questions are answered', () => {
    const answers = makeAnswers([['psych_r01', likert(3)]]);
    const result = computeConsistencyScore(answers);
    expect(result.score).toBe(0);
    expect(result.pairs).toHaveLength(0);
  });

  it('returns score=0 when all pairs have identical answers', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(5)],
      ['psych_r05', likert(5)],
      ['psych_n02', likert(3)],
      ['psych_n05', likert(3)],
      ['psych_l03', likert(4)],
      ['psych_l06', likert(4)],
      ['psych_i04', likert(2)],
      ['psych_i06', likert(2)],
    ]);
    const result = computeConsistencyScore(answers);
    expect(result.score).toBe(0);
    result.pairs.forEach((p) => expect(p.delta).toBe(0));
  });

  it('returns score=100 for a pair (1,5) — maximum contradiction', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(1)],
      ['psych_r05', likert(5)],
    ]);
    const result = computeConsistencyScore(answers);
    expect(result.pairs[0]?.delta).toBe(4);
    expect(result.pairs[0]?.normalized).toBe(100);
    expect(result.score).toBe(100);
  });

  it('returns score=100 for a pair (5,1) — direction does not matter', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(5)],
      ['psych_r05', likert(1)],
    ]);
    const result = computeConsistencyScore(answers);
    expect(result.pairs[0]?.delta).toBe(4);
  });

  it('normalises delta=2 to normalized=50', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(3)],
      ['psych_r05', likert(5)],
    ]);
    const result = computeConsistencyScore(answers);
    expect(result.pairs[0]?.normalized).toBe(50);
  });

  it('computes mean across multiple pairs', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(1)],
      ['psych_r05', likert(5)], // delta=4, norm=100
      ['psych_n02', likert(3)],
      ['psych_n05', likert(3)], // delta=0, norm=0
    ]);
    const result = computeConsistencyScore(answers);
    expect(result.score).toBe(50); // (100 + 0) / 2
  });

  it('skips a pair when one question is missing', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(5)],
      // psych_r05 missing
    ]);
    const result = computeConsistencyScore(answers);
    expect(result.pairs).toHaveLength(0);
    expect(result.score).toBe(0);
  });

  it('evaluates all four consistency pairs correctly', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(1)],
      ['psych_r05', likert(5)], // cp-r1: delta=4, norm=100
      ['psych_n02', likert(2)],
      ['psych_n05', likert(4)], // cp-n2: delta=2, norm=50
      ['psych_l03', likert(3)],
      ['psych_l06', likert(3)], // cp-l3: delta=0, norm=0
      ['psych_i04', likert(1)],
      ['psych_i06', likert(3)], // cp-i4: delta=2, norm=50
    ]);
    const result = computeConsistencyScore(answers);
    expect(result.pairs).toHaveLength(4);
    expect(result.score).toBeCloseTo((100 + 50 + 0 + 50) / 4, 1);
  });
});
