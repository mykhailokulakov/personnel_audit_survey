'use client';

import { useRef } from 'react';
import type { LikertValue } from '@/lib/types/survey';
import { cn } from '@/lib/utils';

const LIKERT_LABELS: Record<LikertValue, string> = {
  1: 'Повністю не згоден',
  2: 'Не згоден',
  3: 'Нейтрально',
  4: 'Згоден',
  5: 'Повністю згоден',
};

const VALUES: LikertValue[] = [1, 2, 3, 4, 5];

type LikertScaleProps = {
  id: string;
  promptUa: string;
  value: LikertValue | undefined;
  onChange: (value: LikertValue) => void;
  disabled?: boolean;
};

/**
 * Renders a 5-point Likert scale with horizontal button layout.
 * Supports keyboard navigation via arrow keys and digit keys 1–5.
 */
export function LikertScale({ id, promptUa, value, onChange, disabled = false }: LikertScaleProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (e.key >= '1' && e.key <= '5') {
      onChange(Number(e.key) as LikertValue);
      return;
    }

    const current = value ?? null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = current === null ? 1 : current < 5 ? ((current + 1) as LikertValue) : current;
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = current === null ? 5 : current > 1 ? ((current - 1) as LikertValue) : current;
      onChange(prev);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium leading-snug" id={`${id}-label`}>
        {promptUa}
      </span>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-required="true"
        tabIndex={value === undefined ? 0 : -1}
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-2 sm:flex-nowrap"
      >
        {VALUES.map((v) => {
          const isSelected = value === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={LIKERT_LABELS[v]}
              disabled={disabled}
              tabIndex={isSelected ? 0 : value === undefined && v === 1 ? 0 : -1}
              onClick={() => onChange(v)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'min-w-[56px] cursor-pointer select-none',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-accent',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="text-base font-semibold leading-none">{v}</span>
              <span className="text-center leading-tight">{LIKERT_LABELS[v]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
