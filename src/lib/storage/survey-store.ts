import { create } from 'zustand';
import type { BlockId, BlockStatus, QuestionId, Answer, AnswerRecord } from '../types/survey';
import type { Consents, RespondentSession } from '../types/respondent';

type SurveyActions = {
  /** Set the respondent code and initialise currentBlock to 'intro' if not already set. */
  setCode: (code: string) => void;
  /** Record consent flags. */
  setConsents: (consents: Consents) => void;
  /**
   * Record an answer for a question.
   * If responseStartedAt is provided, responseTimeMs is computed as Date.now() - responseStartedAt.
   */
  recordAnswer: (questionId: QuestionId, answer: Answer, responseStartedAt: number | null) => void;
  /** Navigate to a different block. */
  goToBlock: (blockId: BlockId) => void;
  /** Mark a block as completed. */
  markBlockComplete: (blockId: BlockId) => void;
  /** Clear all session data back to defaults. */
  resetSession: () => void;
};

type SurveyStore = RespondentSession & SurveyActions;

const defaultSession = (): RespondentSession => ({
  code: '',
  startedAt: Date.now(),
  currentBlock: 'intro',
  answers: new Map(),
  blockStatus: new Map(),
  consents: { dataProcessing: false, selfCompletion: false },
});

export const useSurveyStore = create<SurveyStore>()((set) => ({
  ...defaultSession(),

  setCode(code) {
    set((state) => ({
      code,
      currentBlock: state.currentBlock === 'intro' ? 'intro' : state.currentBlock,
    }));
  },

  setConsents(consents) {
    set({ consents });
  },

  recordAnswer(questionId, answer, responseStartedAt) {
    const now = Date.now();
    const record: AnswerRecord = {
      questionId,
      answer,
      respondedAt: now,
      responseTimeMs: responseStartedAt !== null ? now - responseStartedAt : null,
    };
    set((state) => {
      const answers = new Map(state.answers);
      answers.set(questionId, record);
      return { answers };
    });
  },

  goToBlock(blockId) {
    set({ currentBlock: blockId });
  },

  markBlockComplete(blockId) {
    set((state) => {
      const blockStatus = new Map(state.blockStatus);
      blockStatus.set(blockId, 'completed' as BlockStatus);
      return { blockStatus };
    });
  },

  resetSession() {
    set(defaultSession());
  },
}));

/** Returns the currently active block id. */
export const useCurrentBlock = (): BlockId => useSurveyStore((s) => s.currentBlock);

/** Returns the status of the given block. */
export const useBlockStatus = (blockId: BlockId): BlockStatus =>
  useSurveyStore((s) => s.blockStatus.get(blockId) ?? 'pending');

/** Returns the recorded answer for the given question id, or undefined. */
export const useAnswerByQuestionId = (questionId: QuestionId): AnswerRecord | undefined =>
  useSurveyStore((s) => s.answers.get(questionId));

/** Returns true when the given block has been marked completed. */
export const useIsBlockCompleted = (blockId: BlockId): boolean =>
  useSurveyStore((s) => s.blockStatus.get(blockId) === 'completed');
