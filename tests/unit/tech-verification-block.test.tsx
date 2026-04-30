import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TechVerificationBlock } from '@/components/survey/blocks/TechVerificationBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';
import type { QuestionId } from '@/lib/types/survey';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const qid = (s: string): QuestionId => s as QuestionId;

const mockOnNext = vi.fn();

beforeEach(() => {
  useSurveyStore.getState().resetSession();
  mockOnNext.mockReset();
});

describe('TechVerificationBlock — skip when no critical quals declared', () => {
  it('shows skip message when no critical qualifications declared', () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    expect(screen.getByText(/блок пропускається/)).toBeInTheDocument();
  });

  it('shows Далі button in skip mode', () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    expect(screen.getByRole('button', { name: 'Далі' })).toBeInTheDocument();
  });

  it('calls onNext when Далі clicked in skip mode', async () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    expect(mockOnNext).toHaveBeenCalledOnce();
  });
});

describe('TechVerificationBlock — with drone-piloting declared', () => {
  beforeEach(() => {
    useSurveyStore
      .getState()
      .recordAnswer(qid('qual_drone_piloting_yn'), { type: 'boolean', value: true }, null);
  });

  it('shows verification heading', () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    expect(screen.getByRole('heading', { name: 'Технічна перевірка' })).toBeInTheDocument();
  });

  it('shows first question (1 of 3)', () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    expect(screen.getByText(/Питання 1 з 3/)).toBeInTheDocument();
  });

  it('shows the first drone verification question', () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    // First drone question prompt
    expect(screen.getByText(/GPS lock/i)).toBeInTheDocument();
  });

  it('does NOT show the Далі button before all questions answered', () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    expect(screen.queryByRole('button', { name: 'Далі' })).not.toBeInTheDocument();
  });

  it('shows Наступне питання button after selecting an answer', async () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    expect(screen.getByRole('button', { name: 'Наступне питання' })).toBeInTheDocument();
  });

  it('stores the answer in the Zustand store', async () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    const record = useSurveyStore.getState().answers.get(qid('ver_dro_01'));
    expect(record).toBeDefined();
    expect(record?.answer.type).toBe('single-choice');
  });

  it('records responseTimeMs (non-null)', async () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    const record = useSurveyStore.getState().answers.get(qid('ver_dro_01'));
    expect(record?.responseTimeMs).not.toBeNull();
    expect(typeof record?.responseTimeMs).toBe('number');
  });

  it('does NOT show correct/incorrect feedback after answering', async () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    expect(screen.queryByText(/правильно/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/неправильно/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/вірно/i)).not.toBeInTheDocument();
  });

  it('advances to question 2 after clicking Наступне питання', async () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Наступне питання' }));
    expect(screen.getByText(/Питання 2 з 3/)).toBeInTheDocument();
  });
});

describe('TechVerificationBlock — with two qualifications declared', () => {
  beforeEach(() => {
    useSurveyStore
      .getState()
      .recordAnswer(qid('qual_drone_piloting_yn'), { type: 'boolean', value: true }, null);
    useSurveyStore
      .getState()
      .recordAnswer(qid('qual_demining_yn'), { type: 'boolean', value: true }, null);
  });

  it('shows 6 total questions (3 per qual)', () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);
    expect(screen.getByText(/Питання 1 з 6/)).toBeInTheDocument();
  });

  it('enables Далі only after all 6 questions answered', async () => {
    render(<TechVerificationBlock onNext={mockOnNext} />);

    // Answer all 6 questions
    for (let i = 0; i < 6; i++) {
      const radios = screen.getAllByRole('radio');
      await userEvent.click(radios[0]!);
      if (i < 5) {
        await userEvent.click(screen.getByRole('button', { name: 'Наступне питання' }));
      }
    }

    expect(screen.getByRole('button', { name: 'Далі' })).not.toBeDisabled();
  });
});
