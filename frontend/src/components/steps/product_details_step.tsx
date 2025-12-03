'use client';

import { useEffect, useMemo, useState } from 'react';
import { Question } from '@/config/questions';
import UiCard from '@/components/ui/ui_card';
import DropdownSelect from '@/components/ui/dropdown_select';
import MultilineTextarea from '@/components/ui/multiline_textarea';
import PrimaryButton from '@/components/ui/primary_button';
import SecondaryButton from '@/components/ui/secondary_button';
import AiSuggestionCard from '@/components/ui/ai_suggestion_card';
import { useFormStore } from '@/store/form_store';
import { useAiSuggestions } from '@/hooks/use_ai_suggestions';

const CATEGORY_OPTIONS = [
  'Beauty & Wellness',
  'Health & Fitness',
  'Technology',
  'Food & Beverage',
  'Home & Lifestyle',
  'Fashion',
  'Education',
  'Travel',
  'Other',
];

interface ProductDetailsStepProps {
  sellingPointsQuestion: Question;
  onPrevious: () => void;
  onNext: () => void;
  isActive: boolean;
}

export default function ProductDetailsStep({
  sellingPointsQuestion,
  onPrevious,
  onNext,
  isActive,
}: ProductDetailsStepProps) {
  const { setAnswer, getAnswerById } = useFormStore();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const { suggestions, answerSuggestion, loading, error, canShowSuggestions } = useAiSuggestions(
    sellingPointsQuestion,
    isActive && shouldFetchSuggestions && !suggestionSelected && !description.trim(),
  );

  useEffect(() => {
    const descriptionAnswer = getAnswerById(sellingPointsQuestion.id);
    if (descriptionAnswer) {
      setDescription(descriptionAnswer.answerValue);
    }

    const categoryAnswer = getAnswerById('product_category');
    if (categoryAnswer) {
      setCategory(categoryAnswer.answerValue);
    }
  }, [getAnswerById, sellingPointsQuestion.id]);

  // Reset suggestionSelected when field becomes empty
  useEffect(() => {
    if (!description.trim() && suggestionSelected) {
      setSuggestionSelected(false);
      setShouldFetchSuggestions(false);
    }
  }, [description, suggestionSelected]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setAnswer('product_category', 'Product Category', value);
  };

  const handleSuggestionApply = (value: string) => {
    setDescription(value);
    setAnswer(sellingPointsQuestion.id, sellingPointsQuestion.title, value);
    setSuggestionSelected(true);
  };

  const handleNextClick = () => {
    if (!description.trim()) return;
    setAnswer(sellingPointsQuestion.id, sellingPointsQuestion.title, description.trim());
    onNext();
  };

  const nextButtonLabel = useMemo(() => {
    if (!isActive) return 'Next';
    return description.trim() ? 'Next' : 'Fill the description to continue';
  }, [description, isActive]);

  return (
    <UiCard padding="lg" className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Step 2 · Product Details</p>
        <h2 className="mt-2 text-[22px] font-semibold text-[var(--text-dark)]">Deep dive into your product</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Share the details that help creators understand what makes your product unique.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div>
            <label className="mb-2 block text-base font-semibold text-[var(--text-dark)]">Product Category</label>
            <DropdownSelect value={category} onChange={(event) => handleCategoryChange(event.target.value)}>
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </DropdownSelect>
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-[var(--text-dark)]">
              {sellingPointsQuestion.title}
            </label>
            <MultilineTextarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onFocus={() => {
                if (!description.trim()) {
                  setShouldFetchSuggestions(true);
                }
              }}
              placeholder={
                sellingPointsQuestion.placeholder ||
                'Provide a detailed description of your product, its features, and benefits...'
              }
            />
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Highlight the messages creators should lean on while talking about your product.
            </p>
          </div>
        </div>

        {shouldFetchSuggestions && !suggestionSelected && !description.trim() && (
          <div className="lg:w-[320px]">
            <AiSuggestionCard
              title="AI suggestions for key messages"
              description="Tap any suggestion to populate the Product selling points field."
            >
              {!canShowSuggestions && (
                <p className="text-sm text-[var(--text-muted)]">
                  Suggestions are disabled for this question. Please fill the field manually.
                </p>
              )}

              {canShowSuggestions && loading && (
                <p className="text-sm text-[var(--text-muted)]">Generating tailored messaging ideas…</p>
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
                  Provide more context in earlier steps to unlock richer suggestions.
                </p>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
            </AiSuggestionCard>
          </div>
        )}
      </div>

      {isActive && (
        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <SecondaryButton type="button" onClick={onPrevious} variant="ghost">
            ← Previous
          </SecondaryButton>
          <div className="text-right">
            <PrimaryButton type="button" onClick={handleNextClick} disabled={!description.trim()}>
              {nextButtonLabel}
            </PrimaryButton>
            {description.trim() && (
              <p className="mt-2 text-sm font-semibold text-green-600">✓ Product details ready!</p>
            )}
          </div>
        </div>
      )}
    </UiCard>
  );
}

