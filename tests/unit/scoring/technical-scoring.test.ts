import { describe, it, expect } from 'vitest';
import { scoreTechnical, getDrivingBaseScore } from '@/lib/scoring/axes/technical';
import { computeVerificationResults } from '@/lib/scoring/technical-verification';
import { makeAnswers, sc, bool, mc } from './_helpers';

describe('getDrivingBaseScore', () => {
  it('returns 0 when no driving categories are declared', () => {
    expect(getDrivingBaseScore(new Map())).toBe(0);
  });

  it('returns 0 when driving categories multi-choice is empty', () => {
    const answers = makeAnswers([['qual_driving_categories', mc([])]]);
    expect(getDrivingBaseScore(answers)).toBe(0);
  });

  it('returns 7 when only cat_B is declared', () => {
    const answers = makeAnswers([['qual_driving_categories', mc(['cat_B'])]]);
    expect(getDrivingBaseScore(answers)).toBe(7);
  });

  it('returns 10 when cat_C is declared', () => {
    const answers = makeAnswers([['qual_driving_categories', mc(['cat_C'])]]);
    expect(getDrivingBaseScore(answers)).toBe(10);
  });

  it('returns 10 when cat_D is declared', () => {
    const answers = makeAnswers([['qual_driving_categories', mc(['cat_D'])]]);
    expect(getDrivingBaseScore(answers)).toBe(10);
  });

  it('returns 10 when cat_B and cat_C are both declared', () => {
    const answers = makeAnswers([['qual_driving_categories', mc(['cat_B', 'cat_C'])]]);
    expect(getDrivingBaseScore(answers)).toBe(10);
  });
});

describe('scoreTechnical', () => {
  it('returns 0 when nothing is declared', () => {
    const answers = makeAnswers([]);
    const quals = computeVerificationResults(answers);
    expect(scoreTechnical(answers, quals)).toBe(0);
  });

  it('returns ~29 when only demining is declared with full verification', () => {
    const answers = makeAnswers([
      ['qual_demining_yn', bool(true)],
      ['ver_dem_01', sc('ver_dem_01_a')],
      ['ver_dem_02', sc('ver_dem_02_b')],
      ['ver_dem_03', sc('ver_dem_03_a')],
    ]);
    const quals = computeVerificationResults(answers);
    const score = scoreTechnical(answers, quals);
    // 25 * 1.0 / 85 * 100 = 29.4 → 29
    expect(score).toBe(Math.round((25 / 85) * 100));
  });

  it('returns 50% when demining (25) + drone-piloting (25) declared and fully verified', () => {
    const answers = makeAnswers([
      ['qual_demining_yn', bool(true)],
      ['ver_dem_01', sc('ver_dem_01_a')],
      ['ver_dem_02', sc('ver_dem_02_b')],
      ['ver_dem_03', sc('ver_dem_03_a')],
      ['qual_drone_piloting_yn', bool(true)],
      ['ver_dro_01', sc('ver_dro_01_c')],
      ['ver_dro_02', sc('ver_dro_02_b')],
      ['ver_dro_03', sc('ver_dro_03_c')],
    ]);
    const quals = computeVerificationResults(answers);
    const score = scoreTechnical(answers, quals);
    expect(score).toBe(Math.round((50 / 85) * 100));
  });

  it('returns 100 when all 3 critical quals + driving cat_C declared and all verified', () => {
    const answers = makeAnswers([
      ['qual_demining_yn', bool(true)],
      ['ver_dem_01', sc('ver_dem_01_a')],
      ['ver_dem_02', sc('ver_dem_02_b')],
      ['ver_dem_03', sc('ver_dem_03_a')],
      ['qual_drone_piloting_yn', bool(true)],
      ['ver_dro_01', sc('ver_dro_01_c')],
      ['ver_dro_02', sc('ver_dro_02_b')],
      ['ver_dro_03', sc('ver_dro_03_c')],
      ['qual_radar_radiotech_yn', bool(true)],
      ['ver_rad_01', sc('ver_rad_01_c')],
      ['ver_rad_02', sc('ver_rad_02_c')],
      ['ver_rad_03', sc('ver_rad_03_b')],
      ['qual_driving_categories', mc(['cat_C'])],
      ['ver_drv_01', sc('ver_drv_01_c')],
      ['ver_drv_02', sc('ver_drv_02_b')],
      ['ver_drv_03', sc('ver_drv_03_c')],
    ]);
    const quals = computeVerificationResults(answers);
    expect(scoreTechnical(answers, quals)).toBe(100);
  });

  it('halves the demining contribution when verification coefficient is 0.5', () => {
    const halfVerified = makeAnswers([
      ['qual_demining_yn', bool(true)],
      ['ver_dem_01', sc('ver_dem_01_a')], // correct
      ['ver_dem_02', sc('ver_dem_02_c')], // wrong
      ['ver_dem_03', sc('ver_dem_03_b')], // wrong
    ]);
    const fullVerified = makeAnswers([
      ['qual_demining_yn', bool(true)],
      ['ver_dem_01', sc('ver_dem_01_a')],
      ['ver_dem_02', sc('ver_dem_02_b')],
      ['ver_dem_03', sc('ver_dem_03_a')],
    ]);
    const qualsFull = computeVerificationResults(fullVerified);
    const qualsHalf = computeVerificationResults(halfVerified);
    expect(scoreTechnical(halfVerified, qualsHalf)).toBeLessThan(
      scoreTechnical(fullVerified, qualsFull),
    );
  });

  it('returns 0 contribution from demining when coefficient is 0.0', () => {
    const answers = makeAnswers([
      ['qual_demining_yn', bool(true)],
      ['ver_dem_01', sc('ver_dem_01_b')], // wrong
      ['ver_dem_02', sc('ver_dem_02_a')], // wrong
      ['ver_dem_03', sc('ver_dem_03_c')], // wrong
    ]);
    const quals = computeVerificationResults(answers);
    expect(scoreTechnical(answers, quals)).toBe(0);
  });
});
