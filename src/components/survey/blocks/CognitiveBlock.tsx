'use client';

import { useSurveyStore } from '@/lib/storage/survey-store';
import type { QuestionId, Answer } from '@/lib/types/survey';
import type { CognitiveQuestion } from '@/lib/types/cognitive';
import type { QuestionSpec } from '@/lib/types/question-spec';
import { QuestionRenderer } from '../QuestionRenderer';
import cognitiveData from '@/data/questions/cognitive.json';

const questions = cognitiveData.questions as CognitiveQuestion[];

/** Adapts a CognitiveQuestion to the QuestionSpec interface for QuestionRenderer. */
function toQuestionSpec(q: CognitiveQuestion): QuestionSpec {
  return {
    id: q.id,
    type: 'single-choice',
    promptUa: q.promptUa,
    required: true,
    options: q.options,
  };
}

/**
 * Block 3 — Cognitive Proxy.
 * Renders indirect cognitive indicator questions as single-choice items.
 * No timers and no correct/incorrect feedback are shown to the respondent.
 * All answers are required before the caller's `onComplete` callback fires.
 */
export function CognitiveBlock() {
  const { recordAnswer } = useSurveyStore();
  const answers = useSurveyStore((s) => s.answers);

  const handleChange = (questionId: string, answer: Answer) => {
    recordAnswer(questionId as QuestionId, answer, null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Когнітивний профіль</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Відповідайте відповідно до того, як ви реально думаєте та дієте — правильних відповідей
          немає.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={toQuestionSpec(question)}
            answer={answers.get(question.id as QuestionId)?.answer}
            onChange={(ans) => handleChange(question.id, ans)}
          />
        ))}
      </div>
    </div>
  );
}

/** Returns true when every cognitive question has been answered. */
export function useAllCognitiveAnswered(): boolean {
  const answers = useSurveyStore((s) => s.answers);
  return questions.every((q) => answers.has(q.id as QuestionId));
}
