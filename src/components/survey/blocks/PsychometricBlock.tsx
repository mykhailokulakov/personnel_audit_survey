'use client';

import { useMemo } from 'react';
import { useSurveyStore } from '@/lib/storage/survey-store';
import type { QuestionId, LikertValue } from '@/lib/types/survey';
import type { PsychometricBlockItem } from '@/lib/types/psychometric';
import { LikertScale } from '../LikertScale';
import { AttentionCheck } from '../AttentionCheck';
import { buildPsychometricBlockItems } from '@/lib/storage/build-block-questions';
import psychometricData from '@/data/questions/psychometric.json';
import attentionChecksData from '@/data/questions/attention-checks.json';

/**
 * Block 4 — Psychometric.
 * Renders a 5-point Likert scale for each question.
 * Questions are shuffled in a deterministic order derived from the respondent code,
 * so the order differs between respondents but is reproducible for the same code.
 * Consistency-pair questions are never shown adjacent to each other.
 * Two attention-check items are interspersed transparently in the list.
 */
export function PsychometricBlock() {
  const { recordAnswer } = useSurveyStore();
  const answers = useSurveyStore((s) => s.answers);
  const code = useSurveyStore((s) => s.code);

  const orderedItems: PsychometricBlockItem[] = useMemo(
    () => buildPsychometricBlockItems(code || 'default'),
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
        {orderedItems.map((item) => {
          const record = answers.get(item.id as QuestionId);
          const currentValue = record?.answer.type === 'likert' ? record.answer.value : undefined;

          if (item.isAttentionCheck) {
            return (
              <AttentionCheck
                key={item.id}
                id={item.id}
                promptUa={item.promptUa}
                value={currentValue}
                onChange={(v) => handleChange(item.id, v)}
              />
            );
          }

          return (
            <LikertScale
              key={item.id}
              id={item.id}
              promptUa={item.promptUa}
              value={currentValue}
              onChange={(v) => handleChange(item.id, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

const allQuestionIds = [
  ...psychometricData.questions.map((q) => q.id),
  ...attentionChecksData.psychometricChecks.map((ac) => ac.id),
];

/** Returns true when every psychometric question (including attention checks) has been answered. */
export function useAllPsychometricAnswered(): boolean {
  const answers = useSurveyStore((s) => s.answers);
  return allQuestionIds.every((id) => answers.has(id as QuestionId));
}
