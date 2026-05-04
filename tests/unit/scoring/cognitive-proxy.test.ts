import { describe, it, expect } from 'vitest';
import { scoreCognitiveProxy } from '@/lib/scoring/axes/cognitive-proxy';
import { makeAnswers, sc, likert } from './_helpers';

describe('scoreCognitiveProxy', () => {
  it('returns 0 when no cognitive answers are present', () => {
    expect(scoreCognitiveProxy(new Map())).toBe(0);
  });

  it('returns 100 when all questions have the maximum option score', () => {
    const answers = makeAnswers([
      ['cog_01', sc('e')], // 4
      ['cog_02', sc('e')], // 4
      ['cog_03', sc('d')], // 3
      ['cog_04', sc('e')], // 4
      ['cog_05', sc('d')], // 3
      ['cog_06', sc('b')], // 1
      ['cog_07', sc('b')], // 1
      ['cog_08', sc('b')], // 1
      ['cog_09', sc('c')], // 1
      ['cog_10', sc('c')], // 1
      ['cog_11', sc('c')], // 1
    ]);
    expect(scoreCognitiveProxy(answers)).toBe(100);
  });

  it('returns 0 when all questions have the minimum option score', () => {
    const answers = makeAnswers([
      ['cog_01', sc('a')],
      ['cog_02', sc('a')],
      ['cog_03', sc('a')],
      ['cog_04', sc('a')],
      ['cog_05', sc('a')],
      ['cog_06', sc('a')],
      ['cog_07', sc('a')],
      ['cog_08', sc('a')],
      ['cog_09', sc('a')],
      ['cog_10', sc('a')],
      ['cog_11', sc('a')],
    ]);
    expect(scoreCognitiveProxy(answers)).toBe(0);
  });

  it('ignores non-single-choice answers for cognitive questions', () => {
    const answers = makeAnswers([['cog_01', likert(5)]]);
    expect(scoreCognitiveProxy(answers)).toBe(0);
  });

  it('treats unknown option ids as 0 score', () => {
    const answers = makeAnswers([['cog_01', sc('z')]]);
    expect(scoreCognitiveProxy(answers)).toBe(0);
  });

  it('computes a partial score correctly when some questions are answered', () => {
    // Only cog_01 with max score (e=4, weight=0.5 → 2.0 out of 12.0 total)
    const answers = makeAnswers([['cog_01', sc('e')]]);
    const expected = Math.round((2.0 / 12.0) * 100); // = 17
    expect(scoreCognitiveProxy(answers)).toBe(expected);
  });

  it('cog_09 correctly scores only option c as 1, others as 0', () => {
    const with_c = makeAnswers([['cog_09', sc('c')]]);
    const with_a = makeAnswers([['cog_09', sc('a')]]);
    expect(scoreCognitiveProxy(with_c)).toBeGreaterThan(scoreCognitiveProxy(with_a));
  });
});
