'use client';

import { useEffect, useMemo, useState } from 'react';
import { Question, QUESTIONS_WITHOUT_AI_SUGGESTIONS } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import { getAnswerSuggestion, getSuggestions } from '@/services/api';

interface AiSuggestionState {
  suggestions: string[];
  answerSuggestion: string;
  loading: boolean;
  error: string;
  canShowSuggestions: boolean;
}

export function useAiSuggestions(question: Question | undefined, isActive: boolean): AiSuggestionState {
  const { answers } = useFormStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [answerSuggestion, setAnswerSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canShowSuggestions = useMemo(() => {
    if (!question) return false;
    return !QUESTIONS_WITHOUT_AI_SUGGESTIONS.includes(question.id);
  }, [question]);

  useEffect(() => {
    if (!question || !isActive || !canShowSuggestions) {
      setSuggestions([]);
      setAnswerSuggestion('');
      setError('');
      return;
    }

    let cancelled = false;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError('');

      try {
        const previousAnswers = answers.map((answer) => ({
          question: answer.questionTitle,
          answer: answer.answerValue,
        }));

        const [suggestionList, answerRecommendation] = await Promise.all([
          getSuggestions({
            currentQuestion: question.title,
            questionType: question.type,
            options: question.options,
            previousAnswers,
          }),
          getAnswerSuggestion({
            currentQuestion: question.title,
            questionType: question.type,
            options: question.options,
            previousAnswers,
          }),
        ]);

        if (cancelled) return;
        setSuggestions(suggestionList || []);
        setAnswerSuggestion(answerRecommendation || '');
      } catch (err: any) {
        if (cancelled) return;
        const message = err?.message || err?.response?.data?.message || 'Failed to load AI suggestions.';
        setError(message);
        setSuggestions([]);
        setAnswerSuggestion('');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [question, answers, isActive, canShowSuggestions]);

  return {
    suggestions,
    answerSuggestion,
    loading,
    error,
    canShowSuggestions,
  };
}


