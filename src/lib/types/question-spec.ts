/**
 * Discriminated union describing when a question should be visible.
 * Used in basic-info.json and qualifications.json conditional fields.
 */
export type ConditionalOn =
  | { questionId: string; value: boolean }
  | { questionId: string; optionId: string }
  | { questionId: string; notEmpty: true }
  | { questionId: string; includes: string };

/** A single selectable answer option. */
export type QuestionOption = {
  id: string;
  textUa: string;
};

/** Base fields shared across all question types. */
type QuestionBase = {
  id: string;
  promptUa: string;
  required?: boolean;
  conditionalOn?: ConditionalOn;
};

/** Single-select radio question. */
export type SingleChoiceQuestion = QuestionBase & {
  type: 'single-choice';
  options: QuestionOption[];
};

/** Multi-select checkbox question. */
export type MultiChoiceQuestion = QuestionBase & {
  type: 'multi-choice';
  options: QuestionOption[];
  note?: string;
};

/** Boolean yes/no question (rendered as two radios). */
export type BooleanQuestion = QuestionBase & {
  type: 'boolean';
};

/** Free-text input question. */
export type TextQuestion = QuestionBase & {
  type: 'text';
  maxLength?: number;
  placeholder?: string;
};

/** Discriminated union of all renderable question types. */
export type QuestionSpec =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | BooleanQuestion
  | TextQuestion;

/** A logical grouping of questions displayed together as a section. */
export type QuestionSection = {
  id: string;
  titleUa: string;
  questions: QuestionSpec[];
};
