import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QualificationsBlock } from '@/components/survey/blocks/QualificationsBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';
import type { QuestionId } from '@/lib/types/survey';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const qid = (s: string): QuestionId => s as QuestionId;

beforeEach(() => {
  useSurveyStore.getState().resetSession();
});

describe('QualificationsBlock — rendering', () => {
  it('renders the main heading', () => {
    render(<QualificationsBlock />);
    expect(screen.getByRole('heading', { name: 'Кваліфікації' })).toBeInTheDocument();
  });

  it('renders driving section', () => {
    render(<QualificationsBlock />);
    expect(screen.getByText('Водійські права')).toBeInTheDocument();
  });

  it('renders demining section', () => {
    render(<QualificationsBlock />);
    expect(screen.getByText('Розмінування / EOD')).toBeInTheDocument();
  });

  it('renders drone-piloting section', () => {
    render(<QualificationsBlock />);
    expect(screen.getByText('Пілотування БПЛА (дрони)')).toBeInTheDocument();
  });

  it('renders radar-radiotech section', () => {
    render(<QualificationsBlock />);
    expect(screen.getByText('РЛС / радіотехніка')).toBeInTheDocument();
  });

  it('renders other-skills section', () => {
    render(<QualificationsBlock />);
    expect(screen.getByText('Інші технічні навички')).toBeInTheDocument();
  });
});

describe('QualificationsBlock — driver license multi-select', () => {
  it('renders all license categories', () => {
    render(<QualificationsBlock />);
    expect(screen.getByText('B — легковий автомобіль')).toBeInTheDocument();
    expect(screen.getByText('C — вантажний автомобіль (понад 3,5 т)')).toBeInTheDocument();
  });

  it('records multi-choice answer when category selected', async () => {
    render(<QualificationsBlock />);
    await userEvent.click(screen.getByText('B — легковий автомобіль'));
    const record = useSurveyStore.getState().answers.get(qid('qual_driving_categories'));
    expect(record?.answer).toEqual({ type: 'multi-choice', optionIds: ['cat_B'] });
  });

  it('shows driving experience question after selecting a category', async () => {
    render(<QualificationsBlock />);
    expect(screen.queryByText('Загальний стаж водіння')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('B — легковий автомобіль'));
    expect(screen.getByText('Загальний стаж водіння')).toBeInTheDocument();
  });

  it('hides driving experience question after deselecting all categories', async () => {
    render(<QualificationsBlock />);
    await userEvent.click(screen.getByText('B — легковий автомобіль'));
    expect(screen.getByText('Загальний стаж водіння')).toBeInTheDocument();
    await userEvent.click(screen.getByText('B — легковий автомобіль'));
    expect(screen.queryByText('Загальний стаж водіння')).not.toBeInTheDocument();
  });
});

describe('QualificationsBlock — critical qualification sub-questions', () => {
  it('does not show demining sub-questions by default', () => {
    render(<QualificationsBlock />);
    expect(screen.queryByText('Рівень підготовки у сфері розмінування')).not.toBeInTheDocument();
  });

  it('shows demining sub-questions after answering Так', async () => {
    render(<QualificationsBlock />);
    // First Так in demining section
    const takButtons = screen.getAllByText('Так');
    const deminingTak = takButtons[0]!;
    await userEvent.click(deminingTak);
    expect(screen.getByText('Рівень підготовки у сфері розмінування')).toBeInTheDocument();
    expect(screen.getByText('Стаж у сфері розмінування')).toBeInTheDocument();
  });

  it('records demining yes declaration in store', async () => {
    render(<QualificationsBlock />);
    const takButtons = screen.getAllByText('Так');
    await userEvent.click(takButtons[0]!);
    const record = useSurveyStore.getState().answers.get(qid('qual_demining_yn'));
    expect(record?.answer).toEqual({ type: 'boolean', value: true });
  });

  it('hides demining sub-questions after switching to Ні', async () => {
    render(<QualificationsBlock />);
    const takButtons = screen.getAllByText('Так');
    await userEvent.click(takButtons[0]!);
    expect(screen.getByText('Рівень підготовки у сфері розмінування')).toBeInTheDocument();

    const niButtons = screen.getAllByText('Ні');
    await userEvent.click(niButtons[0]!);
    expect(screen.queryByText('Рівень підготовки у сфері розмінування')).not.toBeInTheDocument();
  });

  it('stores demining level answer when selected', async () => {
    render(<QualificationsBlock />);
    const takButtons = screen.getAllByText('Так');
    await userEvent.click(takButtons[0]!);
    await userEvent.click(screen.getByText('Середній — самостійна робота, польовий досвід'));
    const record = useSurveyStore.getState().answers.get(qid('qual_demining_level'));
    expect(record?.answer).toEqual({ type: 'single-choice', optionId: 'dem_intermediate' });
  });
});

describe('QualificationsBlock — other skills', () => {
  it('does not show other-skills text field by default', () => {
    render(<QualificationsBlock />);
    expect(screen.queryByText('Уточніть «Інше»')).not.toBeInTheDocument();
  });

  it('shows text field when Інше is selected in other skills', async () => {
    render(<QualificationsBlock />);
    await userEvent.click(screen.getByText('Інше'));
    expect(screen.getByText('Уточніть «Інше»')).toBeInTheDocument();
  });
});
