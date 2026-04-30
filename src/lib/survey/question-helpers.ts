import type { Answer, AnswerRecord, QuestionId, TechQualification } from '../types/survey';
import type { ConditionalOn, QuestionSection, QuestionSpec } from '../types/question-spec';

/**
 * Evaluates whether a conditional display rule is satisfied given the current answer map.
 * Returns true when the condition passes (question should be shown).
 */
export function evaluateCondition(
  condition: ConditionalOn,
  answers: Map<QuestionId, AnswerRecord>,
): boolean {
  const record = answers.get(condition.questionId as QuestionId);
  if (!record) return false;
  const ans: Answer = record.answer;

  if ('value' in condition) {
    return ans.type === 'boolean' && ans.value === condition.value;
  }
  if ('optionId' in condition) {
    return ans.type === 'single-choice' && ans.optionId === condition.optionId;
  }
  if ('notEmpty' in condition) {
    return ans.type === 'multi-choice' && ans.optionIds.length > 0;
  }
  if ('includes' in condition) {
    return ans.type === 'multi-choice' && ans.optionIds.includes(condition.includes);
  }
  return false;
}

/**
 * Returns true when the given question should be visible to the respondent,
 * taking conditional display rules into account.
 */
export function isQuestionVisible(
  question: QuestionSpec,
  answers: Map<QuestionId, AnswerRecord>,
): boolean {
  if (!question.conditionalOn) return true;
  return evaluateCondition(question.conditionalOn, answers);
}

/**
 * Returns true when all required, visible questions in the provided sections
 * have a recorded answer.
 */
export function areRequiredQuestionsAnswered(
  sections: QuestionSection[],
  answers: Map<QuestionId, AnswerRecord>,
): boolean {
  return sections.every((section) =>
    section.questions.every((question) => {
      if (!isQuestionVisible(question, answers)) return true;
      if (question.required !== true) return true;
      return answers.has(question.id as QuestionId);
    }),
  );
}

/**
 * IDs of the yes/no declaration questions for the three critical qualifications.
 * Used to derive which verification questions to show in Block 2.
 */
export const CRITICAL_QUAL_QUESTION_IDS: Readonly<Record<TechQualification, string>> = {
  demining: 'qual_demining_yn',
  'drone-piloting': 'qual_drone_piloting_yn',
  'radar-radiotech': 'qual_radar_radiotech_yn',
  driving: '',
  other: '',
};

/**
 * Derives the list of critical TechQualifications declared by the respondent.
 * A qualification is considered declared when the corresponding boolean answer is true.
 */
export function getDeclaredCriticalQualifications(
  answers: Map<QuestionId, AnswerRecord>,
): TechQualification[] {
  const criticalQuals: TechQualification[] = ['demining', 'drone-piloting', 'radar-radiotech'];
  return criticalQuals.filter((qual) => {
    const qid = CRITICAL_QUAL_QUESTION_IDS[qual];
    const record = answers.get(qid as QuestionId);
    return record?.answer.type === 'boolean' && record.answer.value === true;
  });
}
