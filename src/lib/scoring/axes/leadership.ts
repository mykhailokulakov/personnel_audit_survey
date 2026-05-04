import type { QuestionId, AnswerRecord } from '../../types/survey';
import { getLikertValue, getSjtScore } from './_helpers';
import { AXIS_WEIGHTS } from '../calibration';

/** Psychometric questions for the leadership axis. */
const PSYCH_LEADERSHIP: ReadonlyArray<{ id: string; reversed: boolean; weight: number }> = [
  { id: 'psych_l01', reversed: false, weight: 1.0 },
  { id: 'psych_l02', reversed: false, weight: 1.0 },
  { id: 'psych_l03', reversed: false, weight: 1.0 },
  { id: 'psych_l04', reversed: true, weight: 1.0 },
  { id: 'psych_l05', reversed: true, weight: 1.0 },
  { id: 'psych_l06', reversed: false, weight: 1.0 },
];

/** SJT scenarios contributing to leadership (scenarios 1, 4, 5, 6). */
const SJT_LEADERSHIP: ReadonlyArray<{ id: string; weight: number }> = [
  { id: 'sjt_01', weight: 2.0 },
  { id: 'sjt_04', weight: 2.0 },
  { id: 'sjt_05', weight: 2.0 },
  { id: 'sjt_06', weight: 2.0 },
];

/** Team-size options in Block 1 indicating > 10 direct reports. */
const LARGE_TEAM_OPTIONS = new Set(['team_11_30', 'team_gt30']);

const MAX_PSYCH = 6 * 5 * 1.0; // 6 questions × max Likert 5 × weight 1.0 = 30
const MAX_SJT = 4 * 3 * 2.0; // 4 scenarios × max score 3 × weight 2.0 = 24
const MAX_LEADERSHIP_BASE = MAX_PSYCH + MAX_SJT; // 54

/**
 * Scores the leadership axis combining psychometric (Block 4), scenario
 * (Block 5, scenarios 1, 4, 5 & 6) and Block 1 management experience.
 *
 * A +5 bonus is added (capped at 100) when the respondent reported leading
 * more than 10 people (basic_team_size = team_11_30 or team_gt30).
 */
export function scoreLeadership(answers: Map<QuestionId, AnswerRecord>): number {
  let rawSum = 0;

  for (const { id, reversed, weight } of PSYCH_LEADERSHIP) {
    const value = getLikertValue(answers, id);
    if (value === null) continue;
    rawSum += (reversed ? 6 - value : value) * weight;
  }

  for (const { id, weight } of SJT_LEADERSHIP) {
    rawSum += getSjtScore(answers, id) * weight;
  }

  const base = Math.round((rawSum / MAX_LEADERSHIP_BASE) * 100);

  const teamSizeRecord = answers.get('basic_team_size' as QuestionId);
  const hasLargeTeam =
    teamSizeRecord?.answer.type === 'single-choice' &&
    LARGE_TEAM_OPTIONS.has(teamSizeRecord.answer.optionId);

  return Math.min(100, base + (hasLargeTeam ? AXIS_WEIGHTS.leadership.largeTeamBonus : 0));
}
