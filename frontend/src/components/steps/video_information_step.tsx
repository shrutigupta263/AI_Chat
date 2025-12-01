'use client';

import { useMemo, useState } from 'react';
import { Question } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import UiCard from '@/components/ui/ui_card';
import PrimaryButton from '@/components/ui/primary_button';
import SecondaryButton from '@/components/ui/secondary_button';
import AiSuggestionCard from '@/components/ui/ai_suggestion_card';
import FormField from './form_field';
import { useAiSuggestions } from '@/hooks/use_ai_suggestions';

interface VideoInformationStepProps {
  questionIds: string[];
  questionMap: Record<string, Question>;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
}

export default function VideoInformationStep({
  questionIds,
  questionMap,
  onNext,
  onPrevious,
  isActive,
}: VideoInformationStepProps) {
  const { answers, setAnswer } = useFormStore();
  const [activeQuestionId, setActiveQuestionId] = useState(questionIds[0]);

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

  const activeQuestion = orderedQuestions.find((question) => question.id === activeQuestionId) || orderedQuestions[0];

  const { suggestions, answerSuggestion, loading, error, canShowSuggestions } = useAiSuggestions(
    activeQuestion,
    isActive,
  );

  const handleSuggestionApply = (suggestion: string) => {
    if (!activeQuestion) return;
    setAnswer(activeQuestion.id, activeQuestion.title, suggestion);
  };

  const isStepComplete =
    orderedQuestions.length > 0 &&
    orderedQuestions.every((question) => (answerMap[question.id]?.trim() || '').length > 0);

  return (
    <UiCard padding="lg" className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Step 3 · Video Information
        </p>
        <h2 className="mt-2 text-[22px] font-semibold text-[var(--text-dark)]">Define where and how it will be used</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Select the channels, formats, and logistics so creators film the right deliverable the first time.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          {orderedQuestions.map((question) => (
            <FormField
              key={question.id}
              question={question}
              value={answerMap[question.id] || ''}
              onFocus={() => setActiveQuestionId(question.id)}
              onChange={(value) => setAnswer(question.id, question.title, value)}
            />
          ))}
        </div>

        <div className="lg:w-[320px]">
          <AiSuggestionCard
            title="Distribution-focused AI hints"
            description={
              canShowSuggestions
                ? 'Tap a suggestion to apply it to the focused field.'
                : 'Suggestions are unavailable for dropdown or direct choice questions.'
            }
          >
            {!canShowSuggestions && (
              <p className="text-sm text-[var(--text-muted)]">
                These questions collect structured information, so AI suggestions are disabled intentionally.
              </p>
            )}
            {canShowSuggestions && loading && (
              <p className="text-sm text-[var(--text-muted)]">Gathering smart recommendations…</p>
            )}
            {canShowSuggestions && !loading && (answerSuggestion || suggestions.length > 0) && (
              <div className="space-y-2">
                {answerSuggestion && (
                  <button
                    type="button"
                    onClick={() => handleSuggestionApply(answerSuggestion)}
                    className="w-full rounded-[var(--radius-input)] border border-[var(--color-primary)]/30 bg-white px-4 py-2 text-left text-sm font-medium text-[var(--text-dark)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/70"
                  >
                    {answerSuggestion}
                  </button>
                )}
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionApply(suggestion)}
                    className="w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-4 py-2 text-left text-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {canShowSuggestions && !loading && !answerSuggestion && suggestions.length === 0 && !error && (
              <p className="text-sm text-[var(--text-muted)]">
                Provide more context in previous steps to unlock smarter suggestions.
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </AiSuggestionCard>
        </div>
      </div>

      {isActive && (
        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 lg:flex-row lg:items-center lg:justify-between">
          <SecondaryButton type="button" onClick={onPrevious} variant="ghost">
            ← Previous
          </SecondaryButton>
          <div className="text-right">
            <PrimaryButton type="button" onClick={onNext} disabled={!isStepComplete}>
              Next
            </PrimaryButton>
            {!isStepComplete && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">Complete every field to move forward.</p>
            )}
          </div>
        </div>
      )}
    </UiCard>
  );
}


