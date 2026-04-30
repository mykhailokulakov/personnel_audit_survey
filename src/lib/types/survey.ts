import type { ProfileAxis } from './axes';

/** Highest completed level of formal education. */
export type EducationLevel = 'none' | 'secondary' | 'vocational' | 'bachelor' | 'master' | 'phd';

/** Broad domain of education or professional background. */
export type EducationField =
  | 'technical'
  | 'humanitarian'
  | 'natural-sciences'
  | 'medicine'
  | 'law'
  | 'economics'
  | 'military'
  | 'other';

/** Primary occupation category of the respondent. */
export type Occupation =
  | 'student'
  | 'employed'
  | 'entrepreneur'
  | 'unemployed'
  | 'military'
  | 'civil-servant'
  | 'other';

/** Self-assessed proficiency level in a language. */
export type LanguageLevel = 'none' | 'basic' | 'intermediate' | 'advanced' | 'native';

/** Ukrainian driver licence categories as defined by Ukrainian traffic law. */
export type DriverLicenseCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'other';

/** Identifies a technical qualification domain for verification and scoring. */
export type TechQualification =
  | 'demining'
  | 'drone-piloting'
  | 'radar-radiotech'
  | 'driving'
  | 'other';

/** Self-reported declaration of a single technical qualification. */
export type QualificationDeclaration = {
  /** The qualification domain being declared. */
  type: TechQualification;
  /** Respondent's own assessment of their skill level. */
  selfReportedLevel: 'beginner' | 'intermediate' | 'expert';
  /** Approximate years of experience in this qualification. */
  yearsOfExperience: number;
  /** Optional free-text clarification (max 100 chars). */
  comment?: string;
};

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
