import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionRenderer } from '@/components/survey/QuestionRenderer';
import type { QuestionSpec } from '@/lib/types/question-spec';
import type { Answer } from '@/lib/types/survey';

const singleChoiceQ: QuestionSpec = {
  id: 'q_sc',
  type: 'single-choice',
  promptUa: 'Оберіть варіант',
  required: true,
  options: [
    { id: 'opt_a', textUa: 'Варіант А' },
    { id: 'opt_b', textUa: 'Варіант Б' },
  ],
};

const multiChoiceQ: QuestionSpec = {
  id: 'q_mc',
  type: 'multi-choice',
  promptUa: 'Оберіть всі відповідні',
  required: false,
  note: 'Підказка',
  options: [
    { id: 'mc_a', textUa: 'Пункт А' },
    { id: 'mc_b', textUa: 'Пункт Б' },
    { id: 'mc_c', textUa: 'Пункт В' },
  ],
};

const booleanQ: QuestionSpec = {
  id: 'q_bool',
  type: 'boolean',
  promptUa: 'Чи маєте досвід?',
  required: true,
};

const textQ: QuestionSpec = {
  id: 'q_text',
  type: 'text',
  promptUa: 'Уточніть відповідь',
  required: false,
  maxLength: 100,
  placeholder: 'Введіть тут',
};

describe('QuestionRenderer — single-choice', () => {
  it('renders the prompt and all options', () => {
    render(<QuestionRenderer question={singleChoiceQ} answer={undefined} onChange={vi.fn()} />);
    expect(screen.getByText('Оберіть варіант')).toBeInTheDocument();
    expect(screen.getByText('Варіант А')).toBeInTheDocument();
    expect(screen.getByText('Варіант Б')).toBeInTheDocument();
  });

  it('calls onChange with single-choice answer when option selected', async () => {
    const onChange = vi.fn();
    render(<QuestionRenderer question={singleChoiceQ} answer={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByText('Варіант А'));
    expect(onChange).toHaveBeenCalledWith({ type: 'single-choice', optionId: 'opt_a' });
  });

  it('reflects the current answer selection', () => {
    const answer: Answer = { type: 'single-choice', optionId: 'opt_b' };
    render(<QuestionRenderer question={singleChoiceQ} answer={answer} onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    const optBRadio = radios.find((r) => r.closest('label')?.textContent?.includes('Варіант Б'));
    expect(optBRadio).toBeInTheDocument();
  });
});

describe('QuestionRenderer — boolean', () => {
  it('renders Так and Ні options', () => {
    render(<QuestionRenderer question={booleanQ} answer={undefined} onChange={vi.fn()} />);
    expect(screen.getByText('Так')).toBeInTheDocument();
    expect(screen.getByText('Ні')).toBeInTheDocument();
  });

  it('calls onChange with boolean true when Так is selected', async () => {
    const onChange = vi.fn();
    render(<QuestionRenderer question={booleanQ} answer={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByText('Так'));
    expect(onChange).toHaveBeenCalledWith({ type: 'boolean', value: true });
  });

  it('calls onChange with boolean false when Ні is selected', async () => {
    const onChange = vi.fn();
    render(<QuestionRenderer question={booleanQ} answer={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByText('Ні'));
    expect(onChange).toHaveBeenCalledWith({ type: 'boolean', value: false });
  });
});

describe('QuestionRenderer — multi-choice', () => {
  it('renders the prompt, note, and all options', () => {
    render(<QuestionRenderer question={multiChoiceQ} answer={undefined} onChange={vi.fn()} />);
    expect(screen.getByText('Оберіть всі відповідні')).toBeInTheDocument();
    expect(screen.getByText('Підказка')).toBeInTheDocument();
    expect(screen.getByText('Пункт А')).toBeInTheDocument();
    expect(screen.getByText('Пункт Б')).toBeInTheDocument();
  });

  it('calls onChange with selected optionId appended', async () => {
    const onChange = vi.fn();
    render(<QuestionRenderer question={multiChoiceQ} answer={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByText('Пункт А'));
    expect(onChange).toHaveBeenCalledWith({ type: 'multi-choice', optionIds: ['mc_a'] });
  });

  it('removes optionId when deselected', async () => {
    const onChange = vi.fn();
    const answer: Answer = { type: 'multi-choice', optionIds: ['mc_a', 'mc_b'] };
    render(<QuestionRenderer question={multiChoiceQ} answer={answer} onChange={onChange} />);
    await userEvent.click(screen.getByText('Пункт А'));
    expect(onChange).toHaveBeenCalledWith({ type: 'multi-choice', optionIds: ['mc_b'] });
  });
});

describe('QuestionRenderer — text', () => {
  it('renders an input with placeholder', () => {
    render(<QuestionRenderer question={textQ} answer={undefined} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Введіть тут')).toBeInTheDocument();
  });

  it('calls onChange with text answer on input', async () => {
    const onChange = vi.fn();
    render(<QuestionRenderer question={textQ} answer={undefined} onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('Введіть тут'), 'а');
    expect(onChange).toHaveBeenCalledWith({ type: 'text', value: 'а' });
  });

  it('reflects the current text value', () => {
    const answer: Answer = { type: 'text', value: 'test value' };
    render(<QuestionRenderer question={textQ} answer={answer} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
  });
});
