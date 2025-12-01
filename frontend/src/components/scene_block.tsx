'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/store/form_store';
import UiCard from './ui/ui_card';
import MultilineTextarea from './ui/multiline_textarea';

interface SceneBlockProps {
  sceneId: string;
  sceneNumber: number;
  isActive: boolean;
  canDelete: boolean;
  combinedSuggestions?: string[];
  onSuggestionClick?: (suggestion: string, sceneNumber: number) => void;
  layout?: 'card' | 'plain';
  onFocus?: () => void;
}

export default function SceneBlock({
  sceneId,
  sceneNumber,
  isActive,
  canDelete,
  combinedSuggestions = [],
  onSuggestionClick,
  layout = 'card',
  onFocus,
}: SceneBlockProps) {
  const { scenes, updateScene, removeScene, setAnswer, getAnswerById } = useFormStore();
  const [value, setValue] = useState('');

  useEffect(() => {
    const existingAnswer = getAnswerById(sceneId);
    const scene = scenes.find((s) => s.id === sceneId);

    if (existingAnswer) {
      setValue(existingAnswer.answerValue);
    } else if (scene && scene.content) {
      setValue(scene.content);
    }
  }, [sceneId, getAnswerById, scenes]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    updateScene(sceneId, newValue);
    setAnswer(sceneId, `Scene ${sceneNumber}`, newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion, sceneNumber);
      setValue(suggestion);
    } else {
      handleChange(suggestion);
    }
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
          onFocus={onFocus}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Describe what happens in this scene..."
          disabled={!isActive}
        />

        {combinedSuggestions.length > 0 && isActive && (
          <div className="space-y-2 text-sm text-[var(--text-muted)]">
            {combinedSuggestions.slice(0, 2).map((suggestion, index) => (
              <button
                key={`${sceneId}-suggestion-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full rounded-[var(--radius-input)] border border-[var(--border)] px-4 py-2 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/60"
              >
                {suggestion}
              </button>
            ))}
            <p className="text-xs">💡 Tap to quickly apply this suggestion.</p>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
