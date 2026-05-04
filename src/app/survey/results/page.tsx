'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useSurveyStore } from '@/lib/storage/survey-store';
import { scoreSession } from '@/lib/scoring';
import { ResultsReport } from '@/components/survey/ResultsReport';
import { BLOCK_ROUTES } from '@/lib/types/blocks';

export default function ResultsPage() {
  const router = useRouter();
  const session = useSurveyStore(
    useShallow((s) => ({
      code: s.code,
      startedAt: s.startedAt,
      currentBlock: s.currentBlock,
      answers: s.answers,
      blockStatus: s.blockStatus,
      consents: s.consents,
    })),
  );

  const scenariosCompleted = session.blockStatus.get('scenarios') === 'completed';

  useEffect(() => {
    if (!scenariosCompleted) {
      router.replace(BLOCK_ROUTES[session.currentBlock] ?? BLOCK_ROUTES['intro']);
    }
  }, [scenariosCompleted, router, session.currentBlock]);

  if (!scenariosCompleted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Будь ласка, почніть з початку</p>
      </div>
    );
  }

  const result = scoreSession(session);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <ResultsReport result={result} />
    </div>
  );
}
