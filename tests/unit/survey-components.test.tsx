import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SurveyProgress } from '@/components/survey/SurveyProgress';
import { SurveyNav } from '@/components/survey/SurveyNav';
import { BlockPlaceholder } from '@/components/survey/BlockPlaceholder';
import { useSurveyStore, useBlockStatus } from '@/lib/storage/survey-store';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  useSurveyStore.getState().resetSession();
  mockPush.mockReset();
});

describe('SurveyProgress', () => {
  it('shows step 1 of 7 for intro block', () => {
    useSurveyStore.getState().goToBlock('intro');
    render(<SurveyProgress />);
    expect(screen.getByText(/Крок 1 з 7.*Вступ/)).toBeInTheDocument();
  });

  it('shows step 2 of 7 when on basic block', () => {
    useSurveyStore.getState().goToBlock('basic');
    render(<SurveyProgress />);
    expect(screen.getByText(/Крок 2 з 7.*Базова інформація/)).toBeInTheDocument();
  });

  it('renders a progress element', () => {
    render(<SurveyProgress />);
    expect(document.querySelector('[data-slot="progress"]')).toBeInTheDocument();
  });
});

describe('SurveyNav', () => {
  it('renders the Далі button', () => {
    render(<SurveyNav />);
    expect(screen.getByRole('button', { name: 'Далі' })).toBeInTheDocument();
  });

  it('does not render Назад when previousBlockId is null', () => {
    render(<SurveyNav previousBlockId={null} />);
    expect(screen.queryByRole('button', { name: 'Назад' })).not.toBeInTheDocument();
  });

  it('renders Назад button when previousBlockId is provided', () => {
    render(<SurveyNav previousBlockId="intro" />);
    expect(screen.getByRole('button', { name: 'Назад' })).toBeInTheDocument();
  });

  it('Далі button is disabled when nextDisabled=true', () => {
    render(<SurveyNav nextDisabled />);
    expect(screen.getByRole('button', { name: 'Далі' })).toBeDisabled();
  });

  it('calls onNext when Далі is clicked', async () => {
    const onNext = vi.fn();
    render(<SurveyNav onNext={onNext} />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('navigates with readonly param when Назад is clicked', async () => {
    render(<SurveyNav previousBlockId="intro" />);
    await userEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(mockPush).toHaveBeenCalledWith('/survey/intro?readonly=true');
  });

  it('renders custom next label', () => {
    render(<SurveyNav nextLabel="Зберегти" />);
    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeInTheDocument();
  });
});

describe('BlockPlaceholder', () => {
  it('renders the block label', () => {
    render(<BlockPlaceholder blockId="basic" />);
    expect(screen.getByText('Блок: Базова інформація')).toBeInTheDocument();
  });

  it('shows placeholder text', () => {
    render(<BlockPlaceholder blockId="basic" />);
    expect(screen.getByText(/наступному milestone/)).toBeInTheDocument();
  });

  it('clicking Далі marks block complete and navigates to next block', async () => {
    render(<BlockPlaceholder blockId="basic" />);
    await userEvent.click(screen.getByRole('button', { name: 'Далі' }));

    expect(useSurveyStore.getState().blockStatus.get('basic')).toBe('completed');
    expect(mockPush).toHaveBeenCalledWith('/survey/verification');
  });

  it('does not render Далі button for the last block (results)', () => {
    render(<BlockPlaceholder blockId="results" />);
    expect(screen.queryByRole('button', { name: 'Далі' })).not.toBeInTheDocument();
  });
});

describe('useBlockStatus selector', () => {
  it('returns pending for an untouched block', () => {
    const { result } = renderHook(() => useBlockStatus('basic'));
    expect(result.current).toBe('pending');
  });

  it('returns completed after markBlockComplete', () => {
    useSurveyStore.getState().markBlockComplete('basic');
    const { result } = renderHook(() => useBlockStatus('basic'));
    expect(result.current).toBe('completed');
  });
});
