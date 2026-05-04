'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { BlockId } from '@/lib/types/survey';
import { BLOCK_ROUTES } from '@/lib/types/blocks';

type SurveyNavProps = {
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  previousBlockId?: BlockId | null;
};

export function SurveyNav({
  onNext,
  nextDisabled = false,
  nextLabel = 'Далі',
  previousBlockId = null,
}: SurveyNavProps) {
  const router = useRouter();

  const handleBack = () => {
    if (previousBlockId !== null) {
      router.push(`${BLOCK_ROUTES[previousBlockId]}?readonly=true`);
    }
  };

  return (
    <nav
      aria-label="Навігація анкетою"
      className="sticky bottom-0 -mx-4 sm:-mx-6 bg-background/95 backdrop-blur-sm border-t border-border px-4 sm:px-6 pb-safe py-3"
    >
      <div className="flex items-center justify-between">
        {previousBlockId !== null ? (
          <Button variant="outline" onClick={handleBack}>
            Назад
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
    </nav>
  );
}
