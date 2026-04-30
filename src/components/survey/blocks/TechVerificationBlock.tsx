'use client';

import { useState, useMemo } from 'react';
import { useSurveyStore, useDeclaredCriticalQualifications } from '@/lib/storage/survey-store';
import type { QuestionId } from '@/lib/types/survey';
import type { VerificationQuestion } from '@/lib/types/verification';
import type { QuestionSpec } from '@/lib/types/question-spec';
import { QuestionRenderer } from '../QuestionRenderer';
import { Button } from '@/components/ui/button';
import verificationData from '@/data/questions/verification.json';

const allVerificationQuestions = verificationData.questions as VerificationQuestion[];

/** Adapts a VerificationQuestion to the QuestionSpec interface for QuestionRenderer. */
function toQuestionSpec(vq: VerificationQuestion): QuestionSpec {
  return {
    id: vq.id,
    type: 'single-choice',
    promptUa: vq.promptUa,
    required: true,
    options: vq.options.map((o) => ({ id: o.id, textUa: o.textUa })),
  };
}

type TechVerificationBlockProps = {
  onNext: () => void;
};

/**
 * Block 2 — Technical Verification.
 * Shows one question at a time for each declared critical qualification.
 * Does NOT reveal correct/incorrect answers to the respondent.
 * Records responseTimeMs per question for later scoring.
 */
export function TechVerificationBlock({ onNext }: TechVerificationBlockProps) {
  const declaredQuals = useDeclaredCriticalQualifications();
  const { recordAnswer } = useSurveyStore();
  const answers = useSurveyStore((s) => s.answers);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(() => Date.now());

  const verificationQuestions = useMemo(
    () =>
      declaredQuals.flatMap((qual) =>
        allVerificationQuestions.filter((q) => q.qualification === qual),
      ),
    [declaredQuals],
  );

  if (declaredQuals.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold">Технічна перевірка</h2>
          <p className="mt-2 text-muted-foreground">
            На основі ваших відповідей цей блок пропускається.
          </p>
        </div>
        <div className="mt-auto">
          <Button onClick={onNext}>Далі</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = verificationQuestions[currentIndex];
  if (!currentQuestion) return null;

  const currentAnswer = answers.get(currentQuestion.id as QuestionId);
  const isLastQuestion = currentIndex === verificationQuestions.length - 1;
  const allAnswered = verificationQuestions.every((q) => answers.has(q.id as QuestionId));

  const handleSelectOption = (optionId: string) => {
    recordAnswer(
      currentQuestion.id as QuestionId,
      { type: 'single-choice', optionId },
      questionStartTime,
    );
  };

  const handleNextQuestion = () => {
    setCurrentIndex((idx) => idx + 1);
    setQuestionStartTime(Date.now());
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Технічна перевірка</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Питання {currentIndex + 1} з {verificationQuestions.length}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <QuestionRenderer
          question={toQuestionSpec(currentQuestion)}
          answer={currentAnswer?.answer}
          onChange={(ans) => {
            if (ans.type === 'single-choice') {
              handleSelectOption(ans.optionId);
            }
          }}
        />
      </div>

      <div className="mt-auto flex justify-end gap-2">
        {currentAnswer && !isLastQuestion && (
          <Button variant="outline" onClick={handleNextQuestion}>
            Наступне питання
          </Button>
        )}
        {isLastQuestion && (
          <Button onClick={onNext} disabled={!allAnswered}>
            Далі
          </Button>
        )}
      </div>
    </div>
  );
}
