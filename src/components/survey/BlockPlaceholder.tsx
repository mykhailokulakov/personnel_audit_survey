'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSurveyStore } from '@/lib/storage/survey-store';
import { BLOCK_LABELS, BLOCK_ORDER, BLOCK_ROUTES } from '@/lib/types/blocks';
import type { BlockId } from '@/lib/types/survey';

type BlockPlaceholderProps = {
  blockId: BlockId;
};

export function BlockPlaceholder({ blockId }: BlockPlaceholderProps) {
  const router = useRouter();
  const { markBlockComplete, goToBlock } = useSurveyStore();

  const handleNext = () => {
    markBlockComplete(blockId);
    const currentIndex = BLOCK_ORDER.indexOf(blockId);
    const nextBlock = BLOCK_ORDER[currentIndex + 1];
    if (nextBlock !== undefined) {
      goToBlock(nextBlock);
      router.push(BLOCK_ROUTES[nextBlock]);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h2 className="text-xl font-semibold">Блок: {BLOCK_LABELS[blockId]}</h2>
      <p className="text-muted-foreground">Цей блок буде реалізований у наступному milestone.</p>
      {BLOCK_ORDER.indexOf(blockId) < BLOCK_ORDER.length - 1 && (
        <div className="mt-auto">
          <Button onClick={handleNext}>Далі</Button>
        </div>
      )}
    </div>
  );
}
