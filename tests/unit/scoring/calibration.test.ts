import { describe, it, expect } from 'vitest';
import {
  ARCHETYPE_THRESHOLDS,
  VALIDITY_THRESHOLDS,
  TECH_QUALIFICATION_WEIGHTS,
  AXIS_WEIGHTS,
} from '@/lib/scoring/calibration';
import { assignArchetype } from '@/lib/scoring/archetype';
import { computeOverallValidity } from '@/lib/scoring/validity/overall-validity';
import type { AxisScore } from '@/lib/scoring/types';

// ---------------------------------------------------------------------------
// Helper — build an AxisScore array from a plain object
// ---------------------------------------------------------------------------
function makeProfile(scores: {
  leadership: number;
  responsibility: number;
  initiative: number;
  technical: number;
  learnability: number;
  cognitive: number;
}): AxisScore[] {
  return [
    { axis: 'leadership', score: scores.leadership },
    { axis: 'responsibility', score: scores.responsibility },
    { axis: 'initiative', score: scores.initiative },
    { axis: 'technical-readiness', score: scores.technical },
    { axis: 'learnability', score: scores.learnability },
    { axis: 'cognitive-proxy', score: scores.cognitive },
  ];
}

// ---------------------------------------------------------------------------
// ARCHETYPE_THRESHOLDS — internal consistency
// ---------------------------------------------------------------------------
describe('ARCHETYPE_THRESHOLDS internal consistency', () => {
  it('weakAxis is a positive number below strongAxis', () => {
    expect(ARCHETYPE_THRESHOLDS.weakAxis).toBeGreaterThan(0);
    expect(ARCHETYPE_THRESHOLDS.weakAxis).toBeLessThan(ARCHETYPE_THRESHOLDS.strongAxis);
  });

  it('potentialLeader thresholds are each ≥ 50', () => {
    expect(ARCHETYPE_THRESHOLDS.potentialLeader.leadership).toBeGreaterThanOrEqual(50);
    expect(ARCHETYPE_THRESHOLDS.potentialLeader.responsibility).toBeGreaterThanOrEqual(50);
    expect(ARCHETYPE_THRESHOLDS.potentialLeader.initiative).toBeGreaterThanOrEqual(50);
  });

  it('technicalExecutor thresholds are plausible (tech ≥ 50, responsibility ≥ 50)', () => {
    expect(ARCHETYPE_THRESHOLDS.technicalExecutor.technical).toBeGreaterThanOrEqual(50);
    expect(ARCHETYPE_THRESHOLDS.technicalExecutor.responsibility).toBeGreaterThanOrEqual(50);
  });

  it('adminCoordinator leadershipMin < leadershipMax', () => {
    expect(ARCHETYPE_THRESHOLDS.adminCoordinator.leadershipMin).toBeLessThan(
      ARCHETYPE_THRESHOLDS.adminCoordinator.leadershipMax,
    );
  });

  it('universalPotential.minAllAxes is between 50 and 100', () => {
    expect(ARCHETYPE_THRESHOLDS.universalPotential.minAllAxes).toBeGreaterThanOrEqual(50);
    expect(ARCHETYPE_THRESHOLDS.universalPotential.minAllAxes).toBeLessThanOrEqual(100);
  });

  it('universalPotential.maxSpread is a positive number less than 100', () => {
    expect(ARCHETYPE_THRESHOLDS.universalPotential.maxSpread).toBeGreaterThan(0);
    expect(ARCHETYPE_THRESHOLDS.universalPotential.maxSpread).toBeLessThan(100);
  });
});

// ---------------------------------------------------------------------------
// VALIDITY_THRESHOLDS — ordering guarantees
// ---------------------------------------------------------------------------
describe('VALIDITY_THRESHOLDS ordering', () => {
  it('lie.reliable < lie.unreliable', () => {
    expect(VALIDITY_THRESHOLDS.lie.reliable).toBeLessThan(VALIDITY_THRESHOLDS.lie.unreliable);
  });

  it('consistency.reliable < consistency.unreliable', () => {
    expect(VALIDITY_THRESHOLDS.consistency.reliable).toBeLessThan(
      VALIDITY_THRESHOLDS.consistency.unreliable,
    );
  });

  it('attention.reliable > attention.unreliable (higher score = more reliable)', () => {
    expect(VALIDITY_THRESHOLDS.attention.reliable).toBeGreaterThan(
      VALIDITY_THRESHOLDS.attention.unreliable,
    );
  });

  it('speed.uniformityFraction is between 0 and 1 (exclusive)', () => {
    expect(VALIDITY_THRESHOLDS.speed.uniformityFraction).toBeGreaterThan(0);
    expect(VALIDITY_THRESHOLDS.speed.uniformityFraction).toBeLessThan(1);
  });

  it('speed.minMedianMs is a positive number', () => {
    expect(VALIDITY_THRESHOLDS.speed.minMedianMs).toBeGreaterThan(0);
  });

  it('speed.minLikertCount is a positive integer', () => {
    expect(VALIDITY_THRESHOLDS.speed.minLikertCount).toBeGreaterThan(0);
    expect(Number.isInteger(VALIDITY_THRESHOLDS.speed.minLikertCount)).toBe(true);
  });

  it('lie.flagValue is between 1 and 5 (valid Likert range)', () => {
    expect(VALIDITY_THRESHOLDS.lie.flagValue).toBeGreaterThanOrEqual(1);
    expect(VALIDITY_THRESHOLDS.lie.flagValue).toBeLessThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// TECH_QUALIFICATION_WEIGHTS — structural invariants
// ---------------------------------------------------------------------------
describe('TECH_QUALIFICATION_WEIGHTS invariants', () => {
  it('verification.partialRatio < verification.verifiedRatio', () => {
    expect(TECH_QUALIFICATION_WEIGHTS.verification.partialRatio).toBeLessThan(
      TECH_QUALIFICATION_WEIGHTS.verification.verifiedRatio,
    );
  });

  it('verification ratios are between 0 and 1', () => {
    expect(TECH_QUALIFICATION_WEIGHTS.verification.partialRatio).toBeGreaterThan(0);
    expect(TECH_QUALIFICATION_WEIGHTS.verification.verifiedRatio).toBeLessThan(1);
  });

  it('maxRaw equals sum of all basePoints + heavy driving bonus', () => {
    const baseSum = Object.values(TECH_QUALIFICATION_WEIGHTS.basePoints).reduce(
      (acc, v) => acc + v,
      0,
    );
    const maxDriving = TECH_QUALIFICATION_WEIGHTS.driving.heavy;
    expect(TECH_QUALIFICATION_WEIGHTS.maxRaw).toBe(baseSum + maxDriving);
  });

  it('driving.other < driving.heavy', () => {
    expect(TECH_QUALIFICATION_WEIGHTS.driving.other).toBeLessThan(
      TECH_QUALIFICATION_WEIGHTS.driving.heavy,
    );
  });
});

// ---------------------------------------------------------------------------
// AXIS_WEIGHTS — sanity checks
// ---------------------------------------------------------------------------
describe('AXIS_WEIGHTS sanity', () => {
  it('leadership.largeTeamBonus is a positive number ≤ 20', () => {
    expect(AXIS_WEIGHTS.leadership.largeTeamBonus).toBeGreaterThan(0);
    expect(AXIS_WEIGHTS.leadership.largeTeamBonus).toBeLessThanOrEqual(20);
  });
});

// ---------------------------------------------------------------------------
// assignArchetype — integration with calibration constants
// ---------------------------------------------------------------------------
describe('assignArchetype uses calibration constants correctly', () => {
  const {
    potentialLeader,
    universalPotential,
    weakAxis,
    strongAxis,
    weakAxisCountForNotSuitable,
    strongAxisCountForDataUnreliable,
  } = ARCHETYPE_THRESHOLDS;

  it('returns "potential-leader" when all leader thresholds are exceeded by 2', () => {
    const profile = makeProfile({
      leadership: potentialLeader.leadership + 2,
      responsibility: potentialLeader.responsibility + 2,
      initiative: potentialLeader.initiative + 2,
      technical: strongAxis,
      learnability: strongAxis,
      cognitive: strongAxis,
    });
    expect(assignArchetype(profile, 'reliable')).toBe('potential-leader');
  });

  it('returns "basic-executor" when all axes are 1 below universalPotential.minAllAxes', () => {
    const score = universalPotential.minAllAxes - 1;
    const profile = makeProfile({
      leadership: score,
      responsibility: score,
      initiative: score,
      technical: score,
      learnability: score,
      cognitive: score,
    });
    // All scores below minAllAxes → fails universal-potential; no positive archetype met
    expect(assignArchetype(profile, 'reliable')).toBe('basic-executor');
  });

  it('returns "not-suitable" when validity is reliable and weakAxisCountForNotSuitable axes are below weakAxis', () => {
    const weakScore = weakAxis - 1;
    const strongScore = strongAxis + 30;
    const profile = makeProfile({
      leadership: weakScore,
      responsibility: weakScore,
      initiative: weakAxisCountForNotSuitable === 3 ? weakScore : strongScore,
      technical: strongScore,
      learnability: strongScore,
      cognitive: strongScore,
    });
    expect(assignArchetype(profile, 'reliable')).toBe('not-suitable');
  });

  it('returns "data-unreliable" when validity is unreliable and ≥ strongAxisCountForDataUnreliable axes are strong', () => {
    const strongScore = strongAxis + 10;
    const weakScore = weakAxis - 1;
    // Build exactly strongAxisCountForDataUnreliable strong axes, rest weak
    const scores = [
      ...Array<number>(strongAxisCountForDataUnreliable).fill(strongScore),
      ...Array<number>(6 - strongAxisCountForDataUnreliable).fill(weakScore),
    ];
    const profile = makeProfile({
      leadership: scores[0]!,
      responsibility: scores[1]!,
      initiative: scores[2]!,
      technical: scores[3]!,
      learnability: scores[4]!,
      cognitive: scores[5]!,
    });
    expect(assignArchetype(profile, 'unreliable')).toBe('data-unreliable');
  });

  it('returns "not-suitable" when validity is unreliable and fewer than strongAxisCountForDataUnreliable strong axes', () => {
    const weakScore = weakAxis - 1;
    const strongScore = strongAxis + 10;
    // Only 1 axis above strongAxis → below threshold for data-unreliable
    const profile = makeProfile({
      leadership: weakScore,
      responsibility: weakScore,
      initiative: weakScore,
      technical: weakScore,
      learnability: weakScore,
      cognitive: strongScore,
    });
    expect(assignArchetype(profile, 'unreliable')).toBe('not-suitable');
  });
});

// ---------------------------------------------------------------------------
// computeOverallValidity — integration with calibration constants
// ---------------------------------------------------------------------------
describe('computeOverallValidity uses calibration constants correctly', () => {
  const { lie, consistency, attention } = VALIDITY_THRESHOLDS;

  it('returns "unreliable" when lie.score exceeds unreliable threshold by 1', () => {
    expect(
      computeOverallValidity({ score: lie.unreliable + 1 }, { score: 0 }, { score: 100 }, false),
    ).toBe('unreliable');
  });

  it('returns "unreliable" when consistency.score equals unreliable threshold', () => {
    expect(
      computeOverallValidity(
        { score: 0 },
        { score: consistency.unreliable },
        { score: 100 },
        false,
      ),
    ).toBe('unreliable');
  });

  it('returns "unreliable" when attention.score is 1 below unreliable threshold', () => {
    expect(
      computeOverallValidity(
        { score: 0 },
        { score: 0 },
        { score: attention.unreliable - 1 },
        false,
      ),
    ).toBe('unreliable');
  });

  it('returns "unreliable" when speedFlag is true regardless of other scores', () => {
    expect(computeOverallValidity({ score: 0 }, { score: 0 }, { score: 100 }, true)).toBe(
      'unreliable',
    );
  });

  it('returns "reliable" when all scores are 1 inside their reliable boundaries', () => {
    expect(
      computeOverallValidity(
        { score: lie.reliable - 1 },
        { score: consistency.reliable - 1 },
        { score: attention.reliable + 1 },
        false,
      ),
    ).toBe('reliable');
  });

  it('returns "questionable" when lie is between reliable and unreliable thresholds', () => {
    // lie.reliable < midLie < lie.unreliable, attention at exactly unreliable threshold (not below)
    const midLie = lie.reliable + 1;
    expect(
      computeOverallValidity(
        { score: midLie },
        { score: 0 },
        { score: attention.unreliable },
        false,
      ),
    ).toBe('questionable');
  });
});
