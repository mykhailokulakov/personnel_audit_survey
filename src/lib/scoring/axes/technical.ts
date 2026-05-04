import type { QuestionId, AnswerRecord } from '../../types/survey';
import type { QualificationVerificationResult } from '../types';
import { TECH_QUALIFICATION_WEIGHTS } from '../calibration';

/** Driving category ids that indicate heavy-vehicle competency (worth full 10 pts). */
const HEAVY_VEHICLE_CATS = new Set(['cat_C', 'cat_D']);

/**
 * Returns the driving base score (0–10) derived from declared licence categories.
 *
 * C or D category → 10 pts (heavy vehicle / bus proficiency).
 * Other categories → 7 pts.
 * No categories declared → 0.
 */
export function getDrivingBaseScore(answers: Map<QuestionId, AnswerRecord>): number {
  const record = answers.get('qual_driving_categories' as QuestionId);
  if (!record || record.answer.type !== 'multi-choice') return 0;
  const cats = record.answer.optionIds;
  if (cats.length === 0) return 0;
  return cats.some((c) => HEAVY_VEHICLE_CATS.has(c))
    ? TECH_QUALIFICATION_WEIGHTS.driving.heavy
    : TECH_QUALIFICATION_WEIGHTS.driving.other;
}

/**
 * Scores the technical-readiness axis using declared qualification points
 * multiplied by each qualification's verification coefficient.
 *
 * Formula:
 *   rawSum = Σ (basePoints[qual] × coefficient) + drivingBase × drivingCoefficient
 *   score  = round(rawSum / 85 × 100), capped at 100
 */
export function scoreTechnical(
  answers: Map<QuestionId, AnswerRecord>,
  qualifications: QualificationVerificationResult[],
): number {
  let rawSum = 0;

  for (const qual of qualifications) {
    if (!qual.declared) continue;
    const base = TECH_QUALIFICATION_WEIGHTS.basePoints[qual.qualification];
    if (base !== undefined) {
      rawSum += base * qual.coefficient;
    }
  }

  const drivingBase = getDrivingBaseScore(answers);
  if (drivingBase > 0) {
    const drivingQual = qualifications.find((q) => q.qualification === 'driving');
    const coeff = drivingQual?.coefficient ?? 1.0;
    rawSum += drivingBase * coeff;
  }

  return Math.min(100, Math.round((rawSum / TECH_QUALIFICATION_WEIGHTS.maxRaw) * 100));
}
