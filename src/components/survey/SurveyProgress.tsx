'use client';

import { Progress } from '@/components/ui/progress';
import { useCurrentBlock } from '@/lib/storage/survey-store';
import { BLOCK_LABELS, BLOCK_ORDER } from '@/lib/types/blocks';

export function SurveyProgress() {
  const currentBlock = useCurrentBlock();

  const currentIndex = BLOCK_ORDER.indexOf(currentBlock);
  const stepNumber = currentIndex + 1;
  const totalSteps = BLOCK_ORDER.length;
  const progressValue = (currentIndex / (totalSteps - 1)) * 100;
  const blockLabel = BLOCK_LABELS[currentBlock];

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        Крок {stepNumber} з {totalSteps}: {blockLabel}
      </p>
      <Progress
        value={progressValue}
        aria-label={`Прогрес анкети: крок ${stepNumber} з ${totalSteps}`}
      />
    </div>
  );
}
