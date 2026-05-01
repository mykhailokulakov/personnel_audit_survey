import { describe, it, expect } from 'vitest';
import { computeAttentionScore } from '@/lib/scoring/validity/attention-score';
import { makeAnswers, likert, sc } from './_helpers';

describe('computeAttentionScore', () => {
  it('returns score=100 and total=0 when no attention checks are in answers', () => {
    const answers = makeAnswers([['psych_r01', likert(3)]]);
    const result = computeAttentionScore(answers);
    expect(result.score).toBe(100);
    expect(result.total).toBe(0);
    expect(result.passed).toBe(0);
  });

  it('passes psychometric AC when the exact target Likert value is selected', () => {
    const answers = makeAnswers([['ac_psych_01', likert(2)]]);
    const result = computeAttentionScore(answers);
    expect(result.passed).toBe(1);
    expect(result.total).toBe(1);
  });

  it('fails psychometric AC when a different Likert value is selected', () => {
    const answers = makeAnswers([['ac_psych_01', likert(5)]]);
    const result = computeAttentionScore(answers);
    expect(result.passed).toBe(0);
    expect(result.total).toBe(1);
  });

  it('passes scenario AC when the mature option is selected', () => {
    const answers = makeAnswers([['ac_sjt_01', sc('ac_sjt_01_d')]]);
    const result = computeAttentionScore(answers);
    expect(result.passed).toBe(1);
  });

  it('fails scenario AC when a non-mature option is selected', () => {
    const answers = makeAnswers([['ac_sjt_01', sc('ac_sjt_01_a')]]);
    const result = computeAttentionScore(answers);
    expect(result.passed).toBe(0);
  });

  it('returns score=100 when all 4 attention checks are passed', () => {
    const answers = makeAnswers([
      ['ac_psych_01', likert(2)],
      ['ac_psych_02', likert(3)],
      ['ac_sjt_01', sc('ac_sjt_01_d')],
      ['ac_sjt_02', sc('ac_sjt_02_d')],
    ]);
    const result = computeAttentionScore(answers);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(4);
    expect(result.total).toBe(4);
  });

  it('returns score=0 when all 4 attention checks are failed', () => {
    const answers = makeAnswers([
      ['ac_psych_01', likert(5)],
      ['ac_psych_02', likert(1)],
      ['ac_sjt_01', sc('ac_sjt_01_a')],
      ['ac_sjt_02', sc('ac_sjt_02_c')],
    ]);
    const result = computeAttentionScore(answers);
    expect(result.score).toBe(0);
  });

  it('returns score=50 when 2 of 4 checks are passed', () => {
    const answers = makeAnswers([
      ['ac_psych_01', likert(2)], // pass
      ['ac_psych_02', likert(5)], // fail
      ['ac_sjt_01', sc('ac_sjt_01_d')], // pass
      ['ac_sjt_02', sc('ac_sjt_02_a')], // fail
    ]);
    const result = computeAttentionScore(answers);
    expect(result.score).toBe(50);
    expect(result.passed).toBe(2);
  });

  it('ac_psych_02 requires value 3 (not 2)', () => {
    const answers = makeAnswers([['ac_psych_02', likert(2)]]);
    const result = computeAttentionScore(answers);
    expect(result.passed).toBe(0);
  });
});
