'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/config/questions';
import TextInput from '@/components/ui/text_input';
import MultilineTextarea from '@/components/ui/multiline_textarea';
import { useAiSuggestions } from '@/hooks/use_ai_suggestions';

interface ContentFieldWithAiProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
}

export default function ContentFieldWithAi({
  question,
  value,
  onChange,
  isActive,
}: ContentFieldWithAiProps) {
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);

  // Reset suggestionSelected when field becomes empty
  useEffect(() => {
    if (!value.trim() && suggestionSelected) {
      setSuggestionSelected(false);
      setShouldFetchSuggestions(false);
    }
  }, [value, suggestionSelected]);

  const { suggestions, answerSuggestion, loading, error, canShowSuggestions } = useAiSuggestions(
    question,
    isActive && shouldFetchSuggestions && !suggestionSelected && !value.trim(),
  );

  const handleFocus = () => {
    if (!value.trim()) {
      setShouldFetchSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setSuggestionSelected(true);
  };

  const renderInput = () => {
    if (question.type === 'textarea') {
      return (
        <MultilineTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={question.placeholder || 'Type your answer...'}
          rows={6}
        />
      );
    }

    return (
      <TextInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={question.placeholder || 'Type your answer...'}
      />
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-base font-semibold text-[var(--text-dark)]">{question.title}</label>
        {question.placeholder && <p className="mt-1 text-sm text-[var(--text-muted)]">{question.placeholder}</p>}
      </div>
      {renderInput()}

      {shouldFetchSuggestions && !suggestionSelected && !value.trim() && canShowSuggestions && (
        <div className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            ✨ AI Suggestions
          </p>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)]"></span>
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)]"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-primary)]"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </div>
              Generating ideas…
            </div>
          )}

          {!loading && (answerSuggestion || suggestions.length > 0) && (
            <div className="space-y-2">
              {answerSuggestion && (
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(answerSuggestion)}
                  className="w-full rounded-xl border border-[var(--color-primary)]/40 bg-white px-3 py-2 text-left text-sm font-medium text-[var(--text-dark)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/60"
                >
                  {answerSuggestion}
                </button>
              )}
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={`${suggestion}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-left text-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/50"
                >
                  {suggestion}
                </button>
              ))}
              <p className="pt-1 text-xs text-[var(--text-muted)]">💡 Click any suggestion to use it</p>
            </div>
          )}

          {!loading && !answerSuggestion && suggestions.length === 0 && !error && (
            <p className="text-sm text-[var(--text-muted)]">
              Fill earlier steps to unlock richer AI suggestions.
            </p>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

