import type { ProfileAxis } from '../types/axes';
import type { AxisScore, Archetype, ValidityLevel } from './types';

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
  const weakAxesCount = scores.filter((s) => s < 35).length;

  if (validity === 'unreliable') {
    // Distinguish "strong profile tainted by invalid data" from genuinely unfit
    const strongAxesCount = scores.filter((s) => s >= 50).length;
    if (strongAxesCount >= 4) return 'data-unreliable';
    return 'not-suitable';
  }

  if (weakAxesCount >= 3) return 'not-suitable';

  if (leadership >= 70 && responsibility >= 65 && initiative >= 60) {
    return 'potential-leader';
  }

  if (technical >= 60 && responsibility >= 60 && leadership < 60) {
    return 'technical-executor';
  }

  if (
    responsibility >= 65 &&
    learnability >= 55 &&
    leadership >= 40 &&
    leadership <= 65 &&
    technical < 40
  ) {
    return 'admin-coordinator';
  }

  if (scores.every((s) => s >= 55) && maxScore - minScore < 25) {
    return 'universal-potential';
  }

  return 'basic-executor';
}
