'use client';

import { useRouter } from 'next/navigation';
import { CognitiveBlock, useAllCognitiveAnswered } from '@/components/survey/blocks/CognitiveBlock';
import { SurveyNav } from '@/components/survey/SurveyNav';
import { useSurveyStore } from '@/lib/storage/survey-store';

export default function CognitivePage() {
  const router = useRouter();
  const { markBlockComplete, goToBlock } = useSurveyStore();
  const allAnswered = useAllCognitiveAnswered();

  const handleNext = () => {
    markBlockComplete('cognitive');
    goToBlock('psychometric');
    router.push('/survey/psychometric');
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <CognitiveBlock />
      <SurveyNav onNext={handleNext} nextDisabled={!allAnswered} previousBlockId="verification" />
    </div>
  );
}
