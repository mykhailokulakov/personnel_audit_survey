import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CognitiveBlock } from '@/components/survey/blocks/CognitiveBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';
import cognitiveData from '@/data/questions/cognitive.json';
import type { CognitiveQuestion } from '@/lib/types/cognitive';
import type { QuestionId } from '@/lib/types/survey';

const qid = (s: string): QuestionId => s as QuestionId;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const questions = cognitiveData.questions as CognitiveQuestion[];

beforeEach(() => {
  useSurveyStore.getState().resetSession();
});

describe('CognitiveBlock — rendering', () => {
  it('renders the block heading', () => {
    render(<CognitiveBlock />);
    expect(screen.getByRole('heading', { name: 'Когнітивний профіль' })).toBeInTheDocument();
  });

  it('renders a description paragraph', () => {
    render(<CognitiveBlock />);
    expect(screen.getByText(/правильних відповідей немає/)).toBeInTheDocument();
  });

  it(`renders all ${questions.length} questions`, () => {
    render(<CognitiveBlock />);
    questions.forEach((q) => {
      expect(screen.getByText(q.promptUa)).toBeInTheDocument();
    });
  });

  it('renders options for the first question', () => {
    render(<CognitiveBlock />);
    const firstQ = questions[0]!;
    firstQ.options.forEach((opt) => {
      expect(screen.getAllByText(opt.textUa).length).toBeGreaterThan(0);
    });
  });
});

describe('CognitiveBlock — answer recording', () => {
  it('stores a single-choice answer in the Zustand store when option selected', async () => {
    render(<CognitiveBlock />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);

    const record = useSurveyStore.getState().answers.get(qid(questions[0]!.id));
    expect(record).toBeDefined();
    expect(record?.answer.type).toBe('single-choice');
  });

  it('updates the answer when a different option is selected', async () => {
    render(<CognitiveBlock />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    await userEvent.click(radios[1]!);

    const record = useSurveyStore.getState().answers.get(qid(questions[0]!.id));
    expect(record?.answer.type).toBe('single-choice');
    if (record?.answer.type === 'single-choice') {
      expect(record.answer.optionId).toBe(questions[0]!.options[1]!.id);
    }
  });
});

describe('CognitiveBlock — question data integrity', () => {
  it('every question has axisHint = "cognitive-proxy"', () => {
    questions.forEach((q) => {
      expect(q.axisHint).toBe('cognitive-proxy');
    });
  });

  it('every question has weight = 0.5', () => {
    questions.forEach((q) => {
      expect(q.weight).toBe(0.5);
    });
  });

  it('every question has at least 2 options', () => {
    questions.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('every question has optionScores covering all its options', () => {
    questions.forEach((q) => {
      q.options.forEach((opt) => {
        expect(q.optionScores).toHaveProperty(opt.id);
        expect(typeof q.optionScores[opt.id]).toBe('number');
      });
    });
  });

  it('has at least 10 questions', () => {
    expect(questions.length).toBeGreaterThanOrEqual(10);
  });
});
