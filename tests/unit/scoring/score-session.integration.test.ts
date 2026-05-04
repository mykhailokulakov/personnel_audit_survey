import { describe, it, expect } from 'vitest';
import { scoreSession } from '@/lib/scoring';
import type { RespondentSession } from '@/lib/types/respondent';
import type { QuestionId, AnswerRecord, Answer } from '@/lib/types/survey';

function makeRecord(id: string, answer: Answer, ms: number | null = null): AnswerRecord {
  return { questionId: id as QuestionId, answer, respondedAt: Date.now(), responseTimeMs: ms };
}

function makeSession(
  entries: Array<[string, Answer, number?]>,
  overrides?: Partial<RespondentSession>,
): RespondentSession {
  const answers = new Map<QuestionId, AnswerRecord>();
  for (const [id, answer, ms] of entries) {
    answers.set(id as QuestionId, makeRecord(id, answer, ms ?? null));
  }
  return {
    code: 'TEST_001',
    startedAt: Date.now() - 30_000,
    currentBlock: 'results',
    answers,
    blockStatus: new Map([['scenarios', 'completed']]),
    consents: { dataProcessing: true, selfCompletion: true },
    ...overrides,
  };
}

const likert = (v: 1 | 2 | 3 | 4 | 5): Answer => ({ type: 'likert', value: v });
const sc = (optionId: string): Answer => ({ type: 'single-choice', optionId });
const bool = (v: boolean): Answer => ({ type: 'boolean', value: v });
const mc = (optionIds: string[]): Answer => ({ type: 'multi-choice', optionIds });

/** Full "Potential Leader" session with reliable validity. */
function buildPotentialLeaderSession(): RespondentSession {
  return makeSession([
    // Lie scale: all neutral (not flagged)
    ['psych_lie01', likert(2)],
    ['psych_lie02', likert(2)],
    ['psych_lie03', likert(2)],
    ['psych_lie04', likert(2)],

    // Attention checks: all passed
    ['ac_psych_01', likert(2)],
    ['ac_psych_02', likert(3)],
    ['ac_sjt_01', sc('ac_sjt_01_d')],
    ['ac_sjt_02', sc('ac_sjt_02_d')],

    // Consistency pairs: identical answers
    ['psych_r01', likert(5)],
    ['psych_r05', likert(5)],
    ['psych_n02', likert(4)],
    ['psych_n05', likert(4)],
    ['psych_l03', likert(5)],
    ['psych_l06', likert(5)],
    ['psych_i04', likert(5)],
    ['psych_i06', likert(5)],

    // Leadership (high)
    ['psych_l01', likert(5)],
    ['psych_l02', likert(5)],
    ['psych_l04', likert(1)], // reversed
    ['psych_l05', likert(1)], // reversed

    // Responsibility (high)
    ['psych_r02', likert(5)],
    ['psych_r03', likert(5)],
    ['psych_r04', likert(1)], // reversed
    ['psych_r06', likert(1)], // reversed

    // Initiative (high)
    ['psych_i01', likert(5)],
    ['psych_i02', likert(5)],
    ['psych_i03', likert(5)],
    ['psych_i05', likert(1)], // reversed

    // Learnability (high)
    ['psych_n01', likert(5)],
    ['psych_n03', likert(1)], // reversed
    ['psych_n04', likert(5)],

    // Scenarios: all mature options (score=3)
    ['sjt_01', sc('sjt_01_d')],
    ['sjt_02', sc('sjt_02_d')],
    ['sjt_03', sc('sjt_03_d')],
    ['sjt_04', sc('sjt_04_d')],
    ['sjt_05', sc('sjt_05_d')],
    ['sjt_06', sc('sjt_06_d')],
    ['sjt_07', sc('sjt_07_d')],

    // Cognitive: max options
    ['cog_01', sc('e')],
    ['cog_02', sc('e')],
    ['cog_03', sc('d')],
    ['cog_04', sc('e')],
    ['cog_05', sc('d')],
    ['cog_06', sc('b')],
    ['cog_07', sc('b')],
    ['cog_08', sc('b')],
    ['cog_09', sc('c')],
    ['cog_10', sc('c')],
    ['cog_11', sc('c')],

    // Block 1: large team
    ['basic_leadership_yn', bool(true)],
    ['basic_team_size', sc('team_gt30')],

    // Response times: all normal (5s each)
  ]);
}

/** Session that triggers unreliable validity via lie scale. */
function buildUnreliableSession(): RespondentSession {
  return makeSession([
    // All lie questions flagged (value 5)
    ['psych_lie01', likert(5)],
    ['psych_lie02', likert(5)],
    ['psych_lie03', likert(5)],
    ['psych_lie04', likert(5)],

    // Attention checks: all failed
    ['ac_psych_01', likert(1)],
    ['ac_psych_02', likert(1)],
    ['ac_sjt_01', sc('ac_sjt_01_a')],
    ['ac_sjt_02', sc('ac_sjt_02_a')],
  ]);
}

describe('scoreSession (integration)', () => {
  describe('Potential Leader session', () => {
    it('assigns archetype=potential-leader', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(result.archetype).toBe('potential-leader');
    });

    it('produces reliable validity', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(result.validity.overall).toBe('reliable');
    });

    it('has 0 lie flags', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(result.validity.lieCount).toBe(0);
    });

    it('has 0 consistency issues', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(result.validity.consistencyScore).toBe(0);
    });

    it('passes all attention checks', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(result.validity.attentionPassed).toBe(result.validity.attentionTotal);
    });

    it('has leadership score ≥ 70', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      const l = result.profile.find((a) => a.axis === 'leadership')!;
      expect(l.score).toBeGreaterThanOrEqual(70);
    });

    it('has responsibility score ≥ 65', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      const r = result.profile.find((a) => a.axis === 'responsibility')!;
      expect(r.score).toBeGreaterThanOrEqual(65);
    });

    it('has initiative score ≥ 60', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      const i = result.profile.find((a) => a.axis === 'initiative')!;
      expect(i.score).toBeGreaterThanOrEqual(60);
    });

    it('returns a ScoringResult with the expected shape', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(result.respondentCode).toBe('TEST_001');
      expect(result.profile).toHaveLength(6);
      expect(result.qualifications).toHaveLength(5);
      expect(typeof result.scoredAt).toBe('number');
      expect(result.durationMs).toBeGreaterThan(0);
    });

    it('does not set needsDocumentVerification when no qualifications declared', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(result.needsDocumentVerification).toBe(false);
    });
  });

  describe('Unreliable session', () => {
    it('validity is unreliable', () => {
      const result = scoreSession(buildUnreliableSession());
      expect(result.validity.overall).toBe('unreliable');
    });

    it('lie score is 100 when all lie questions flagged', () => {
      const result = scoreSession(buildUnreliableSession());
      expect(result.validity.lieScore).toBe(100);
    });

    it('assigns not-suitable or data-unreliable archetype', () => {
      const result = scoreSession(buildUnreliableSession());
      expect(['not-suitable', 'data-unreliable']).toContain(result.archetype);
    });
  });

  describe('needsDocumentVerification', () => {
    it('is true when demining is declared', () => {
      const session = makeSession([['qual_demining_yn', bool(true)]]);
      const result = scoreSession(session);
      expect(result.needsDocumentVerification).toBe(true);
    });

    it('is false when only other qualification is declared', () => {
      const session = makeSession([['qual_other_skills', mc(['skill_programming'])]]);
      const result = scoreSession(session);
      expect(result.needsDocumentVerification).toBe(false);
    });
  });

  describe('JSON serialisability', () => {
    it('ScoringResult can be serialised to JSON without errors', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      expect(() => JSON.stringify(result)).not.toThrow();
    });

    it('serialised JSON can be parsed back to an equivalent object', () => {
      const result = scoreSession(buildPotentialLeaderSession());
      const parsed = JSON.parse(JSON.stringify(result));
      expect(parsed.archetype).toBe(result.archetype);
      expect(parsed.profile).toHaveLength(6);
    });
  });
});
