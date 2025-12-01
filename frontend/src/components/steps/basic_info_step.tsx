'use client';

import { useMemo } from 'react';
import { Question } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import UiCard from '@/components/ui/ui_card';
import PrimaryButton from '@/components/ui/primary_button';
import FormField from './form_field';

interface BasicInfoStepProps {
  questionIds: string[];
  questionMap: Record<string, Question>;
  onNext: () => void;
  isActive: boolean;
}

export default function BasicInfoStep({ questionIds, questionMap, onNext, isActive }: BasicInfoStepProps) {
  const { answers, setAnswer } = useFormStore();

  const answerMap = useMemo(() => {
    const map: Record<string, string> = {};
    answers.forEach((answer) => {
      map[answer.questionId] = answer.answerValue;
    });
    return map;
  }, [answers]);

  const orderedQuestions = questionIds
    .map((id) => questionMap[id])
    .filter((question): question is Question => Boolean(question));

  const isStepComplete =
    orderedQuestions.length > 0 &&
    orderedQuestions.every((question) => (answerMap[question.id]?.trim() || '').length > 0);

  return (
    <UiCard padding="lg" className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Step 1 · Basics</p>
        <h2 className="mt-2 text-[22px] font-semibold text-[var(--text-dark)]">
          Tell us the essentials about your product or service
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Keep it concise and descriptive so creators understand the foundation before moving forward.
        </p>
      </div>

      <div className="space-y-6">
        {orderedQuestions.map((question) => (
          <FormField
            key={question.id}
            question={question}
            value={answerMap[question.id] || ''}
            onChange={(value) => setAnswer(question.id, question.title, value)}
          />
        ))}
      </div>

      {isActive && (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-right sm:flex-row sm:items-center sm:justify-end">
          <div className="flex-1 text-left text-sm text-[var(--text-muted)]">
            {isStepComplete ? 'All basics captured.' : 'Fill every field to continue.'}
          </div>
          <PrimaryButton type="button" onClick={onNext} disabled={!isStepComplete}>
            Next
          </PrimaryButton>
        </div>
      )}
    </UiCard>
  );
}


