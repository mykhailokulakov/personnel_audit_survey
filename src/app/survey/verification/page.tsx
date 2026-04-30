'use client';

import { useRouter } from 'next/navigation';
import { TechVerificationBlock } from '@/components/survey/blocks/TechVerificationBlock';
import { useSurveyStore } from '@/lib/storage/survey-store';

export default function VerificationPage() {
  const router = useRouter();
  const { markBlockComplete, goToBlock } = useSurveyStore();

  const handleNext = () => {
    markBlockComplete('verification');
    goToBlock('cognitive');
    router.push('/survey/cognitive');
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <TechVerificationBlock onNext={handleNext} />
    </div>
  );
}
