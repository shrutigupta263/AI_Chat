'use client';

import { useState, useEffect } from 'react';
import { useFormStore } from '@/store/form_store';

interface SceneBlockProps {
  sceneId: string;
  sceneNumber: number;
  isActive: boolean;
  canDelete: boolean;
  combinedSuggestions?: string[];
  onSuggestionClick?: (suggestion: string, sceneNumber: number) => void;
}

export default function SceneBlock({
  sceneId,
  sceneNumber,
  isActive,
  canDelete,
  combinedSuggestions = [],
  onSuggestionClick,
}: SceneBlockProps) {
  const { scenes, updateScene, removeScene, setAnswer, getAnswerById } = useFormStore();
  const [value, setValue] = useState('');

  // Load existing answer if available and sync with scene content
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
    
    // Also update in answers for summary
    setAnswer(sceneId, `Scene ${sceneNumber}`, newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion, sceneNumber);
      // Also update local state
      setValue(suggestion);
    } else {
      handleChange(suggestion);
    }
  };

  // Same card UI as other questions
  return (
    <div className="mb-6 animate-slide-in">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{ overflow: 'visible' }}>
        {/* Question Title - Bold heading */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Scene {sceneNumber}
          </h3>
          {canDelete && isActive && (
            <button
              onClick={() => removeScene(sceneId)}
              className="text-red-500 hover:text-red-700 text-sm font-semibold"
            >
              ✕ Remove
            </button>
          )}
        </div>

        {/* Input Field */}
        <div className="mb-4">
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Describe what happens in this scene..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-y"
            disabled={!isActive}
          />
        </div>
      </div>
    </div>
  );
}

