/** Union of all profile axis identifiers. */
export type ProfileAxis =
  | 'cognitive-proxy'
  | 'learnability'
  | 'leadership'
  | 'responsibility'
  | 'initiative'
  | 'technical-readiness';

/** Ordered list of all axes, useful for iteration. */
export const PROFILE_AXES: readonly ProfileAxis[] = [
  'cognitive-proxy',
  'learnability',
  'leadership',
  'responsibility',
  'initiative',
  'technical-readiness',
] as const;

/** Ukrainian display labels for each axis. */
export const AxisLabel: Record<ProfileAxis, string> = {
  'cognitive-proxy': 'Когнітивний проксі',
  learnability: 'Навчуваність',
  leadership: 'Лідерство',
  responsibility: 'Відповідальність',
  initiative: 'Готовність наводити лад',
  'technical-readiness': 'Технічна готовність',
};
