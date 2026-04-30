import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntroBlock } from '@/components/survey/blocks/IntroBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  useSurveyStore.getState().resetSession();
  mockPush.mockReset();
});

describe('IntroBlock', () => {
  it('initially renders the welcome screen', () => {
    render(<IntroBlock />);
    expect(screen.getByText('Перш ніж почати')).toBeInTheDocument();
  });

  it('clicking Далі on welcome navigates to code screen', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    expect(screen.getByText('Ваш код')).toBeInTheDocument();
  });

  it('Далі button is disabled on code screen when input is invalid', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    const nextButton = screen.getByRole('button', { name: 'Далі' });
    expect(nextButton).toBeDisabled();
  });

  it('Далі button becomes enabled when a valid code is entered', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    const input = screen.getByPlaceholderText('Введіть код');
    await userEvent.type(input, 'valid_code_001');

    expect(screen.getByRole('button', { name: 'Далі' })).not.toBeDisabled();
  });

  it('clicking Далі on code screen navigates to consents and sets store code', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    const input = screen.getByPlaceholderText('Введіть код');
    await userEvent.type(input, 'test_user_001');
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    expect(screen.getByText('Згода на обробку')).toBeInTheDocument();
    expect(useSurveyStore.getState().code).toBe('test_user_001');
  });

  it('Розпочати анкету button is disabled when no checkboxes are checked', async () => {
    render(<IntroBlock />);
    // Navigate to consents
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    await userEvent.type(screen.getByPlaceholderText('Введіть код'), 'test_001');
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    expect(screen.getByRole('button', { name: 'Розпочати анкету' })).toBeDisabled();
  });

  it('Розпочати анкету button is disabled when only one checkbox is checked', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    await userEvent.type(screen.getByPlaceholderText('Введіть код'), 'test_001');
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]!);

    expect(screen.getByRole('button', { name: 'Розпочати анкету' })).toBeDisabled();
  });

  it('Розпочати анкету button becomes enabled when both checkboxes are checked', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    await userEvent.type(screen.getByPlaceholderText('Введіть код'), 'test_001');
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]!);
    await userEvent.click(checkboxes[1]!);

    expect(screen.getByRole('button', { name: 'Розпочати анкету' })).not.toBeDisabled();
  });

  it('clicking Розпочати анкету updates store and navigates to basic', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    await userEvent.type(screen.getByPlaceholderText('Введіть код'), 'test_001');
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[0]!);
    await userEvent.click(checkboxes[1]!);
    await userEvent.click(screen.getByRole('button', { name: 'Розпочати анкету' }));

    const state = useSurveyStore.getState();
    expect(state.consents.dataProcessing).toBe(true);
    expect(state.consents.selfCompletion).toBe(true);
    expect(state.blockStatus.get('intro')).toBe('completed');
    expect(mockPush).toHaveBeenCalledWith('/survey/basic');
  });

  it('shows error message for invalid code when field is touched', async () => {
    render(<IntroBlock />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    const input = screen.getByPlaceholderText('Введіть код');
    await userEvent.type(input, 'abcd!');
    fireEvent.blur(input);

    expect(screen.getByText(/латинські літери/)).toBeInTheDocument();
  });
});
