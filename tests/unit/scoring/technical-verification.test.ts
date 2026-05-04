import { describe, it, expect } from 'vitest';
import { computeVerificationResults } from '@/lib/scoring/technical-verification';
import { makeAnswers, sc, bool, mc } from './_helpers';

describe('computeVerificationResults', () => {
  it('marks all qualifications as not-declared when no declarations exist', () => {
    const results = computeVerificationResults(new Map());
    results.forEach((r) => {
      expect(r.declared).toBe(false);
      expect(r.status).toBe('not-declared');
    });
  });

  describe('demining', () => {
    it('declared without verification answers → no-verification, coefficient=1.0', () => {
      const answers = makeAnswers([['qual_demining_yn', bool(true)]]);
      const results = computeVerificationResults(answers);
      const d = results.find((r) => r.qualification === 'demining')!;
      expect(d.declared).toBe(true);
      expect(d.coefficient).toBe(1.0);
      expect(d.status).toBe('no-verification');
      expect(d.likelyFalseFlag).toBe(false);
    });

    it('declared + all 3 correct → coefficient=1.0, status=verified', () => {
      const answers = makeAnswers([
        ['qual_demining_yn', bool(true)],
        ['ver_dem_01', sc('ver_dem_01_a')],
        ['ver_dem_02', sc('ver_dem_02_b')],
        ['ver_dem_03', sc('ver_dem_03_a')],
      ]);
      const d = computeVerificationResults(answers).find((r) => r.qualification === 'demining')!;
      expect(d.coefficient).toBe(1.0);
      expect(d.status).toBe('verified');
      expect(d.correctCount).toBe(3);
      expect(d.likelyFalseFlag).toBe(false);
    });

    it('declared + 2 of 3 correct → coefficient=1.0 (≥66%)', () => {
      const answers = makeAnswers([
        ['qual_demining_yn', bool(true)],
        ['ver_dem_01', sc('ver_dem_01_a')], // correct
        ['ver_dem_02', sc('ver_dem_02_a')], // wrong
        ['ver_dem_03', sc('ver_dem_03_a')], // correct
      ]);
      const d = computeVerificationResults(answers).find((r) => r.qualification === 'demining')!;
      expect(d.coefficient).toBe(1.0);
      expect(d.status).toBe('verified');
    });

    it('declared + 1 of 3 correct → coefficient=0.5, status=partial', () => {
      const answers = makeAnswers([
        ['qual_demining_yn', bool(true)],
        ['ver_dem_01', sc('ver_dem_01_a')], // correct
        ['ver_dem_02', sc('ver_dem_02_a')], // wrong
        ['ver_dem_03', sc('ver_dem_03_b')], // wrong
      ]);
      const d = computeVerificationResults(answers).find((r) => r.qualification === 'demining')!;
      expect(d.coefficient).toBe(0.5);
      expect(d.status).toBe('partial');
    });

    it('declared + 0 of 3 correct → coefficient=0.0, likelyFalseFlag=true, status=failed', () => {
      const answers = makeAnswers([
        ['qual_demining_yn', bool(true)],
        ['ver_dem_01', sc('ver_dem_01_b')], // wrong
        ['ver_dem_02', sc('ver_dem_02_a')], // wrong
        ['ver_dem_03', sc('ver_dem_03_c')], // wrong
      ]);
      const d = computeVerificationResults(answers).find((r) => r.qualification === 'demining')!;
      expect(d.coefficient).toBe(0.0);
      expect(d.likelyFalseFlag).toBe(true);
      expect(d.status).toBe('failed');
    });

    it('not declared → status=not-declared even if verification questions are answered', () => {
      const answers = makeAnswers([
        ['qual_demining_yn', bool(false)],
        ['ver_dem_01', sc('ver_dem_01_a')],
      ]);
      const d = computeVerificationResults(answers).find((r) => r.qualification === 'demining')!;
      expect(d.declared).toBe(false);
      expect(d.status).toBe('not-declared');
    });
  });

  describe('driving', () => {
    it('declared via driving categories → status based on verification', () => {
      const answers = makeAnswers([['qual_driving_categories', mc(['cat_B'])]]);
      const d = computeVerificationResults(answers).find((r) => r.qualification === 'driving')!;
      expect(d.declared).toBe(true);
    });

    it('not declared when driving categories is empty', () => {
      const answers = makeAnswers([['qual_driving_categories', mc([])]]);
      const d = computeVerificationResults(answers).find((r) => r.qualification === 'driving')!;
      expect(d.declared).toBe(false);
    });
  });

  describe('other', () => {
    it('other is always not-declared', () => {
      const results = computeVerificationResults(new Map());
      const o = results.find((r) => r.qualification === 'other')!;
      expect(o.declared).toBe(false);
      expect(o.status).toBe('not-declared');
    });
  });
});
