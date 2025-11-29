'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSuggestions, getAnswerSuggestion } from '@/services/api';
import { useFormStore } from '@/store/form_store';

interface SceneBlockProps {
  sceneId: string;
  sceneNumber: number;
  isActive: boolean;
  canDelete: boolean;
}

export default function SceneBlock({
  sceneId,
  sceneNumber,
  isActive,
  canDelete,
}: SceneBlockProps) {
  const { answers, scenes, updateScene, removeScene, setAnswer, getAnswerById } = useFormStore();
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [answerSuggestion, setAnswerSuggestion] = useState<string>('');
  const [loadingAnswerSuggestion, setLoadingAnswerSuggestion] = useState(false);

  // Load existing answer if available
  useEffect(() => {
    const existingAnswer = getAnswerById(sceneId);
    if (existingAnswer) {
      setValue(existingAnswer.answerValue);
    } else {
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        setValue(scene.content);
      }
    }
  }, [sceneId, getAnswerById, scenes]);


  // Fetch AI suggestions when scene becomes active
  useEffect(() => {
    if (isActive) {
      fetchSuggestions();
      fetchAnswerSuggestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, sceneId]);

  // Re-fetch answer suggestion when previous answers change (for dynamic updates)
  useEffect(() => {
    if (isActive && !loadingAnswerSuggestion) {
      const timer = setTimeout(() => {
        fetchAnswerSuggestion();
      }, 300); // Small delay to avoid too many calls
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, answers.length, answers.map(a => `${a.questionId}:${a.answerValue}`).join('|')]);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const previousAnswers = answers.map((a) => ({
        question: a.questionTitle,
        answer: a.answerValue,
      }));

      const suggestionsData = await getSuggestions({
        currentQuestion: `Scene ${sceneNumber}`,
        questionType: 'scene',
        previousAnswers,
      });

      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [answers, sceneNumber]);

  const fetchAnswerSuggestion = useCallback(async () => {
    if (!isActive) return; // Only fetch for active scenes
    
    setLoadingAnswerSuggestion(true);
    setAnswerSuggestion(''); // Clear previous suggestion
    try {
      const previousAnswers = answers.map((a) => ({
        question: a.questionTitle,
        answer: a.answerValue,
      }));

      console.log('Fetching answer suggestion for Scene:', sceneNumber);
      const suggestion = await getAnswerSuggestion({
        currentQuestion: `Scene ${sceneNumber}`,
        questionType: 'scene',
        previousAnswers,
      });

      console.log('Received scene suggestion:', suggestion);
      if (suggestion && suggestion.trim()) {
        setAnswerSuggestion(suggestion);
      }
    } catch (error) {
      console.error('Error fetching answer suggestion:', error);
      setAnswerSuggestion('');
    } finally {
      setLoadingAnswerSuggestion(false);
    }
  }, [isActive, answers, sceneNumber]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    updateScene(sceneId, newValue);
    
    // Also update in answers for summary
    setAnswer(sceneId, `Scene ${sceneNumber}`, newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleChange(suggestion);
    setShowSuggestions(false);
  };

  const handleAnswerSuggestionClick = () => {
    if (answerSuggestion) {
      handleChange(answerSuggestion);
    }
  };

  const handleDelete = () => {
    if (canDelete) {
      removeScene(sceneId);
    }
  };

  // Form-based layout for all scenes (same as other questions)
  return (
    <div className="mb-6 animate-slide-in">
      <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-bold text-gray-800">Scene {sceneNumber}</h4>
          {canDelete && isActive && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-sm font-semibold"
            >
              ✕ Remove
            </button>
          )}
        </div>

        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Describe what happens in this scene..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
          disabled={!isActive}
        />

        {/* AI Answer Suggestion - Pill Button Style */}
        {isActive && (
          <div className="mt-3 animate-fade-in">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ✨ AI Suggestion:
            </p>
            {loadingAnswerSuggestion ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>Generating suggestion...</span>
              </div>
            ) : answerSuggestion ? (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAnswerSuggestionClick}
                  className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors text-sm font-medium inline-block"
                >
                  {answerSuggestion}
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* AI Suggestions for Scene */}
        {isActive && showSuggestions && suggestions.length > 0 && (
          <div className="mt-3 animate-fade-in">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ✨ Scene Suggestions ({suggestions.length} options):
            </p>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left px-4 py-3 bg-purple-50 text-purple-800 rounded-lg transition-all border-2 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold opacity-60 mt-0.5">{index + 1}.</span>
                    <span className="text-sm leading-relaxed flex-1">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              💡 Click any suggestion to use it as your scene description
            </p>
          </div>
        )}

        {/* Loading Suggestions */}
        {isActive && loadingSuggestions && (
          <div className="mt-3 text-sm text-gray-500">
            Loading scene suggestions...
          </div>
        )}

      </div>
    </div>
  );
}

