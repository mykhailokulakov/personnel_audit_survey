'use client';

import { useRouter } from 'next/navigation';
import { BasicInfoBlock } from '@/components/survey/blocks/BasicInfoBlock';
import { QualificationsBlock } from '@/components/survey/blocks/QualificationsBlock';
import { SurveyNav } from '@/components/survey/SurveyNav';
import { useSurveyStore } from '@/lib/storage/survey-store';
import { areRequiredQuestionsAnswered } from '@/lib/survey/question-helpers';
import type { QuestionSection } from '@/lib/types/question-spec';
import basicInfoData from '@/data/questions/basic-info.json';
import qualificationsData from '@/data/questions/qualifications.json';

const basicSections = basicInfoData.sections as QuestionSection[];
const qualSections = qualificationsData.sections as QuestionSection[];

export default function BasicPage() {
  const router = useRouter();
  const { markBlockComplete, goToBlock } = useSurveyStore();
  const answers = useSurveyStore((s) => s.answers);

  const allRequiredAnswered =
    areRequiredQuestionsAnswered(basicSections, answers) &&
    areRequiredQuestionsAnswered(qualSections, answers);

  const handleNext = () => {
    markBlockComplete('basic');
    goToBlock('verification');
    router.push('/survey/verification');
  };

  return (
    <div className="flex flex-1 flex-col gap-10">
      <BasicInfoBlock />
      <QualificationsBlock />
      <SurveyNav onNext={handleNext} nextDisabled={!allRequiredAnswered} previousBlockId="intro" />
    </div>
  );
}
