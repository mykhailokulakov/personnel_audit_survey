import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikertScale } from '@/components/survey/LikertScale';
import type { LikertValue } from '@/lib/types/survey';

const defaultProps = {
  id: 'test-q',
  promptUa: 'Тестове твердження',
  value: undefined as LikertValue | undefined,
  onChange: vi.fn(),
};

describe('LikertScale — rendering', () => {
  it('renders the prompt text', () => {
    render(<LikertScale {...defaultProps} />);
    expect(screen.getByText('Тестове твердження')).toBeInTheDocument();
  });

  it('renders exactly 5 buttons', () => {
    render(<LikertScale {...defaultProps} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('renders a radiogroup with the correct aria-label', () => {
    render(<LikertScale {...defaultProps} />);
    const group = screen.getByRole('radiogroup', { name: 'Тестове твердження' });
    expect(group).toBeInTheDocument();
  });

  it('renders all 5 label texts', () => {
    render(<LikertScale {...defaultProps} />);
    expect(screen.getByText('Повністю не згоден')).toBeInTheDocument();
    expect(screen.getByText('Не згоден')).toBeInTheDocument();
    expect(screen.getByText('Нейтрально')).toBeInTheDocument();
    expect(screen.getByText('Згоден')).toBeInTheDocument();
    expect(screen.getByText('Повністю згоден')).toBeInTheDocument();
  });

  it('renders numeric labels 1–5', () => {
    render(<LikertScale {...defaultProps} />);
    [1, 2, 3, 4, 5].forEach((n) => {
      expect(screen.getByText(String(n))).toBeInTheDocument();
    });
  });
});

describe('LikertScale — selection state', () => {
  it('no button is aria-checked when value is undefined', () => {
    render(<LikertScale {...defaultProps} />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  it('the selected value button is aria-checked', () => {
    render(<LikertScale {...defaultProps} value={3} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
  });
});

describe('LikertScale — click interaction', () => {
  it('calls onChange with the clicked value', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[1]!); // value = 2
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('clicking value 5 calls onChange with 5', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[4]!);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('clicking the already-selected button calls onChange again', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} value={3} onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[2]!);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});

describe('LikertScale — keyboard interaction', () => {
  it('pressing ArrowRight on the group selects value 1 when nothing selected', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('pressing ArrowRight increments the selected value', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} value={2} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('pressing ArrowLeft decrements the selected value', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} value={4} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('pressing ArrowRight at 5 stays at 5', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} value={5} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('pressing ArrowLeft at 1 stays at 1', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} value={1} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('pressing digit "3" selects value 3', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '3');
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('pressing digit "1" selects value 1', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '1');
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('pressing digit "5" selects value 5', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} onChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    await userEvent.type(group, '5');
    expect(onChange).toHaveBeenCalledWith(5);
  });
});

describe('LikertScale — disabled state', () => {
  it('all buttons are disabled when disabled=true', () => {
    render(<LikertScale {...defaultProps} disabled />);
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });

  it('does not call onChange when disabled and clicked', async () => {
    const onChange = vi.fn();
    render(<LikertScale {...defaultProps} disabled onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    await userEvent.click(radios[0]!);
    expect(onChange).not.toHaveBeenCalled();
  });
});
