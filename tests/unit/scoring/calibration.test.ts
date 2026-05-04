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
  it('returns "potential-leader" when leadership ≥ 70, responsibility ≥ 65, initiative ≥ 60', () => {
    const profile = makeProfile({
      leadership: 72,
      responsibility: 67,
      initiative: 62,
      technical: 50,
      learnability: 50,
      cognitive: 50,
    });
    expect(assignArchetype(profile, 'reliable')).toBe('potential-leader');
  });

  it('returns "basic-executor" when all axes are 50 (fails universal-potential minAllAxes=55)', () => {
    const profile = makeProfile({
      leadership: 50,
      responsibility: 50,
      initiative: 50,
      technical: 50,
      learnability: 50,
      cognitive: 50,
    });
    // All scores are 50, which is below universalPotential.minAllAxes (55),
    // and none of the positive archetype thresholds are met → basic-executor
    expect(assignArchetype(profile, 'reliable')).toBe('basic-executor');
  });

  it('returns "not-suitable" when validity is reliable but ≥ 3 axes are weak (< 35)', () => {
    const profile = makeProfile({
      leadership: 30,
      responsibility: 30,
      initiative: 30,
      technical: 80,
      learnability: 80,
      cognitive: 80,
    });
    expect(assignArchetype(profile, 'reliable')).toBe('not-suitable');
  });

  it('returns "data-unreliable" when validity is unreliable and ≥ 4 axes are strong (≥ 50)', () => {
    const profile = makeProfile({
      leadership: 60,
      responsibility: 60,
      initiative: 60,
      technical: 60,
      learnability: 30,
      cognitive: 30,
    });
    expect(assignArchetype(profile, 'unreliable')).toBe('data-unreliable');
  });

  it('returns "not-suitable" when validity is unreliable and fewer than 4 strong axes', () => {
    const profile = makeProfile({
      leadership: 30,
      responsibility: 30,
      initiative: 30,
      technical: 30,
      learnability: 30,
      cognitive: 60,
    });
    expect(assignArchetype(profile, 'unreliable')).toBe('not-suitable');
  });
});

// ---------------------------------------------------------------------------
// computeOverallValidity — integration with calibration constants
// ---------------------------------------------------------------------------
describe('computeOverallValidity uses calibration constants correctly', () => {
  it('returns "unreliable" when lie.score ≥ unreliable threshold (61 ≥ 60)', () => {
    expect(computeOverallValidity({ score: 61 }, { score: 0 }, { score: 100 }, false)).toBe(
      'unreliable',
    );
  });

  it('returns "unreliable" when consistency.score ≥ unreliable threshold', () => {
    expect(computeOverallValidity({ score: 0 }, { score: 60 }, { score: 100 }, false)).toBe(
      'unreliable',
    );
  });

  it('returns "unreliable" when attention.score < unreliable threshold (49 < 50)', () => {
    expect(computeOverallValidity({ score: 0 }, { score: 0 }, { score: 49 }, false)).toBe(
      'unreliable',
    );
  });

  it('returns "unreliable" when speedFlag is true regardless of other scores', () => {
    expect(computeOverallValidity({ score: 0 }, { score: 0 }, { score: 100 }, true)).toBe(
      'unreliable',
    );
  });

  it('returns "reliable" when all scores meet reliable thresholds (lie ≤ 30, consistency ≤ 30, attention ≥ 75)', () => {
    expect(computeOverallValidity({ score: 29 }, { score: 29 }, { score: 76 }, false)).toBe(
      'reliable',
    );
  });

  it('returns "questionable" when scores are between unreliable and reliable thresholds', () => {
    // lie=40 is > reliable(30) but < unreliable(60), attention=60 is ≥ unreliable(50)
    expect(computeOverallValidity({ score: 40 }, { score: 0 }, { score: 60 }, false)).toBe(
      'questionable',
    );
  });
});
