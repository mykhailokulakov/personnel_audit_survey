import { describe, it, expect } from 'vitest';
import {
  evaluateCondition,
  isQuestionVisible,
  areRequiredQuestionsAnswered,
  getDeclaredCriticalQualifications,
} from '@/lib/survey/question-helpers';
import type { AnswerRecord, QuestionId } from '@/lib/types/survey';
import type { QuestionSection } from '@/lib/types/question-spec';

const qid = (s: string): QuestionId => s as QuestionId;

function makeAnswers(entries: [string, AnswerRecord['answer']][]) {
  const map = new Map<QuestionId, AnswerRecord>();
  for (const [id, answer] of entries) {
    map.set(qid(id), {
      questionId: qid(id),
      answer,
      respondedAt: Date.now(),
      responseTimeMs: null,
    });
  }
  return map;
}

describe('evaluateCondition', () => {
  it('returns false when the referenced question has no answer', () => {
    const result = evaluateCondition({ questionId: 'q1', value: true }, new Map());
    expect(result).toBe(false);
  });

  it('value condition: returns true when boolean answer matches', () => {
    const answers = makeAnswers([['q1', { type: 'boolean', value: true }]]);
    expect(evaluateCondition({ questionId: 'q1', value: true }, answers)).toBe(true);
  });

  it('value condition: returns false when boolean answer does not match', () => {
    const answers = makeAnswers([['q1', { type: 'boolean', value: false }]]);
    expect(evaluateCondition({ questionId: 'q1', value: true }, answers)).toBe(false);
  });

  it('value condition: returns false when answer is not boolean', () => {
    const answers = makeAnswers([['q1', { type: 'single-choice', optionId: 'opt_a' }]]);
    expect(evaluateCondition({ questionId: 'q1', value: true }, answers)).toBe(false);
  });

  it('optionId condition: returns true when single-choice matches', () => {
    const answers = makeAnswers([['q1', { type: 'single-choice', optionId: 'opt_a' }]]);
    expect(evaluateCondition({ questionId: 'q1', optionId: 'opt_a' }, answers)).toBe(true);
  });

  it('optionId condition: returns false when single-choice does not match', () => {
    const answers = makeAnswers([['q1', { type: 'single-choice', optionId: 'opt_b' }]]);
    expect(evaluateCondition({ questionId: 'q1', optionId: 'opt_a' }, answers)).toBe(false);
  });

  it('optionId condition: returns false when answer is not single-choice', () => {
    const answers = makeAnswers([['q1', { type: 'boolean', value: true }]]);
    expect(evaluateCondition({ questionId: 'q1', optionId: 'opt_a' }, answers)).toBe(false);
  });

  it('notEmpty condition: returns true when multi-choice has selections', () => {
    const answers = makeAnswers([['q1', { type: 'multi-choice', optionIds: ['a', 'b'] }]]);
    expect(evaluateCondition({ questionId: 'q1', notEmpty: true }, answers)).toBe(true);
  });

  it('notEmpty condition: returns false when multi-choice is empty', () => {
    const answers = makeAnswers([['q1', { type: 'multi-choice', optionIds: [] }]]);
    expect(evaluateCondition({ questionId: 'q1', notEmpty: true }, answers)).toBe(false);
  });

  it('notEmpty condition: returns false when answer is not multi-choice', () => {
    const answers = makeAnswers([['q1', { type: 'boolean', value: true }]]);
    expect(evaluateCondition({ questionId: 'q1', notEmpty: true }, answers)).toBe(false);
  });

  it('includes condition: returns true when multi-choice includes the value', () => {
    const answers = makeAnswers([['q1', { type: 'multi-choice', optionIds: ['a', 'b'] }]]);
    expect(evaluateCondition({ questionId: 'q1', includes: 'a' }, answers)).toBe(true);
  });

  it('includes condition: returns false when multi-choice does not include the value', () => {
    const answers = makeAnswers([['q1', { type: 'multi-choice', optionIds: ['a', 'b'] }]]);
    expect(evaluateCondition({ questionId: 'q1', includes: 'c' }, answers)).toBe(false);
  });

  it('includes condition: returns false when answer is not multi-choice', () => {
    const answers = makeAnswers([['q1', { type: 'boolean', value: true }]]);
    expect(evaluateCondition({ questionId: 'q1', includes: 'a' }, answers)).toBe(false);
  });
});

describe('isQuestionVisible', () => {
  it('returns true when question has no conditionalOn', () => {
    const q = { id: 'q1', type: 'boolean' as const, promptUa: 'Q?' };
    expect(isQuestionVisible(q, new Map())).toBe(true);
  });

  it('returns true when condition is satisfied', () => {
    const q = {
      id: 'q2',
      type: 'text' as const,
      promptUa: 'Q?',
      conditionalOn: { questionId: 'q1', value: true },
    };
    const answers = makeAnswers([['q1', { type: 'boolean', value: true }]]);
    expect(isQuestionVisible(q, answers)).toBe(true);
  });

  it('returns false when condition is not satisfied', () => {
    const q = {
      id: 'q2',
      type: 'text' as const,
      promptUa: 'Q?',
      conditionalOn: { questionId: 'q1', value: true },
    };
    const answers = makeAnswers([['q1', { type: 'boolean', value: false }]]);
    expect(isQuestionVisible(q, answers)).toBe(false);
  });
});

describe('areRequiredQuestionsAnswered', () => {
  const sections: QuestionSection[] = [
    {
      id: 'sec1',
      titleUa: 'Section 1',
      questions: [
        { id: 'q_req', type: 'boolean', promptUa: 'Required?', required: true },
        { id: 'q_opt', type: 'boolean', promptUa: 'Optional?', required: false },
        {
          id: 'q_cond',
          type: 'text',
          promptUa: 'Conditional',
          required: true,
          conditionalOn: { questionId: 'q_req', value: true },
        },
      ],
    },
  ];

  it('returns false when a required question is unanswered', () => {
    expect(areRequiredQuestionsAnswered(sections, new Map())).toBe(false);
  });

  it('returns true when required question is answered', () => {
    const answers = makeAnswers([['q_req', { type: 'boolean', value: false }]]);
    expect(areRequiredQuestionsAnswered(sections, answers)).toBe(true);
  });

  it('returns false when a visible conditional required question is unanswered', () => {
    const answers = makeAnswers([['q_req', { type: 'boolean', value: true }]]);
    expect(areRequiredQuestionsAnswered(sections, answers)).toBe(false);
  });

  it('returns true when all required questions (including conditional) are answered', () => {
    const answers = makeAnswers([
      ['q_req', { type: 'boolean', value: true }],
      ['q_cond', { type: 'text', value: 'some text' }],
    ]);
    expect(areRequiredQuestionsAnswered(sections, answers)).toBe(true);
  });

  it('skips conditional question when its condition is not met', () => {
    const answers = makeAnswers([['q_req', { type: 'boolean', value: false }]]);
    expect(areRequiredQuestionsAnswered(sections, answers)).toBe(true);
  });
});

describe('getDeclaredCriticalQualifications', () => {
  it('returns empty array when no critical quals declared', () => {
    expect(getDeclaredCriticalQualifications(new Map())).toEqual([]);
  });

  it('returns demining when qual_demining_yn is true', () => {
    const answers = makeAnswers([['qual_demining_yn', { type: 'boolean', value: true }]]);
    expect(getDeclaredCriticalQualifications(answers)).toContain('demining');
  });

  it('does not return demining when qual_demining_yn is false', () => {
    const answers = makeAnswers([['qual_demining_yn', { type: 'boolean', value: false }]]);
    expect(getDeclaredCriticalQualifications(answers)).not.toContain('demining');
  });

  it('returns drone-piloting when qual_drone_piloting_yn is true', () => {
    const answers = makeAnswers([['qual_drone_piloting_yn', { type: 'boolean', value: true }]]);
    expect(getDeclaredCriticalQualifications(answers)).toContain('drone-piloting');
  });

  it('returns radar-radiotech when qual_radar_radiotech_yn is true', () => {
    const answers = makeAnswers([['qual_radar_radiotech_yn', { type: 'boolean', value: true }]]);
    expect(getDeclaredCriticalQualifications(answers)).toContain('radar-radiotech');
  });

  it('returns all three when all critical quals declared', () => {
    const answers = makeAnswers([
      ['qual_demining_yn', { type: 'boolean', value: true }],
      ['qual_drone_piloting_yn', { type: 'boolean', value: true }],
      ['qual_radar_radiotech_yn', { type: 'boolean', value: true }],
    ]);
    const result = getDeclaredCriticalQualifications(answers);
    expect(result).toHaveLength(3);
    expect(result).toContain('demining');
    expect(result).toContain('drone-piloting');
    expect(result).toContain('radar-radiotech');
  });
});
