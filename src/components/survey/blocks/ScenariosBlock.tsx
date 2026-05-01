'use client';

import { useState, useMemo } from 'react';
import { useSurveyStore } from '@/lib/storage/survey-store';
import { buildScenariosBlockItems } from '@/lib/storage/build-block-questions';
import type { QuestionId } from '@/lib/types/survey';
import type { ScenariosBlockItem } from '@/lib/types/sjt';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';

type ScenariosBlockProps = {
  onNext: () => void;
};

/**
 * Block 5 — SJT (Situational Judgment).
 * Renders scenarios one at a time, each on its own screen.
 * Attention-check scenarios are interspersed and look identical to regular ones.
 * Navigation back is intentionally absent (business requirement).
 */
export function ScenariosBlock({ onNext }: ScenariosBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { recordAnswer } = useSurveyStore();
  const answers = useSurveyStore((s) => s.answers);
  const code = useSurveyStore((s) => s.code);

  const scenarios: ScenariosBlockItem[] = useMemo(
    () => buildScenariosBlockItems(code || 'default'),
    [code],
  );

  const current = scenarios[currentIndex];
  if (!current) return null;

  const currentAnswer = answers.get(current.id as QuestionId);
  const selectedOptionId =
    currentAnswer?.answer.type === 'single-choice' ? currentAnswer.answer.optionId : undefined;
  const hasAnswer = selectedOptionId !== undefined;
  const isLast = currentIndex === scenarios.length - 1;

  const handleSelect = (optionId: string) => {
    recordAnswer(current.id as QuestionId, { type: 'single-choice', optionId }, null);
  };

  const handleAdvance = () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Ситуаційні завдання</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Сценарій {currentIndex + 1} з {scenarios.length}
        </p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed">{current.promptUa}</p>
        </CardContent>
      </Card>

      <RadioGroup
        value={selectedOptionId}
        onValueChange={handleSelect}
        aria-label={`Сценарій ${currentIndex + 1}`}
      >
        {current.options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 text-sm transition-colors hover:bg-accent data-[state=checked]:border-primary"
          >
            <RadioGroupItem value={option.id} className="mt-0.5 shrink-0" />
            <span>{option.textUa}</span>
          </label>
        ))}
      </RadioGroup>

      <div className="mt-auto flex justify-end">
        <Button onClick={handleAdvance} disabled={!hasAnswer}>
          {isLast ? 'Далі' : 'Наступний сценарій'}
        </Button>
      </div>
    </div>
  );
}

/** Returns true when every scenario (including attention-check ones) has been answered. */
export function useAllScenariosAnswered(seed: string): boolean {
  const answers = useSurveyStore((s) => s.answers);
  const scenarios = useMemo(() => buildScenariosBlockItems(seed || 'default'), [seed]);
  return scenarios.every((s) => answers.has(s.id as QuestionId));
}
