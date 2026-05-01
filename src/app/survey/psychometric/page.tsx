'use client';

import { useRouter } from 'next/navigation';
import {
  PsychometricBlock,
  useAllPsychometricAnswered,
} from '@/components/survey/blocks/PsychometricBlock';
import { SurveyNav } from '@/components/survey/SurveyNav';
import { useSurveyStore } from '@/lib/storage/survey-store';

export default function PsychometricPage() {
  const router = useRouter();
  const { markBlockComplete, goToBlock } = useSurveyStore();
  const allAnswered = useAllPsychometricAnswered();

  const handleNext = () => {
    markBlockComplete('psychometric');
    goToBlock('scenarios');
    router.push('/survey/scenarios');
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PsychometricBlock />
      <SurveyNav onNext={handleNext} nextDisabled={!allAnswered} previousBlockId="cognitive" />
    </div>
  );
}
