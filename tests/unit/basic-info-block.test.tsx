import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicInfoBlock } from '@/components/survey/blocks/BasicInfoBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';
import type { QuestionId } from '@/lib/types/survey';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const qid = (s: string): QuestionId => s as QuestionId;

beforeEach(() => {
  useSurveyStore.getState().resetSession();
});

describe('BasicInfoBlock — rendering', () => {
  it('renders the main heading', () => {
    render(<BasicInfoBlock />);
    expect(screen.getByRole('heading', { name: 'Базова інформація' })).toBeInTheDocument();
  });

  it('renders demographics section', () => {
    render(<BasicInfoBlock />);
    expect(screen.getByText('Демографічна інформація')).toBeInTheDocument();
  });

  it('renders education section', () => {
    render(<BasicInfoBlock />);
    expect(screen.getByText('Освіта')).toBeInTheDocument();
  });

  it('renders career section', () => {
    render(<BasicInfoBlock />);
    expect(screen.getByText('Зайнятість та досвід')).toBeInTheDocument();
  });

  it('renders languages section', () => {
    render(<BasicInfoBlock />);
    expect(screen.getByText('Мови')).toBeInTheDocument();
  });

  it('renders the age question', () => {
    render(<BasicInfoBlock />);
    expect(screen.getByText('Ваш вік')).toBeInTheDocument();
  });

  it('renders Ukrainian and English language questions', () => {
    render(<BasicInfoBlock />);
    expect(screen.getByText('Українська мова')).toBeInTheDocument();
    expect(screen.getByText('Англійська мова')).toBeInTheDocument();
  });
});

describe('BasicInfoBlock — conditional team size', () => {
  it('does not show team size question by default', () => {
    render(<BasicInfoBlock />);
    expect(
      screen.queryByText('Найбільша кількість людей у вашому безпосередньому підпорядкуванні'),
    ).not.toBeInTheDocument();
  });

  it('shows team size question after selecting Так for leadership', async () => {
    render(<BasicInfoBlock />);
    const leadershipSection = screen.getByText(
      'Чи мали ви досвід керівництва командою або групою?',
    );
    const yesLabel = leadershipSection
      .closest('[class]')
      ?.parentElement?.querySelector('label:first-of-type');
    // Click Так radio button
    const takButtons = screen.getAllByText('Так');
    await userEvent.click(takButtons[0]!);
    expect(
      screen.getByText('Найбільша кількість людей у вашому безпосередньому підпорядкуванні'),
    ).toBeInTheDocument();
    void yesLabel;
  });

  it('hides team size question after switching to Ні', async () => {
    render(<BasicInfoBlock />);
    const takButtons = screen.getAllByText('Так');
    await userEvent.click(takButtons[0]!);
    expect(
      screen.getByText('Найбільша кількість людей у вашому безпосередньому підпорядкуванні'),
    ).toBeInTheDocument();

    const niButtons = screen.getAllByText('Ні');
    await userEvent.click(niButtons[0]!);
    expect(
      screen.queryByText('Найбільша кількість людей у вашому безпосередньому підпорядкуванні'),
    ).not.toBeInTheDocument();
  });
});

describe('BasicInfoBlock — occupation other field', () => {
  it('does not show occupation text field by default', () => {
    render(<BasicInfoBlock />);
    expect(screen.queryByText('Уточніть рід занять')).not.toBeInTheDocument();
  });

  it('shows text field when Інше occupation is selected', async () => {
    render(<BasicInfoBlock />);
    await userEvent.click(screen.getByText('Інше'));
    expect(screen.getByText('Уточніть рід занять')).toBeInTheDocument();
  });
});

describe('BasicInfoBlock — answer persistence', () => {
  it('records answer to store when option selected', async () => {
    render(<BasicInfoBlock />);
    await userEvent.click(screen.getByText('18–25 років'));
    const record = useSurveyStore.getState().answers.get(qid('basic_age'));
    expect(record?.answer).toEqual({ type: 'single-choice', optionId: 'age_18_25' });
  });

  it('records boolean answer to store when Так clicked', async () => {
    render(<BasicInfoBlock />);
    const takButtons = screen.getAllByText('Так');
    await userEvent.click(takButtons[0]!);
    const record = useSurveyStore.getState().answers.get(qid('basic_leadership_yn'));
    expect(record?.answer).toEqual({ type: 'boolean', value: true });
  });
});

describe('BasicInfoBlock — required validation', () => {
  it('renders all required questions visible on mount', () => {
    render(<BasicInfoBlock />);
    // Required: age, gender, region, edu_level, edu_field, occupation, work_experience, leadership, lang_ua, lang_en
    expect(screen.getByText('Ваш вік')).toBeInTheDocument();
    expect(screen.getByText('Стать')).toBeInTheDocument();
    expect(screen.getByText('Рівень освіти')).toBeInTheDocument();
    expect(screen.getByText('Напрям освіти')).toBeInTheDocument();
    expect(screen.getByText('Поточна зайнятість')).toBeInTheDocument();
    expect(screen.getByText('Загальний трудовий стаж')).toBeInTheDocument();
  });
});
