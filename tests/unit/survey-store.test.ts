import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useSurveyStore,
  useAnswerByQuestionId,
  useIsBlockCompleted,
} from '@/lib/storage/survey-store';
import type { QuestionId } from '@/lib/types/survey';

const qid = (s: string): QuestionId => s as QuestionId;

beforeEach(() => {
  useSurveyStore.getState().resetSession();
});

describe('useSurveyStore', () => {
  describe('recordAnswer', () => {
    it('writes respondedAt as a number', () => {
      const before = Date.now();
      useSurveyStore.getState().recordAnswer(qid('q1'), { type: 'boolean', value: true }, null);
      const after = Date.now();

      const record = useSurveyStore.getState().answers.get(qid('q1'));
      expect(record).toBeDefined();
      expect(record?.respondedAt).toBeGreaterThanOrEqual(before);
      expect(record?.respondedAt).toBeLessThanOrEqual(after);
    });

    it('writes responseTimeMs when responseStartedAt is provided', () => {
      const start = Date.now() - 1500;
      useSurveyStore.getState().recordAnswer(qid('q2'), { type: 'boolean', value: false }, start);

      const record = useSurveyStore.getState().answers.get(qid('q2'));
      expect(record?.responseTimeMs).toBeGreaterThanOrEqual(1500);
    });

    it('writes responseTimeMs as null when responseStartedAt is null', () => {
      useSurveyStore.getState().recordAnswer(qid('q3'), { type: 'text', value: 'hello' }, null);

      const record = useSurveyStore.getState().answers.get(qid('q3'));
      expect(record?.responseTimeMs).toBeNull();
    });

    it('overwrites a previous answer for the same questionId', () => {
      useSurveyStore.getState().recordAnswer(qid('q4'), { type: 'boolean', value: true }, null);
      useSurveyStore.getState().recordAnswer(qid('q4'), { type: 'boolean', value: false }, null);

      const record = useSurveyStore.getState().answers.get(qid('q4'));
      expect(record?.answer).toEqual({ type: 'boolean', value: false });
    });
  });

  describe('markBlockComplete', () => {
    it('sets blockStatus to completed for the given block', () => {
      useSurveyStore.getState().markBlockComplete('intro');

      const status = useSurveyStore.getState().blockStatus.get('intro');
      expect(status).toBe('completed');
    });

    it('does not affect other blocks', () => {
      useSurveyStore.getState().markBlockComplete('intro');

      expect(useSurveyStore.getState().blockStatus.get('basic')).toBeUndefined();
    });
  });

  describe('resetSession', () => {
    it('clears code', () => {
      useSurveyStore.getState().setCode('test-123');
      useSurveyStore.getState().resetSession();
      expect(useSurveyStore.getState().code).toBe('');
    });

    it('clears answers', () => {
      useSurveyStore.getState().recordAnswer(qid('q1'), { type: 'boolean', value: true }, null);
      useSurveyStore.getState().resetSession();
      expect(useSurveyStore.getState().answers.size).toBe(0);
    });

    it('clears blockStatus', () => {
      useSurveyStore.getState().markBlockComplete('intro');
      useSurveyStore.getState().resetSession();
      expect(useSurveyStore.getState().blockStatus.size).toBe(0);
    });

    it('resets consents to false', () => {
      useSurveyStore.getState().setConsents({ dataProcessing: true, selfCompletion: true });
      useSurveyStore.getState().resetSession();
      expect(useSurveyStore.getState().consents.dataProcessing).toBe(false);
      expect(useSurveyStore.getState().consents.selfCompletion).toBe(false);
    });
  });

  describe('selectors', () => {
    it('useAnswerByQuestionId returns undefined for unknown id', () => {
      const { result } = renderHook(() => useAnswerByQuestionId(qid('nonexistent')));
      expect(result.current).toBeUndefined();
    });

    it('useIsBlockCompleted returns false for freshly initialised block', () => {
      const { result } = renderHook(() => useIsBlockCompleted('basic'));
      expect(result.current).toBe(false);
    });

    it('useIsBlockCompleted returns true after markBlockComplete', () => {
      useSurveyStore.getState().markBlockComplete('basic');
      const { result } = renderHook(() => useIsBlockCompleted('basic'));
      expect(result.current).toBe(true);
    });
  });
});
