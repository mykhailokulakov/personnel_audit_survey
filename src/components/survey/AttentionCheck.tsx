'use client';

import type { LikertValue } from '@/lib/types/survey';
import { LikertScale } from './LikertScale';

type AttentionCheckProps = {
  id: string;
  promptUa: string;
  value: LikertValue | undefined;
  onChange: (value: LikertValue) => void;
  disabled?: boolean;
};

/**
 * Renders a Block-4 attention-check item as a standard Likert scale
 * with no visual distinction from regular psychometric questions.
 * The prompt itself contains the explicit target instruction.
 */
export function AttentionCheck({
  id,
  promptUa,
  value,
  onChange,
  disabled = false,
}: AttentionCheckProps) {
  return (
    <LikertScale
      id={id}
      promptUa={promptUa}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
