'use client';

import { useSurveyStore } from '@/lib/storage/survey-store';
import { isQuestionVisible } from '@/lib/survey/question-helpers';
import type { QuestionId, Answer } from '@/lib/types/survey';
import type { QuestionSection } from '@/lib/types/question-spec';
import { QuestionRenderer } from '../QuestionRenderer';
import qualificationsData from '@/data/questions/qualifications.json';

const sections = qualificationsData.sections as QuestionSection[];

/**
 * Renders the technical qualifications checklist for Block 1.
 * Handles multi-select driver categories and conditional sub-questions for each
 * critical qualification (demining, drone-piloting, radar-radiotech).
 */
export function QualificationsBlock() {
  const { recordAnswer } = useSurveyStore();
  const answers = useSurveyStore((s) => s.answers);

  const handleChange = (questionId: string, answer: Answer) => {
    recordAnswer(questionId as QuestionId, answer, null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold">Кваліфікації</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Вкажіть наявні кваліфікації та досвід. Питання, позначені зірочкою (*), обов&apos;язкові.
        </p>
      </div>

      {sections.map((section) => {
        const visibleQuestions = section.questions.filter((q) => isQuestionVisible(q, answers));
        if (visibleQuestions.length === 0) return null;
        return (
          <section
            key={section.id}
            aria-labelledby={`qual-section-${section.id}`}
            className="flex flex-col gap-4"
          >
            <h3 id={`qual-section-${section.id}`} className="text-base font-semibold">
              {section.titleUa}
            </h3>
            {visibleQuestions.map((question) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                answer={answers.get(question.id as QuestionId)?.answer}
                onChange={(ans) => handleChange(question.id, ans)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
