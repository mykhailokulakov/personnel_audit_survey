import type { BlockId, BlockStatus, QuestionId, AnswerRecord } from './survey';

/** Records which consent statements the respondent has agreed to. */
export type Consents = {
  dataProcessing: boolean;
  selfCompletion: boolean;
};

/** Full in-memory session for a respondent. Never persisted to localStorage. */
export type RespondentSession = {
  /** Anonymous code supplied by the respondent. */
  code: string;
  /** Unix timestamp (ms) when the session started. */
  startedAt: number;
  /** The block currently being shown. */
  currentBlock: BlockId;
  /** All recorded answers, keyed by question id. */
  answers: Map<QuestionId, AnswerRecord>;
  /** Progress status for each block. */
  blockStatus: Map<BlockId, BlockStatus>;
  /** Respondent consent flags. */
  consents: Consents;
};
