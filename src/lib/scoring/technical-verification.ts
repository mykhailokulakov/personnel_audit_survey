import type { QuestionId, AnswerRecord, TechQualification } from '../types/survey';
import type { QualificationVerificationResult, QualificationStatus } from './types';

/** Verification questions grouped by qualification. */
const VERIFICATION_QUESTIONS: Record<TechQualification, ReadonlyArray<string>> = {
  demining: ['ver_dem_01', 'ver_dem_02', 'ver_dem_03'],
  'drone-piloting': ['ver_dro_01', 'ver_dro_02', 'ver_dro_03'],
  'radar-radiotech': ['ver_rad_01', 'ver_rad_02', 'ver_rad_03'],
  driving: ['ver_drv_01', 'ver_drv_02', 'ver_drv_03'],
  other: [],
};

/** Correct option ids for each verification question. */
const CORRECT_OPTIONS: Record<string, string> = {
  ver_dem_01: 'ver_dem_01_a',
  ver_dem_02: 'ver_dem_02_b',
  ver_dem_03: 'ver_dem_03_a',
  ver_dro_01: 'ver_dro_01_c',
  ver_dro_02: 'ver_dro_02_b',
  ver_dro_03: 'ver_dro_03_c',
  ver_rad_01: 'ver_rad_01_c',
  ver_rad_02: 'ver_rad_02_c',
  ver_rad_03: 'ver_rad_03_b',
  ver_drv_01: 'ver_drv_01_c',
  ver_drv_02: 'ver_drv_02_b',
  ver_drv_03: 'ver_drv_03_c',
};

/** Question ids used to detect if a critical qualification was declared. */
const DECLARATION_QUESTION_IDS: Partial<Record<TechQualification, string>> = {
  demining: 'qual_demining_yn',
  'drone-piloting': 'qual_drone_piloting_yn',
  'radar-radiotech': 'qual_radar_radiotech_yn',
};

/** Returns true when the respondent declared the given qualification. */
function isDeclared(answers: Map<QuestionId, AnswerRecord>, qual: TechQualification): boolean {
  if (qual === 'driving') {
    const record = answers.get('qual_driving_categories' as QuestionId);
    return record?.answer.type === 'multi-choice' && record.answer.optionIds.length > 0;
  }
  if (qual === 'other') return false;
  const qid = DECLARATION_QUESTION_IDS[qual] ?? '';
  if (qid === '') return false;
  const record = answers.get(qid as QuestionId);
  return record?.answer.type === 'boolean' && record.answer.value === true;
}

/** Derives a coefficient (0.0, 0.5, 1.0) and status from correct/total counts. */
function deriveCoefficient(
  correctCount: number,
  totalCount: number,
): { coefficient: number; likelyFalseFlag: boolean; status: QualificationStatus } {
  if (totalCount === 0) {
    return { coefficient: 1.0, likelyFalseFlag: false, status: 'no-verification' };
  }
  const ratio = correctCount / totalCount;
  if (ratio >= 2 / 3) {
    return { coefficient: 1.0, likelyFalseFlag: false, status: 'verified' };
  }
  if (ratio >= 1 / 3) {
    return { coefficient: 0.5, likelyFalseFlag: false, status: 'partial' };
  }
  return { coefficient: 0.0, likelyFalseFlag: true, status: 'failed' };
}

/**
 * Computes verification results for all tracked qualifications.
 *
 * For each qualification the function checks:
 * - Whether it was declared in Block 1
 * - How many verification questions (Block 2) were answered correctly
 * - Derives a scoring coefficient: ≥ 66 % → 1.0, 33–66 % → 0.5, < 33 % → 0.0
 *
 * When a qualification has no verification questions answered (e.g. driving
 * when the verification block was skipped), the coefficient defaults to 1.0
 * and status is 'no-verification'.
 */
export function computeVerificationResults(
  answers: Map<QuestionId, AnswerRecord>,
): QualificationVerificationResult[] {
  const quals: TechQualification[] = [
    'demining',
    'drone-piloting',
    'radar-radiotech',
    'driving',
    'other',
  ];

  return quals.map((qual) => {
    const declared = isDeclared(answers, qual);

    if (!declared) {
      return {
        qualification: qual,
        declared: false,
        correctCount: 0,
        totalCount: 0,
        coefficient: 0.0,
        likelyFalseFlag: false,
        status: 'not-declared' as QualificationStatus,
      };
    }

    const verQids = VERIFICATION_QUESTIONS[qual];
    let correctCount = 0;
    let answeredCount = 0;

    for (const qid of verQids) {
      const record = answers.get(qid as QuestionId);
      if (!record || record.answer.type !== 'single-choice') continue;
      answeredCount++;
      if (record.answer.optionId === CORRECT_OPTIONS[qid]) correctCount++;
    }

    const { coefficient, likelyFalseFlag, status } = deriveCoefficient(correctCount, answeredCount);

    return {
      qualification: qual,
      declared: true,
      correctCount,
      totalCount: answeredCount,
      coefficient,
      likelyFalseFlag,
      status,
    };
  });
}
