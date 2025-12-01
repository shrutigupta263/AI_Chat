'use client';

import { useMemo } from 'react';
import { Question } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import UiCard from '@/components/ui/ui_card';
import PrimaryButton from '@/components/ui/primary_button';
import SecondaryButton from '@/components/ui/secondary_button';
import FormField from './form_field';
import ContentFieldWithAi from './content_field_with_ai';

interface DeliveryTimelineStepProps {
  questionIds: string[];
  questionMap: Record<string, Question>;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
}

export default function DeliveryTimelineStep({
  questionIds,
  questionMap,
  onNext,
  onPrevious,
  isActive,
}: DeliveryTimelineStepProps) {
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

  // Questions that need AI suggestions (textarea fields)
  const questionsWithAi = ['wardrobe', 'creative_direction', 'legal_disclaimers'];

  const isStepComplete =
    orderedQuestions.length > 0 &&
    orderedQuestions.every((question) => (answerMap[question.id]?.trim() || '').length > 0);

  return (
    <UiCard padding="lg" className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Step 5 · Delivery & Timeline</p>
        <h2 className="mt-2 text-[22px] font-semibold text-[var(--text-dark)]">Finalize requirements & guardrails</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Clarify production expectations, tone, and any must-follow legal or creative guidelines.
        </p>
      </div>

      <div className="space-y-6">
        {orderedQuestions.map((question) => {
          if (questionsWithAi.includes(question.id)) {
            return (
              <ContentFieldWithAi
                key={question.id}
                question={question}
                value={answerMap[question.id] || ''}
                onChange={(value) => setAnswer(question.id, question.title, value)}
                isActive={isActive}
              />
            );
          }
          return (
            <FormField
              key={question.id}
              question={question}
              value={answerMap[question.id] || ''}
              onChange={(value) => setAnswer(question.id, question.title, value)}
            />
          );
        })}
      </div>

      {isActive && (
        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <SecondaryButton type="button" onClick={onPrevious} variant="ghost">
            ← Previous
          </SecondaryButton>
          <div className="text-right">
            <PrimaryButton type="button" onClick={onNext} disabled={!isStepComplete}>
              Next
            </PrimaryButton>
            {!isStepComplete && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Fill out every field to continue.</p>
            )}
          </div>
        </div>
      )}
    </UiCard>
  );
}


