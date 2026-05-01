'use client';

import { useRouter } from 'next/navigation';
import { ScenariosBlock } from '@/components/survey/blocks/ScenariosBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';

export default function ScenariosPage() {
  const router = useRouter();
  const { markBlockComplete, goToBlock } = useSurveyStore();

  const handleNext = () => {
    markBlockComplete('scenarios');
    goToBlock('results');
    router.push('/survey/results');
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <ScenariosBlock onNext={handleNext} />
    </div>
  );
}
