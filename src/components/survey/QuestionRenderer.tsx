'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Answer } from '@/lib/types/survey';
import type { QuestionSpec } from '@/lib/types/question-spec';

type QuestionRendererProps = {
  question: QuestionSpec;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  disabled?: boolean;
};

/**
 * Renders the appropriate input widget for a survey question based on its type.
 * Supports single-choice (radio), multi-choice (checkboxes), boolean (yes/no radio), and text.
 */
export function QuestionRenderer({
  question,
  answer,
  onChange,
  disabled = false,
}: QuestionRendererProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium leading-snug">{question.promptUa}</Label>

      {question.type === 'single-choice' && (
        <RadioGroup
          value={answer?.type === 'single-choice' ? answer.optionId : undefined}
          onValueChange={(val: string) => onChange({ type: 'single-choice', optionId: val })}
          disabled={disabled}
          aria-label={question.promptUa}
        >
          {question.options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-accent"
            >
              <RadioGroupItem value={opt.id} />
              <span className="text-sm">{opt.textUa}</span>
            </label>
          ))}
        </RadioGroup>
      )}

      {question.type === 'boolean' && (
        <RadioGroup
          value={answer?.type === 'boolean' ? String(answer.value) : undefined}
          onValueChange={(val: string) => onChange({ type: 'boolean', value: val === 'true' })}
          disabled={disabled}
          aria-label={question.promptUa}
        >
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-accent">
            <RadioGroupItem value="true" />
            <span className="text-sm">Так</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-accent">
            <RadioGroupItem value="false" />
            <span className="text-sm">Ні</span>
          </label>
        </RadioGroup>
      )}

      {question.type === 'multi-choice' && (
        <div className="flex flex-col gap-1" role="group" aria-label={question.promptUa}>
          {question.note !== undefined && question.note !== '' && (
            <p className="text-xs text-muted-foreground">{question.note}</p>
          )}
          {question.options.map((opt) => {
            const selectedIds = answer?.type === 'multi-choice' ? answer.optionIds : [];
            const isChecked = selectedIds.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-accent"
              >
                <Checkbox
                  checked={isChecked}
                  disabled={disabled}
                  onCheckedChange={(checked) => {
                    const current = answer?.type === 'multi-choice' ? answer.optionIds : [];
                    const next = checked
                      ? [...current, opt.id]
                      : current.filter((id) => id !== opt.id);
                    onChange({ type: 'multi-choice', optionIds: next });
                  }}
                />
                <span className="text-sm">{opt.textUa}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === 'text' && (
        <Input
          value={answer?.type === 'text' ? answer.value : ''}
          onChange={(e) => onChange({ type: 'text', value: e.target.value })}
          maxLength={question.maxLength}
          placeholder={question.placeholder}
          disabled={disabled}
          aria-label={question.promptUa}
        />
      )}
    </div>
  );
}
