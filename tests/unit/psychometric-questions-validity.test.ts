import { describe, it, expect } from 'vitest';
import psychometricData from '@/data/questions/psychometric.json';
import type { PsychometricQuestion } from '@/lib/types/psychometric';
import { PROFILE_AXES } from '@/lib/types/axes';

const questions = psychometricData.questions as PsychometricQuestion[];

describe('Psychometric question bank — structural validity', () => {
  it('has between 22 and 30 questions total', () => {
    expect(questions.length).toBeGreaterThanOrEqual(22);
    expect(questions.length).toBeLessThanOrEqual(30);
  });

  it('every question has a non-empty id', () => {
    questions.forEach((q) => {
      expect(typeof q.id).toBe('string');
      expect(q.id.trim()).not.toBe('');
    });
  });

  it('all question ids are unique', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question has a non-empty promptUa', () => {
    questions.forEach((q) => {
      expect(typeof q.promptUa).toBe('string');
      expect(q.promptUa.trim()).not.toBe('');
    });
  });

  it('every question has a valid axis', () => {
    questions.forEach((q) => {
      expect(PROFILE_AXES).toContain(q.axis);
    });
  });

  it('every question has weight in [0, 1]', () => {
    questions.forEach((q) => {
      expect(q.weight).toBeGreaterThanOrEqual(0);
      expect(q.weight).toBeLessThanOrEqual(1);
    });
  });

  it('every question has boolean isLieScale', () => {
    questions.forEach((q) => {
      expect(typeof q.isLieScale).toBe('boolean');
    });
  });

  it('every question has boolean isReverseScored', () => {
    questions.forEach((q) => {
      expect(typeof q.isReverseScored).toBe('boolean');
    });
  });

  it('lie-scale questions have weight = 0', () => {
    questions
      .filter((q) => q.isLieScale)
      .forEach((q) => {
        expect(q.weight).toBe(0);
      });
  });

  it('non-lie-scale questions have weight > 0', () => {
    questions
      .filter((q) => !q.isLieScale)
      .forEach((q) => {
        expect(q.weight).toBeGreaterThan(0);
      });
  });

  it('has at least 3 lie-scale questions', () => {
    const lieQuestions = questions.filter((q) => q.isLieScale);
    expect(lieQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it('has no more than 6 lie-scale questions', () => {
    const lieQuestions = questions.filter((q) => q.isLieScale);
    expect(lieQuestions.length).toBeLessThanOrEqual(6);
  });

  it('every consistencyPairId appears exactly twice (paired)', () => {
    const pairCounts = new Map<string, number>();
    questions.forEach((q) => {
      if (q.consistencyPairId !== null) {
        pairCounts.set(q.consistencyPairId, (pairCounts.get(q.consistencyPairId) ?? 0) + 1);
      }
    });
    pairCounts.forEach((count, pairId) => {
      expect(count, `consistencyPairId "${pairId}" should appear exactly twice`).toBe(2);
    });
  });

  it('has at least 2 consistency pairs', () => {
    const pairIds = new Set(
      questions.filter((q) => q.consistencyPairId !== null).map((q) => q.consistencyPairId),
    );
    expect(pairIds.size).toBeGreaterThanOrEqual(2);
  });

  it('reverse-scored questions make up ≥ 20% and ≤ 50% of non-lie questions', () => {
    const nonLie = questions.filter((q) => !q.isLieScale);
    const reversed = nonLie.filter((q) => q.isReverseScored);
    const ratio = reversed.length / nonLie.length;
    expect(ratio).toBeGreaterThanOrEqual(0.2);
    expect(ratio).toBeLessThanOrEqual(0.5);
  });

  it('has questions for all four scored axes', () => {
    const axes = new Set(questions.filter((q) => !q.isLieScale).map((q) => q.axis));
    expect(axes).toContain('responsibility');
    expect(axes).toContain('leadership');
    expect(axes).toContain('learnability');
    expect(axes).toContain('initiative');
  });

  it('each scored axis has at least 4 questions', () => {
    const scoredAxes = ['responsibility', 'leadership', 'learnability', 'initiative'] as const;
    scoredAxes.forEach((axis) => {
      const count = questions.filter((q) => !q.isLieScale && q.axis === axis).length;
      expect(count, `axis "${axis}" should have at least 4 questions`).toBeGreaterThanOrEqual(4);
    });
  });
});
