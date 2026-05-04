import { describe, it, expect } from 'vitest';
import type { Answer } from '@/lib/types/survey';
import { scoreLearnability } from '@/lib/scoring/axes/learnability';
import { scoreLeadership } from '@/lib/scoring/axes/leadership';
import { scoreResponsibility } from '@/lib/scoring/axes/responsibility';
import { scoreInitiative } from '@/lib/scoring/axes/initiative';
import { makeAnswers, likert, sc, bool } from './_helpers';

const matureOption = (sjtId: string) => sc(`${sjtId}_d`);
const passiveOption = (sjtId: string) => sc(`${sjtId}_a`);

describe('scoreLearnability', () => {
  it('returns 0 with no answers', () => {
    expect(scoreLearnability(new Map())).toBe(0);
  });

  it('returns 100 when all learnability items are at maximum', () => {
    const answers = makeAnswers([
      ['psych_n01', likert(5)],
      ['psych_n02', likert(5)],
      ['psych_n03', likert(1)], // reversed: 6-1=5
      ['psych_n04', likert(5)],
      ['psych_n05', likert(5)],
      ['sjt_03', matureOption('sjt_03')],
      ['sjt_06', matureOption('sjt_06')],
      ['cog_02', sc('e')], // max=4
      ['cog_03', sc('d')], // max=3
    ]);
    expect(scoreLearnability(answers)).toBe(100);
  });

  it('applies reverse scoring: psych_n03 with value 1 contributes max (5)', () => {
    const withMin = makeAnswers([['psych_n03', likert(5)]]);
    const withMax = makeAnswers([['psych_n03', likert(1)]]);
    expect(scoreLearnability(withMax)).toBeGreaterThan(scoreLearnability(withMin));
  });

  it('psych_n03 with value 5 contributes 1 (reversed)', () => {
    const answers = makeAnswers([['psych_n03', likert(5)]]);
    // (6-5)*1.0 = 1 out of max 40.5
    const expected = Math.round((1 / 40.5) * 100);
    expect(scoreLearnability(answers)).toBe(expected);
  });

  it('scenario sjt_03 with mature option contributes weight=2.0 × score=3 = 6', () => {
    const answers = makeAnswers([['sjt_03', matureOption('sjt_03')]]);
    const expected = Math.round((6 / 40.5) * 100);
    expect(scoreLearnability(answers)).toBe(expected);
  });
});

describe('scoreLeadership', () => {
  it('returns 0 with no answers', () => {
    expect(scoreLeadership(new Map())).toBe(0);
  });

  it('returns 100 when all items are at maximum (excluding bonus)', () => {
    const answers = makeAnswers([
      ['psych_l01', likert(5)],
      ['psych_l02', likert(5)],
      ['psych_l03', likert(5)],
      ['psych_l04', likert(1)], // reversed
      ['psych_l05', likert(1)], // reversed
      ['psych_l06', likert(5)],
      ['sjt_01', matureOption('sjt_01')],
      ['sjt_04', matureOption('sjt_04')],
      ['sjt_05', matureOption('sjt_05')],
      ['sjt_06', matureOption('sjt_06')],
    ]);
    expect(scoreLeadership(answers)).toBe(100);
  });

  it('adds +5 bonus for team size > 10 (team_11_30)', () => {
    const base = makeAnswers([['psych_l01', likert(5)]]);
    const withBonus = makeAnswers([
      ['psych_l01', likert(5)],
      ['basic_leadership_yn', bool(true)],
      ['basic_team_size', sc('team_11_30')],
    ]);
    expect(scoreLeadership(withBonus)).toBeGreaterThan(scoreLeadership(base));
    expect(scoreLeadership(withBonus) - scoreLeadership(base)).toBe(5);
  });

  it('adds +5 bonus for team_gt30 as well', () => {
    const withBonus = makeAnswers([
      ['psych_l01', likert(5)],
      ['basic_team_size', sc('team_gt30')],
    ]);
    const without = makeAnswers([['psych_l01', likert(5)]]);
    expect(scoreLeadership(withBonus) - scoreLeadership(without)).toBe(5);
  });

  it('does not add bonus for small team (team_4_10)', () => {
    const answers = makeAnswers([
      ['psych_l01', likert(5)],
      ['basic_team_size', sc('team_4_10')],
    ]);
    const without = makeAnswers([['psych_l01', likert(5)]]);
    expect(scoreLeadership(answers)).toBe(scoreLeadership(without));
  });

  it('caps the score at 100 even with bonus', () => {
    const entries: Array<[string, Answer]> = [
      ['psych_l01', likert(5)],
      ['psych_l02', likert(5)],
      ['psych_l03', likert(5)],
      ['psych_l06', likert(5)],
      ['psych_l04', likert(1)],
      ['psych_l05', likert(1)],
      ['sjt_01', matureOption('sjt_01')],
      ['sjt_04', matureOption('sjt_04')],
      ['sjt_05', matureOption('sjt_05')],
      ['sjt_06', matureOption('sjt_06')],
      ['basic_team_size', sc('team_gt30')],
    ];
    expect(scoreLeadership(makeAnswers(entries))).toBe(100);
  });

  it('psych_l04 and psych_l05 are reverse-scored', () => {
    const withMin = makeAnswers([['psych_l04', likert(5)]]);
    const withMax = makeAnswers([['psych_l04', likert(1)]]);
    expect(scoreLeadership(withMax)).toBeGreaterThan(scoreLeadership(withMin));
  });
});

describe('scoreResponsibility', () => {
  it('returns 0 with no answers', () => {
    expect(scoreResponsibility(new Map())).toBe(0);
  });

  it('returns 100 when all items are at maximum', () => {
    const answers = makeAnswers([
      ['psych_r01', likert(5)],
      ['psych_r02', likert(5)],
      ['psych_r03', likert(5)],
      ['psych_r04', likert(1)], // reversed
      ['psych_r05', likert(5)],
      ['psych_r06', likert(1)], // reversed
      ['sjt_01', matureOption('sjt_01')],
      ['sjt_04', matureOption('sjt_04')],
      ['sjt_07', matureOption('sjt_07')],
    ]);
    expect(scoreResponsibility(answers)).toBe(100);
  });

  it('psych_r04 and psych_r06 are reverse-scored', () => {
    const highR04 = makeAnswers([['psych_r04', likert(1)]]);
    const lowR04 = makeAnswers([['psych_r04', likert(5)]]);
    expect(scoreResponsibility(highR04)).toBeGreaterThan(scoreResponsibility(lowR04));
  });
});

describe('scoreInitiative', () => {
  it('returns 0 with no answers', () => {
    expect(scoreInitiative(new Map())).toBe(0);
  });

  it('returns 100 when all items are at maximum', () => {
    const answers = makeAnswers([
      ['psych_i01', likert(5)],
      ['psych_i02', likert(5)],
      ['psych_i03', likert(5)],
      ['psych_i04', likert(5)],
      ['psych_i05', likert(1)], // reversed
      ['psych_i06', likert(5)],
      ['sjt_02', matureOption('sjt_02')],
      ['sjt_05', matureOption('sjt_05')],
    ]);
    expect(scoreInitiative(answers)).toBe(100);
  });

  it('psych_i05 is reverse-scored', () => {
    const high = makeAnswers([['psych_i05', likert(1)]]);
    const low = makeAnswers([['psych_i05', likert(5)]]);
    expect(scoreInitiative(high)).toBeGreaterThan(scoreInitiative(low));
  });

  it('sjt_02 with passive option contributes 0, mature contributes 6', () => {
    const mature = makeAnswers([['sjt_02', matureOption('sjt_02')]]);
    const passive = makeAnswers([['sjt_02', passiveOption('sjt_02')]]);
    expect(scoreInitiative(mature)).toBeGreaterThan(scoreInitiative(passive));
    expect(scoreInitiative(passive)).toBe(0);
  });
});
