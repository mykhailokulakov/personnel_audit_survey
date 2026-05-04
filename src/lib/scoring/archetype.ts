import type { ProfileAxis } from '../types/axes';
import type { AxisScore, Archetype, ValidityLevel } from './types';
import { ARCHETYPE_THRESHOLDS } from './calibration';

function score(profile: AxisScore[], axis: ProfileAxis): number {
  return profile.find((a) => a.axis === axis)?.score ?? 0;
}

/**
 * Assigns one of seven archetypes based on the six-axis profile and the
 * overall validity level.
 *
 * Cascade order:
 * 1. Validity-critical checks (unreliable → data-unreliable or not-suitable)
 * 2. Positive archetypes in priority order (potential-leader → … → basic-executor)
 *
 * Thresholds are calibrated constants that can be adjusted for future tuning.
 */
export function assignArchetype(profile: AxisScore[], validity: ValidityLevel): Archetype {
  const leadership = score(profile, 'leadership');
  const responsibility = score(profile, 'responsibility');
  const initiative = score(profile, 'initiative');
  const technical = score(profile, 'technical-readiness');
  const learnability = score(profile, 'learnability');

  const scores = profile.map((a) => a.score);
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const weakAxesCount = scores.filter((s) => s < ARCHETYPE_THRESHOLDS.weakAxis).length;

  if (validity === 'unreliable') {
    // Distinguish "strong profile tainted by invalid data" from genuinely unfit
    const strongAxesCount = scores.filter((s) => s >= ARCHETYPE_THRESHOLDS.strongAxis).length;
    if (strongAxesCount >= ARCHETYPE_THRESHOLDS.strongAxisCountForDataUnreliable)
      return 'data-unreliable';
    return 'not-suitable';
  }

  if (weakAxesCount >= ARCHETYPE_THRESHOLDS.weakAxisCountForNotSuitable) return 'not-suitable';

  if (
    leadership >= ARCHETYPE_THRESHOLDS.potentialLeader.leadership &&
    responsibility >= ARCHETYPE_THRESHOLDS.potentialLeader.responsibility &&
    initiative >= ARCHETYPE_THRESHOLDS.potentialLeader.initiative
  ) {
    return 'potential-leader';
  }

  if (
    technical >= ARCHETYPE_THRESHOLDS.technicalExecutor.technical &&
    responsibility >= ARCHETYPE_THRESHOLDS.technicalExecutor.responsibility &&
    leadership < ARCHETYPE_THRESHOLDS.technicalExecutor.leadershipMax
  ) {
    return 'technical-executor';
  }

  if (
    responsibility >= ARCHETYPE_THRESHOLDS.adminCoordinator.responsibility &&
    learnability >= ARCHETYPE_THRESHOLDS.adminCoordinator.learnability &&
    leadership >= ARCHETYPE_THRESHOLDS.adminCoordinator.leadershipMin &&
    leadership <= ARCHETYPE_THRESHOLDS.adminCoordinator.leadershipMax &&
    technical < ARCHETYPE_THRESHOLDS.adminCoordinator.technicalMax
  ) {
    return 'admin-coordinator';
  }

  if (
    scores.every((s) => s >= ARCHETYPE_THRESHOLDS.universalPotential.minAllAxes) &&
    maxScore - minScore < ARCHETYPE_THRESHOLDS.universalPotential.maxSpread
  ) {
    return 'universal-potential';
  }

  return 'basic-executor';
}
