import type { RespondentSession } from '../types/respondent';
import type { ScoringResult, AxisScore } from './types';
import { computeLieScore } from './validity/lie-score';
import { computeConsistencyScore } from './validity/consistency-score';
import { computeAttentionScore } from './validity/attention-score';
import { computeSpeedFlag } from './validity/speed-flag';
import { computeOverallValidity } from './validity/overall-validity';
import { scoreCognitiveProxy } from './axes/cognitive-proxy';
import { scoreLearnability } from './axes/learnability';
import { scoreLeadership } from './axes/leadership';
import { scoreResponsibility } from './axes/responsibility';
import { scoreInitiative } from './axes/initiative';
import { scoreTechnical } from './axes/technical';
import { computeVerificationResults } from './technical-verification';
import { assignArchetype } from './archetype';

export type {
  ScoringResult,
  AxisScore,
  ValidityReport,
  ValidityLevel,
  Archetype,
  QualificationVerificationResult,
} from './types';
export { ArchetypeLabel, ArchetypeDescription } from './types';

/**
 * Computes the full scoring result for a completed respondent session.
 *
 * This is the main entry point for the scoring engine. It is a pure function:
 * no side effects, no I/O, no React dependencies.
 *
 * @param session - The in-memory session produced by the Zustand store.
 * @returns A ScoringResult ready for display and JSON export.
 */
export function scoreSession(session: RespondentSession): ScoringResult {
  const { answers, code, startedAt } = session;

  const lie = computeLieScore(answers);
  const consistency = computeConsistencyScore(answers);
  const attention = computeAttentionScore(answers);
  const speedFlag = computeSpeedFlag(answers);
  const overallValidity = computeOverallValidity(lie, consistency, attention, speedFlag);

  const qualifications = computeVerificationResults(answers);

  const profile: AxisScore[] = [
    { axis: 'cognitive-proxy', score: scoreCognitiveProxy(answers) },
    { axis: 'learnability', score: scoreLearnability(answers) },
    { axis: 'leadership', score: scoreLeadership(answers) },
    { axis: 'responsibility', score: scoreResponsibility(answers) },
    { axis: 'initiative', score: scoreInitiative(answers) },
    { axis: 'technical-readiness', score: scoreTechnical(answers, qualifications) },
  ];

  const archetype = assignArchetype(profile, overallValidity);

  const needsDocumentVerification = qualifications.some(
    (q) => q.declared && q.qualification !== 'other',
  );

  const now = Date.now();

  return {
    respondentCode: code,
    scoredAt: now,
    durationMs: now - startedAt,
    archetype,
    profile,
    validity: {
      lieScore: lie.score,
      lieCount: lie.flaggedCount,
      lieTotal: lie.total,
      consistencyScore: consistency.score,
      consistencyPairs: consistency.pairs,
      attentionScore: attention.score,
      attentionPassed: attention.passed,
      attentionTotal: attention.total,
      speedFlag,
      overall: overallValidity,
    },
    qualifications,
    needsDocumentVerification,
  };
}
