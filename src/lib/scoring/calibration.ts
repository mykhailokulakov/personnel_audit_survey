/**
 * Single source of truth for all scoring calibration constants.
 *
 * Changing values here propagates through the entire scoring engine without
 * touching any business logic. After any change, run `pnpm validate` to
 * confirm all tests still pass.
 *
 * See docs/CALIBRATION_GUIDE.md for how to tune these values on real data.
 */

/**
 * Thresholds used by `assignArchetype()` to classify a respondent profile
 * into one of seven archetypes.
 */
export const ARCHETYPE_THRESHOLDS = {
  /** A score below this value marks the axis as "weak". */
  weakAxis: 35,
  /** When ≥ this many axes are weak the respondent is classified not-suitable. */
  weakAxisCountForNotSuitable: 3,
  /** A score ≥ this value marks the axis as "strong" (used for data-unreliable). */
  strongAxis: 50,
  /** When validity is unreliable but ≥ this many axes are strong → data-unreliable. */
  strongAxisCountForDataUnreliable: 4,

  potentialLeader: {
    leadership: 70,
    responsibility: 65,
    initiative: 60,
  },

  technicalExecutor: {
    technical: 60,
    responsibility: 60,
    leadershipMax: 60,
  },

  adminCoordinator: {
    responsibility: 65,
    learnability: 55,
    leadershipMin: 40,
    leadershipMax: 65,
    technicalMax: 40,
  },

  universalPotential: {
    /** All axes must score at least this value. */
    minAllAxes: 55,
    /** Difference between highest and lowest axis must be less than this. */
    maxSpread: 25,
  },
} as const;

/**
 * Thresholds used by the validity scoring pipeline.
 */
export const VALIDITY_THRESHOLDS = {
  lie: {
    /** Likert value at or above this is considered a social-desirability flag. */
    flagValue: 4,
    /** Lie score ≥ this triggers "unreliable". */
    unreliable: 60,
    /** Lie score ≤ this is required for "reliable". */
    reliable: 30,
  },
  consistency: {
    /** Consistency score ≥ this triggers "unreliable". */
    unreliable: 60,
    /** Consistency score ≤ this is required for "reliable". */
    reliable: 30,
  },
  attention: {
    /** Attention score < this triggers "unreliable". */
    unreliable: 50,
    /** Attention score ≥ this is required for "reliable". */
    reliable: 75,
  },
  speed: {
    /** Median response time (ms) below this triggers the speed flag. */
    minMedianMs: 3_000,
    /** Fraction of identical Likert values that triggers the uniformity flag. */
    uniformityFraction: 0.8,
    /** Minimum number of Likert answers before uniformity check is applied. */
    minLikertCount: 5,
  },
} as const;

/**
 * Point values and verification ratios for the technical-readiness axis.
 */
export const TECH_QUALIFICATION_WEIGHTS = {
  basePoints: {
    demining: 25,
    'drone-piloting': 25,
    'radar-radiotech': 25,
  } as Record<string, number>,

  driving: {
    /** Points for Category C or D (heavy vehicle / bus). */
    heavy: 10,
    /** Points for any other driving category. */
    other: 7,
  },

  /** Denominator used to normalise the raw sum to 0–100. */
  maxRaw: 85,

  verification: {
    /** Fraction of correct answers required to assign coefficient 1.0. */
    verifiedRatio: 2 / 3,
    /** Fraction of correct answers required to assign coefficient 0.5. */
    partialRatio: 1 / 3,
  },
} as const;

/**
 * Per-axis scoring weights and bonuses that cannot be derived from question data.
 */
export const AXIS_WEIGHTS = {
  leadership: {
    /** Bonus score added when the respondent reported managing > 10 people. */
    largeTeamBonus: 5,
  },
} as const;
