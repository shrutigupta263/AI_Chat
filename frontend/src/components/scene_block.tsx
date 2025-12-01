'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFormStore } from '@/store/form_store';
import UiCard from './ui/ui_card';
import MultilineTextarea from './ui/multiline_textarea';
import { getAnswerSuggestion, getSuggestions } from '@/services/api';

interface SceneBlockProps {
  sceneId: string;
  sceneNumber: number;
  isActive: boolean;
  canDelete: boolean;
  layout?: 'card' | 'plain';
  onFocus?: () => void;
}

export default function SceneBlock({
  sceneId,
  sceneNumber,
  isActive,
  canDelete,
  layout = 'card',
  onFocus,
}: SceneBlockProps) {
  const { scenes, updateScene, removeScene, setAnswer, getAnswerById, answers } = useFormStore();
  const [value, setValue] = useState('');
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const [sceneSuggestions, setSceneSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const existingAnswer = getAnswerById(sceneId);
    const scene = scenes.find((s) => s.id === sceneId);

    if (existingAnswer) {
      setValue(existingAnswer.answerValue);
    } else if (scene && scene.content) {
      setValue(scene.content);
    }
  }, [sceneId, getAnswerById, scenes]);

  // Reset suggestionSelected when field becomes empty
  useEffect(() => {
    if (!value.trim() && suggestionSelected) {
      setSuggestionSelected(false);
      setShouldFetchSuggestions(false);
    }
  }, [value, suggestionSelected]);

  const fetchSceneSuggestions = useCallback(async () => {
    if (!shouldFetchSuggestions || suggestionSelected || value.trim()) return;
    setLoadingSuggestions(true);
    try {
      const previousAnswers = answers.map((answer) => ({
        question: answer.questionTitle,
        answer: answer.answerValue,
      }));

      const [suggestions, answerSuggestion] = await Promise.all([
        getSuggestions({
          currentQuestion: `Scene ${sceneNumber}`,
          questionType: 'scene',
          previousAnswers,
        }),
        getAnswerSuggestion({
          currentQuestion: `Scene ${sceneNumber}`,
          questionType: 'scene',
          previousAnswers,
        }),
      ]);

      const combined = [...(answerSuggestion ? [answerSuggestion] : []), ...suggestions];
      setSceneSuggestions(Array.from(new Set(combined)).slice(0, 4));
    } catch (err) {
      console.error('Error fetching scene suggestions', err);
      setSceneSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [shouldFetchSuggestions, suggestionSelected, answers, sceneNumber]);

  useEffect(() => {
    if (shouldFetchSuggestions && !suggestionSelected && !value.trim()) {
      fetchSceneSuggestions();
    }
  }, [shouldFetchSuggestions, suggestionSelected, value, fetchSceneSuggestions]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    updateScene(sceneId, newValue);
    setAnswer(sceneId, `Scene ${sceneNumber}`, newValue);
  };

  const handleFocus = () => {
    if (onFocus) onFocus();
    if (!value.trim()) {
      setShouldFetchSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    updateScene(sceneId, suggestion);
    setAnswer(sceneId, `Scene ${sceneNumber}`, suggestion);
    setSuggestionSelected(true);
  };

  const Wrapper = layout === 'card' ? UiCard : 'div';
  const wrapperProps =
    layout === 'card'
      ? {}
      : {
          className: 'rounded-2xl border border-dashed border-[var(--border)] bg-white/80 p-5',
        };

  return (
    <Wrapper {...wrapperProps}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Video Script</p>
            <h3 className="text-xl font-semibold text-[var(--text-dark)]">Scene {sceneNumber}</h3>
          </div>
          {canDelete && isActive && (
            <button
              type="button"
              onClick={() => removeScene(sceneId)}
              className="text-sm font-semibold text-red-500 hover:text-red-600"
            >
              ✕ Remove
            </button>
          )}
        </div>

        <MultilineTextarea
          value={value}
          onFocus={handleFocus}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Describe what happens in this scene..."
          disabled={!isActive}
        />

        {shouldFetchSuggestions && !suggestionSelected && !value.trim() && isActive && (
          <div className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              ✨ AI Scene Suggestions
            </p>

            {loadingSuggestions && (
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
                Crafting scene ideas…
              </div>
            )}

            {!loadingSuggestions && sceneSuggestions.length > 0 && (
              <div className="space-y-2">
                {sceneSuggestions.map((suggestion, index) => (
                  <button
                    key={`${sceneId}-suggestion-${index}`}
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

            {!loadingSuggestions && sceneSuggestions.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">
                Fill earlier steps to unlock richer scene suggestions.
              </p>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
