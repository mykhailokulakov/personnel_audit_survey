import type { ProfileAxis } from './axes';

/** Behavior pattern category for an SJT response option. */
export type SJTBehaviorType = 'passive' | 'social-desirable' | 'impulsive' | 'mature';

/** A single response option within an SJT scenario. */
export type SJTOption = {
  id: string;
  textUa: string;
  behaviorType: SJTBehaviorType;
  /**
   * Scoring contribution:
   * passive → 0, social-desirable → 1, impulsive → 0, mature → 3
   */
  score: number;
};

/** A single SJT scenario presented to the respondent. */
export type SJTScenario = {
  id: string;
  /** Profile axes this scenario primarily assesses. */
  axesTested: ProfileAxis[];
  promptUa: string;
  /** Exactly 4 options, one per behavior type. */
  options: SJTOption[];
};

/**
 * An SJT scenario as it appears in the merged block list.
 * Regular scenarios have isAttentionCheck=false; attention-check scenarios have isAttentionCheck=true
 * and a non-null target score (always 3 — the mature option must be chosen).
 */
export type ScenariosBlockItem = SJTScenario & {
  isAttentionCheck: boolean;
  attentionCheckTarget: number | null;
};

export type SJTScenarioBank = {
  scenarios: SJTScenario[];
};
