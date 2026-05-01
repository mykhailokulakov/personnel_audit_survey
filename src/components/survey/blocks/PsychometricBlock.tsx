'use client';

import { useMemo } from 'react';
import { useSurveyStore } from '@/lib/storage/survey-store';
import type { QuestionId, LikertValue } from '@/lib/types/survey';
import type { PsychometricQuestion } from '@/lib/types/psychometric';
import { LikertScale } from '../LikertScale';
import { shuffleAndSeparatePairs } from '@/lib/storage/shuffle';
import psychometricData from '@/data/questions/psychometric.json';

const allQuestions = psychometricData.questions as PsychometricQuestion[];

/**
 * Block 4 — Psychometric.
 * Renders a 5-point Likert scale for each question.
 * Questions are shuffled in a deterministic order derived from the respondent code,
 * so the order differs between respondents but is reproducible for the same code.
 * Consistency-pair questions are never shown adjacent to each other.
 */
export function PsychometricBlock() {
  const { recordAnswer } = useSurveyStore();
  const answers = useSurveyStore((s) => s.answers);
  const code = useSurveyStore((s) => s.code);

  const orderedQuestions = useMemo(
    () => shuffleAndSeparatePairs(allQuestions, code || 'default'),
    [code],
  );

  const handleChange = (questionId: string, value: LikertValue) => {
    recordAnswer(questionId as QuestionId, { type: 'likert', value }, null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Психометричний профіль</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Оцініть, наскільки кожне твердження відповідає вашій поведінці та переконанням.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {orderedQuestions.map((question) => {
          const record = answers.get(question.id as QuestionId);
          const currentValue = record?.answer.type === 'likert' ? record.answer.value : undefined;
          return (
            <LikertScale
              key={question.id}
              id={question.id}
              promptUa={question.promptUa}
              value={currentValue}
              onChange={(v) => handleChange(question.id, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Returns true when every psychometric question has been answered. */
export function useAllPsychometricAnswered(): boolean {
  const answers = useSurveyStore((s) => s.answers);
  return allQuestions.every((q) => answers.has(q.id as QuestionId));
}
