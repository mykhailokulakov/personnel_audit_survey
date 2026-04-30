import { describe, it, expect } from 'vitest';
import verificationData from '@/data/questions/verification.json';
import type { VerificationQuestion } from '@/lib/types/verification';

const questions = verificationData.questions as VerificationQuestion[];

describe('verification.json structural validity', () => {
  it('contains at least one question', () => {
    expect(questions.length).toBeGreaterThan(0);
  });

  it('every question has a non-empty id', () => {
    questions.forEach((q) => {
      expect(q.id.length).toBeGreaterThan(0);
    });
  });

  it('all question ids are unique', () => {
    const ids = questions.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every question has exactly 4 options', () => {
    questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  it('every question has exactly 1 correct option (isCorrect = true)', () => {
    questions.forEach((q) => {
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      expect(correctCount).toBe(1);
    });
  });

  it('correctOptionId matches the option with isCorrect = true', () => {
    questions.forEach((q) => {
      const correctOption = q.options.find((o) => o.isCorrect);
      expect(correctOption?.id).toBe(q.correctOptionId);
    });
  });

  it('all option ids within a question are unique', () => {
    questions.forEach((q) => {
      const optIds = q.options.map((o) => o.id);
      const unique = new Set(optIds);
      expect(unique.size).toBe(optIds.length);
    });
  });

  it('every question has a non-empty sourceNote', () => {
    questions.forEach((q) => {
      expect(q.sourceNote.trim().length).toBeGreaterThan(0);
    });
  });

  it('every question has a non-empty promptUa', () => {
    questions.forEach((q) => {
      expect(q.promptUa.trim().length).toBeGreaterThan(0);
    });
  });

  it('every option has a non-empty textUa', () => {
    questions.forEach((q) => {
      q.options.forEach((o) => {
        expect(o.textUa.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('qualification field is one of the expected values', () => {
    const validQuals = ['demining', 'drone-piloting', 'radar-radiotech', 'driving'];
    questions.forEach((q) => {
      expect(validQuals).toContain(q.qualification);
    });
  });

  it('has 3 questions for demining', () => {
    const demining = questions.filter((q) => q.qualification === 'demining');
    expect(demining).toHaveLength(3);
  });

  it('has 3 questions for drone-piloting', () => {
    const drone = questions.filter((q) => q.qualification === 'drone-piloting');
    expect(drone).toHaveLength(3);
  });

  it('has 3 questions for radar-radiotech', () => {
    const radar = questions.filter((q) => q.qualification === 'radar-radiotech');
    expect(radar).toHaveLength(3);
  });

  it('has 3 questions for driving', () => {
    const driving = questions.filter((q) => q.qualification === 'driving');
    expect(driving).toHaveLength(3);
  });
});
