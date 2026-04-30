import type { BlockId } from './survey';

/** Ukrainian display labels for each survey block. */
export const BLOCK_LABELS: Record<BlockId, string> = {
  intro: 'Вступ',
  basic: 'Базова інформація',
  verification: 'Технічна перевірка',
  cognitive: 'Когнітивний блок',
  psychometric: 'Психометрія',
  scenarios: 'Сценарії',
  results: 'Результат',
};

/** Ordered sequence of all blocks for progress calculation. */
export const BLOCK_ORDER: readonly BlockId[] = [
  'intro',
  'basic',
  'verification',
  'cognitive',
  'psychometric',
  'scenarios',
  'results',
] as const;

/** Route paths for each block. */
export const BLOCK_ROUTES: Record<BlockId, string> = {
  intro: '/survey/intro',
  basic: '/survey/basic',
  verification: '/survey/verification',
  cognitive: '/survey/cognitive',
  psychometric: '/survey/psychometric',
  scenarios: '/survey/scenarios',
  results: '/survey/results',
};
