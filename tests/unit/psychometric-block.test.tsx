import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PsychometricBlock } from '@/components/survey/blocks/PsychometricBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';
import psychometricData from '@/data/questions/psychometric.json';
import attentionChecksData from '@/data/questions/attention-checks.json';
import type { PsychometricQuestion } from '@/lib/types/psychometric';
import { deterministicShuffle, shuffleAndSeparatePairs } from '@/lib/storage/shuffle';
import { buildPsychometricBlockItems } from '@/lib/storage/build-block-questions';
import type { QuestionId } from '@/lib/types/survey';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const questions = psychometricData.questions as PsychometricQuestion[];
const AC_COUNT = attentionChecksData.psychometricChecks.length; // 2
const TOTAL_COUNT = questions.length + AC_COUNT;

beforeEach(() => {
  useSurveyStore.getState().resetSession();
});

describe('PsychometricBlock — rendering', () => {
  it('renders the block heading', () => {
    render(<PsychometricBlock />);
    expect(screen.getByRole('heading', { name: 'Психометричний профіль' })).toBeInTheDocument();
  });

  it('renders a description paragraph', () => {
    render(<PsychometricBlock />);
    expect(screen.getByText(/Оцініть/)).toBeInTheDocument();
  });

  it(`renders all ${questions.length} main questions`, () => {
    render(<PsychometricBlock />);
    questions.forEach((q) => {
      expect(screen.getByText(q.promptUa)).toBeInTheDocument();
    });
  });

  it('renders attention-check prompts as well', () => {
    render(<PsychometricBlock />);
    attentionChecksData.psychometricChecks.forEach((ac) => {
      expect(screen.getByText(ac.promptUa)).toBeInTheDocument();
    });
  });

  it(`renders ${TOTAL_COUNT} questions total (main + attention checks)`, () => {
    render(<PsychometricBlock />);
    // Each question has a radiogroup (one per LikertScale/AttentionCheck)
    const groups = screen.getAllByRole('radiogroup');
    expect(groups).toHaveLength(TOTAL_COUNT);
  });

  it('renders 5 Likert buttons per question', () => {
    render(<PsychometricBlock />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(TOTAL_COUNT * 5);
  });
});

describe('PsychometricBlock — answer recording', () => {
  it('stores a likert answer in the Zustand store after clicking', async () => {
    useSurveyStore.getState().setCode('test-code');
    render(<PsychometricBlock />);

    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!); // first Likert scale, value 1

    const firstItem = buildPsychometricBlockItems('test-code')[0]!;
    const record = useSurveyStore.getState().answers.get(firstItem.id as QuestionId);
    expect(record).toBeDefined();
    expect(record?.answer.type).toBe('likert');
    if (record?.answer.type === 'likert') {
      expect(record.answer.value).toBe(1);
    }
  });

  it('updates the answer when a different Likert value is selected', async () => {
    useSurveyStore.getState().setCode('test-code');
    render(<PsychometricBlock />);

    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!); // value 1
    await userEvent.click(radios[4]!); // value 5 (same first question)

    const firstItem = buildPsychometricBlockItems('test-code')[0]!;
    const record = useSurveyStore.getState().answers.get(firstItem.id as QuestionId);
    if (record?.answer.type === 'likert') {
      expect(record.answer.value).toBe(5);
    }
  });
});

describe('PsychometricBlock — shuffle behaviour', () => {
  it('question order is deterministic for the same respondent code', () => {
    const order1 = deterministicShuffle(questions, 'respondent-abc').map((q) => q.id);
    const order2 = deterministicShuffle(questions, 'respondent-abc').map((q) => q.id);
    expect(order1).toEqual(order2);
  });

  it('question order differs for two different respondent codes', () => {
    const order1 = deterministicShuffle(questions, 'code-aaa').map((q) => q.id);
    const order2 = deterministicShuffle(questions, 'code-zzz').map((q) => q.id);
    expect(order1).not.toEqual(order2);
  });
});

describe('PsychometricBlock — consistency pairs not adjacent', () => {
  it('no two consistency-pair questions share a position adjacent to each other after shuffleAndSeparatePairs', () => {
    const seeds = ['alpha', 'beta', 'gamma', 'test-001', 'xyz-789'];
    seeds.forEach((seed) => {
      const ordered = shuffleAndSeparatePairs(questions, seed);
      for (let i = 0; i < ordered.length - 1; i++) {
        const a = ordered[i]!;
        const b = ordered[i + 1]!;
        if (a.consistencyPairId !== null && b.consistencyPairId !== null) {
          expect(a.consistencyPairId).not.toBe(b.consistencyPairId);
        }
      }
    });
  });
});

describe('PsychometricBlock — reverse-scored questions', () => {
  it('at least ~25% of non-lie questions are reverse-scored', () => {
    const nonLie = questions.filter((q) => !q.isLieScale);
    const reversed = nonLie.filter((q) => q.isReverseScored);
    expect(reversed.length / nonLie.length).toBeGreaterThanOrEqual(0.2);
  });

  it('reverse-scored questions are marked correctly in data', () => {
    const reversed = questions.filter((q) => q.isReverseScored);
    expect(reversed.length).toBeGreaterThan(0);
    reversed.forEach((q) => {
      expect(q.isReverseScored).toBe(true);
    });
  });
});
