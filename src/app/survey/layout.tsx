import { SurveyProgress } from '@/components/survey/SurveyProgress';

export default function SurveyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-6 py-6">
      <SurveyProgress />
      {children}
    </div>
  );
}
