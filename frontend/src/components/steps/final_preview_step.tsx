'use client';

import { useMemo } from 'react';
import { Question } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import UiCard from '@/components/ui/ui_card';
import PrimaryButton from '@/components/ui/primary_button';
import SecondaryButton from '@/components/ui/secondary_button';

interface FinalPreviewStepProps {
  questionMap: Record<string, Question>;
  onPrevious: () => void;
  onFinish: () => void;
}

export default function FinalPreviewStep({ questionMap, onPrevious, onFinish }: FinalPreviewStepProps) {
  const { answers } = useFormStore();

  const formattedSections = useMemo(() => {
    const grouped: Record<string, { title: string; items: { label: string; value: string }[] }> = {};

    answers.forEach((answer) => {
      const question = questionMap[answer.questionId];
      if (!question) return;
      const section = question.section || 'General';
      if (!grouped[section]) {
        grouped[section] = { title: section, items: [] };
      }

      grouped[section].items.push({
        label: question.title,
        value: answer.answerValue,
      });
    });

    return Object.values(grouped);
  }, [answers, questionMap]);

  return (
    <UiCard padding="lg" className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Step 6 · Final Preview</p>
        <h2 className="mt-2 text-[22px] font-semibold text-[var(--text-dark)]">Review before generating the brief</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Double-check the information below. When you’re ready, generate the polished brief for your creators.
        </p>
      </div>

      <div className="space-y-6">
        {formattedSections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/60 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">{section.title}</p>
            <div className="mt-3 space-y-3">
              {section.items.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{item.label}</p>
                  <p className="mt-1 text-sm text-[var(--text-dark)] whitespace-pre-line">{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {formattedSections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
            No answers yet. Complete the earlier steps to see a preview here.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <SecondaryButton type="button" onClick={onPrevious} variant="ghost">
          ← Previous
        </SecondaryButton>
        <div className="text-right">
          <PrimaryButton type="button" onClick={onFinish} disabled={answers.length === 0}>
            Generate AI Brief
          </PrimaryButton>
          {answers.length === 0 && (
            <p className="mt-2 text-sm text-[var(--text-muted)]">Add content in previous steps to enable the preview.</p>
          )}
        </div>
      </div>
    </UiCard>
  );
}


