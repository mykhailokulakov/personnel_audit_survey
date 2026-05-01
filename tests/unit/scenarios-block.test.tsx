import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScenariosBlock } from '@/components/survey/blocks/ScenariosBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';
import { buildScenariosBlockItems } from '@/lib/storage/build-block-questions';
import type { QuestionId } from '@/lib/types/survey';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const SEED = 'test-scenarios-seed';

beforeEach(() => {
  useSurveyStore.getState().resetSession();
  useSurveyStore.getState().setCode(SEED);
});

describe('ScenariosBlock — initial render', () => {
  it('renders the block heading', () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Ситуаційні завдання' })).toBeInTheDocument();
  });

  it('shows scenario 1 of 9 initially', () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    expect(screen.getByText('Сценарій 1 з 9')).toBeInTheDocument();
  });

  it('renders the first scenario text', () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const first = buildScenariosBlockItems(SEED)[0]!;
    expect(screen.getByText(first.promptUa)).toBeInTheDocument();
  });

  it('renders exactly 4 option radio buttons', () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    // RadioGroup renders one radiogroup; options are radio items
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
  });

  it('Next button is disabled before selecting an option', () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const nextBtn = screen.getByRole('button', { name: /Наступний сценарій/i });
    expect(nextBtn).toBeDisabled();
  });
});

describe('ScenariosBlock — option selection', () => {
  it('enables Next button after selecting an option', async () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    const nextBtn = screen.getByRole('button', { name: /Наступний sценарій|Наступний сценарій/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('records the selected option in the store', async () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);

    const first = buildScenariosBlockItems(SEED)[0]!;
    const record = useSurveyStore.getState().answers.get(first.id as QuestionId);
    expect(record).toBeDefined();
    expect(record?.answer.type).toBe('single-choice');
  });
});

describe('ScenariosBlock — navigation', () => {
  it('advances to scenario 2 after selecting and clicking Next', async () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    await userEvent.click(screen.getByRole('button', { name: /Наступний сценарій/i }));
    expect(screen.getByText('Сценарій 2 з 9')).toBeInTheDocument();
  });

  it('shows scenario 2 text after advancing', async () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    await userEvent.click(screen.getByRole('button', { name: /Наступний сценарій/i }));
    const second = buildScenariosBlockItems(SEED)[1]!;
    expect(screen.getByText(second.promptUa)).toBeInTheDocument();
  });

  it('has no Back button (business requirement)', () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const backBtn = screen.queryByRole('button', { name: /Назад/i });
    expect(backBtn).toBeNull();
  });

  it('shows "Далі" on the last scenario instead of "Наступний сценарій"', async () => {
    render(<ScenariosBlock onNext={vi.fn()} />);
    const scenarios = buildScenariosBlockItems(SEED);
    // Navigate to last scenario
    for (let i = 0; i < scenarios.length - 1; i++) {
      const radios = screen.getAllByRole('radio');
      await userEvent.click(radios[0]!);
      await userEvent.click(screen.getByRole('button', { name: /Наступний сценарій/i }));
    }
    expect(screen.getByRole('button', { name: 'Далі' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Наступний сценарій/i })).toBeNull();
  });

  it('calls onNext when clicking Далі on the last scenario', async () => {
    const onNext = vi.fn();
    render(<ScenariosBlock onNext={onNext} />);
    const scenarios = buildScenariosBlockItems(SEED);
    // Navigate to last scenario
    for (let i = 0; i < scenarios.length - 1; i++) {
      const radios = screen.getAllByRole('radio');
      await userEvent.click(radios[0]!);
      await userEvent.click(screen.getByRole('button', { name: /Наступний сценарій/i }));
    }
    // On last scenario: select then click Далі
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    expect(onNext).toHaveBeenCalledOnce();
  });
});
