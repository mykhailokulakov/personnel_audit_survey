'use client';

import { useState, useRef } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { ScoringResult, QualificationVerificationResult } from '@/lib/scoring';
import { ArchetypeLabel, ArchetypeDescription } from '@/lib/scoring';
import { VALIDITY_THRESHOLDS } from '@/lib/scoring/calibration';
import { AxisLabel } from '@/lib/types/axes';

type Props = {
  result: ScoringResult;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} с`;
  return `${minutes} хв ${seconds} с`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function QualificationBadge({ qual }: { qual: QualificationVerificationResult }) {
  const qualLabels: Record<string, string> = {
    demining: 'Розмінування / EOD',
    'drone-piloting': 'Пілотування БПЛА',
    'radar-radiotech': 'РЛС / радіотехніка',
    driving: 'Водіння',
    other: 'Інше',
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    verified: { label: 'Верифіковано', className: 'bg-green-100 text-green-800 border-green-200' },
    partial: {
      label: 'Часткова верифікація',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    failed: {
      label: 'Верифікація провалена',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
    'not-declared': {
      label: 'Не задеклароване',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
    },
    'no-verification': {
      label: 'Без верифікаційних питань',
      className: 'bg-gray-100 text-gray-600 border-gray-200',
    },
  };

  if (!qual.declared) return null;

  const config = statusConfig[qual.status] ?? {
    label: 'Без верифікаційних питань',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${config.className}`}
    >
      <span className="font-medium">{qualLabels[qual.qualification] ?? qual.qualification}</span>
      <span>{config.label}</span>
    </div>
  );
}

function downloadJSON(result: ScoringResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `assessment-${result.respondentCode}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportPdf(containerRef: React.RefObject<HTMLDivElement | null>, code: string) {
  const element = containerRef.current;
  if (!element) return;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Paginate: step by a full page height so adjacent pages share no overlap.
  // Image is repositioned upward by pageHeight on each subsequent page, and
  // jsPDF clips any content that falls outside [0, pageHeight].
  let pageIndex = 0;
  while (pageIndex * pageHeight < imgHeight + 10) {
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, 10 - pageIndex * pageHeight, imgWidth, imgHeight);
    pageIndex++;
  }

  pdf.save(`assessment-${code}.pdf`);
}

function copyResultLink(code: string) {
  const url = `${window.location.origin}/results?code=${encodeURIComponent(code)}`;
  void (navigator.clipboard as Clipboard | undefined)?.writeText(url).catch(() => {});
}

/**
 * Renders the full assessment report for a completed respondent session.
 *
 * Displays: archetype badge, radar chart (6 axes), qualification statuses,
 * validity warnings, and a JSON export button.
 */
export function ResultsReport({ result }: Props) {
  const { archetype, profile, validity, qualifications, respondentCode, scoredAt, durationMs } =
    result;

  const [pdfError, setPdfError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePdfExport = async () => {
    setPdfError(false);
    try {
      await exportPdf(containerRef, respondentCode);
    } catch {
      setPdfError(true);
    }
  };

  const radarData = profile.map(({ axis, score }) => ({
    axis: AxisLabel[axis],
    score,
    fullMark: 100,
  }));

  const declaredQuals = qualifications.filter((q) => q.declared);
  const hasValidityWarnings =
    validity.overall !== 'reliable' ||
    validity.speedFlag ||
    qualifications.some((q) => q.likelyFalseFlag);

  const archetypeColors: Record<string, string> = {
    'potential-leader': 'bg-blue-100 text-blue-800 border-blue-200',
    'technical-executor': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'admin-coordinator': 'bg-purple-100 text-purple-800 border-purple-200',
    'universal-potential': 'bg-teal-100 text-teal-800 border-teal-200',
    'basic-executor': 'bg-gray-100 text-gray-700 border-gray-200',
    'not-suitable': 'bg-orange-100 text-orange-800 border-orange-200',
    'data-unreliable': 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Результати оцінювання</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            Код: <strong className="text-foreground">{respondentCode}</strong>
          </span>
          <span>Дата: {formatDate(scoredAt)}</span>
          <span>Тривалість: {formatDuration(durationMs)}</span>
        </div>
      </div>

      {/* Archetype badge */}
      <section aria-label="Архетип">
        <div
          className={`rounded-lg border p-4 ${archetypeColors[archetype] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Архетип</p>
          <p className="mt-1 text-xl font-bold">{ArchetypeLabel[archetype]}</p>
          <p className="mt-1 text-sm">{ArchetypeDescription[archetype]}</p>
        </div>
      </section>

      {/* Radar chart */}
      <section aria-label="Профіль по осях">
        <h2 className="mb-3 text-lg font-semibold">Профіль по осях</h2>
        <div className="h-72 w-full" aria-label="Радар-діаграма профілю по 6 осях">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar
                name="Профіль"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {profile.map(({ axis, score }) => (
            <div key={axis} className="rounded-md bg-muted px-3 py-2 text-sm">
              <div className="font-medium">{AxisLabel[axis]}</div>
              <div className="text-muted-foreground">{score} / 100</div>
            </div>
          ))}
        </div>
      </section>

      {/* Qualifications */}
      {declaredQuals.length > 0 && (
        <section aria-label="Кваліфікації">
          <h2 className="mb-3 text-lg font-semibold">Кваліфікації</h2>
          {result.needsDocumentVerification && (
            <p className="mb-3 text-sm text-muted-foreground">
              Рекомендується верифікація документів для задекларованих кваліфікацій.
            </p>
          )}
          <div className="flex flex-col gap-2">
            {declaredQuals.map((qual) => (
              <QualificationBadge key={qual.qualification} qual={qual} />
            ))}
          </div>
        </section>
      )}

      {/* Validity warnings */}
      {hasValidityWarnings && (
        <section aria-label="Попередження щодо якості даних" role="alert">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h2 className="mb-2 text-base font-semibold text-yellow-800">
              Попередження щодо якості даних
            </h2>
            <ul className="flex flex-col gap-1 text-sm text-yellow-700">
              {validity.overall === 'unreliable' && (
                <li>
                  Загальна достовірність: <strong>недостовірно</strong>
                </li>
              )}
              {validity.overall === 'questionable' && (
                <li>
                  Загальна достовірність: <strong>сумнівно</strong>
                </li>
              )}
              {validity.lieScore > VALIDITY_THRESHOLDS.lie.reliable && (
                <li>
                  Шкала брехні: {Math.round(validity.lieScore)}% ({validity.lieCount}/
                  {validity.lieTotal} запитань)
                </li>
              )}
              {validity.consistencyScore > VALIDITY_THRESHOLDS.consistency.reliable && (
                <li>Узгодженість відповідей: {Math.round(validity.consistencyScore)}%</li>
              )}
              {validity.attentionTotal > 0 && validity.attentionScore < 100 && (
                <li>
                  Перевірка уважності: {validity.attentionPassed}/{validity.attentionTotal} пройдено
                </li>
              )}
              {validity.speedFlag && <li>Виявлено ознаки поспішного або однорідного заповнення</li>}
              {qualifications.some((q) => q.likelyFalseFlag) && (
                <li>Ймовірно неправдиві дані: деякі задекларовані кваліфікації не підтверджені</li>
              )}
            </ul>
          </div>
        </section>
      )}

      {/* Export actions */}
      <section aria-label="Дії з результатами" className="flex flex-wrap gap-3 justify-end">
        {pdfError && (
          <p role="alert" className="w-full text-right text-sm text-destructive">
            Помилка при генерації PDF. Спробуйте ще раз.
          </p>
        )}
        <button
          type="button"
          onClick={() => copyResultLink(respondentCode)}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Скопіювати посилання з кодом результату"
        >
          Скопіювати посилання
        </button>
        <button
          type="button"
          onClick={handlePdfExport}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Завантажити результати у форматі PDF"
        >
          Завантажити PDF
        </button>
        <button
          type="button"
          onClick={() => downloadJSON(result)}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Завантажити результати у форматі JSON"
        >
          Завантажити JSON
        </button>
      </section>
    </div>
  );
}
