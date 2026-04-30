import type { ProfileAxis } from './axes';

/** Identifies a survey block by its logical name. */
export type BlockId =
  | 'intro'
  | 'basic'
  | 'verification'
  | 'cognitive'
  | 'psychometric'
  | 'scenarios'
  | 'results';

/** Branded string that uniquely identifies a survey question. */
export type QuestionId = string & { readonly __brand: 'QuestionId' };

/** Lifecycle status of a survey block. */
export type BlockStatus = 'pending' | 'in-progress' | 'completed';

/** Single-select answer. */
export type SingleChoiceAnswer = { type: 'single-choice'; optionId: string };

/** Multi-select answer. */
export type MultiChoiceAnswer = { type: 'multi-choice'; optionIds: string[] };

/** 5-point Likert scale answer. */
export type LikertAnswer = { type: 'likert'; value: 1 | 2 | 3 | 4 | 5 };

/** Free-text answer. */
export type TextAnswer = { type: 'text'; value: string };

/** Binary yes/no answer. */
export type BooleanAnswer = { type: 'boolean'; value: boolean };

/** Discriminated union of all answer types. */
export type Answer =
  | SingleChoiceAnswer
  | MultiChoiceAnswer
  | LikertAnswer
  | TextAnswer
  | BooleanAnswer;

/** Persisted record of a single answer, including timing metadata. */
export type AnswerRecord = {
  questionId: QuestionId;
  answer: Answer;
  /** Unix timestamp (ms) when the answer was recorded. */
  respondedAt: number;
  /** Time in ms the respondent spent on this question; null if not tracked. */
  responseTimeMs: number | null;
};

/** Metadata describing a question's scoring properties. */
export type QuestionMeta = {
  id: QuestionId;
  blockId: BlockId;
  axes: ProfileAxis[];
  weight: number;
  isLieScale: boolean;
  isAttentionCheck: boolean;
  isReverseScored: boolean;
};
