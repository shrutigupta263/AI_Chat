'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, QUESTIONS_WITHOUT_AI_SUGGESTIONS } from '@/config/questions';
import { getSuggestions, getAnswerSuggestion } from '@/services/api';
import { useFormStore } from '@/store/form_store';
import { getStatesForCountry, getCitiesForState } from '@/config/locations';
import UiCard from './ui/ui_card';
import TextInput from './ui/text_input';
import MultilineTextarea from './ui/multiline_textarea';
import DropdownSelect from './ui/dropdown_select';
import PrimaryButton from './ui/primary_button';
import AiSuggestionCard from './ui/ai_suggestion_card';
import { classNames } from '@/utils/class_names';

interface QuestionBlockProps {
  question: Question;
  isActive: boolean;
  onNext: () => void;
  isLastQuestion: boolean;
}

export default function QuestionBlock({
  question,
  isActive,
  onNext,
  isLastQuestion,
}: QuestionBlockProps) {
  const { answers, setAnswer, updateAnswer, getAnswerById, completeForm } = useFormStore();
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [answerSuggestion, setAnswerSuggestion] = useState<string>('');
  const [loadingAnswerSuggestion, setLoadingAnswerSuggestion] = useState(false);
  const [errorSuggestions, setErrorSuggestions] = useState<string>('');
  const [errorAnswerSuggestion, setErrorAnswerSuggestion] = useState<string>('');

  const shouldShowAISuggestions = !QUESTIONS_WITHOUT_AI_SUGGESTIONS.includes(question.id);

  useEffect(() => {
    if (isActive) {
      console.log('QuestionBlock Debug:', {
        questionId: question.id,
        questionTitle: question.title,
        shouldShowAISuggestions,
        QUESTIONS_WITHOUT_AI_SUGGESTIONS,
      });
    }
  }, [isActive, question.id, question.title, shouldShowAISuggestions]);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    setErrorSuggestions('');
    setSuggestions([]);
    try {
      const previousAnswers = answers.map((a) => ({
        question: a.questionTitle,
        answer: a.answerValue,
      }));

      const suggestionsData = await getSuggestions({
        currentQuestion: question.title,
        questionType: question.type,
        options: question.options,
        previousAnswers,
      });

      if (suggestionsData && suggestionsData.length > 0) {
        setSuggestions(suggestionsData);
        setErrorSuggestions('');
        console.log('AI Suggestions fetched:', suggestionsData.length, 'suggestions');
      } else {
        setErrorSuggestions('No suggestions available. The AI service may be unavailable or returned empty results.');
        console.warn('AI Suggestions returned empty array');
      }
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to load suggestions.';
      setErrorSuggestions(
        errorMessage.includes('connect') || errorMessage.includes('Network')
          ? 'Cannot connect to backend. Please ensure the backend server is running on port 3001.'
          : errorMessage,
      );
    } finally {
      setLoadingSuggestions(false);
    }
  }, [answers, question.title, question.type, question.options]);

  const fetchAnswerSuggestion = useCallback(async () => {
    if (!isActive) return;

    setLoadingAnswerSuggestion(true);
    setErrorAnswerSuggestion('');
    setAnswerSuggestion('');
    try {
      const previousAnswers = answers.map((a) => ({
        question: a.questionTitle,
        answer: a.answerValue,
      }));

      console.log('Fetching answer suggestion for:', question.title);
      const suggestion = await getAnswerSuggestion({
        currentQuestion: question.title,
        questionType: question.type,
        options: question.options,
        previousAnswers,
      });

      console.log('Received suggestion:', suggestion);
      if (suggestion && suggestion.trim()) {
        setAnswerSuggestion(suggestion);
        setErrorAnswerSuggestion('');
      } else {
        setErrorAnswerSuggestion('No recommendation available. The AI service may be unavailable or returned empty results.');
        console.warn('AI Answer suggestion returned empty');
      }
    } catch (error: any) {
      console.error('Error fetching answer suggestion:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to load recommendation.';
      setErrorAnswerSuggestion(
        errorMessage.includes('connect') || errorMessage.includes('Network')
          ? 'Cannot connect to backend. Please ensure the backend server is running on port 3001.'
          : errorMessage,
      );
      setAnswerSuggestion('');
    } finally {
      setLoadingAnswerSuggestion(false);
    }
  }, [isActive, answers, question.title, question.type, question.options]);

  useEffect(() => {
    const existingAnswer = getAnswerById(question.id);
    if (existingAnswer) {
      setValue(existingAnswer.answerValue);
    }
  }, [question.id, getAnswerById]);

  useEffect(() => {
    if (question.id === 'state') {
      const countryAnswer = getAnswerById('country');
      if (!countryAnswer || !countryAnswer.answerValue) {
        setValue('');
      }
    }
  }, [question.id, answers, getAnswerById]);

  useEffect(() => {
    if (question.id === 'city') {
      const countryAnswer = getAnswerById('country');
      const stateAnswer = getAnswerById('state');
      if (!countryAnswer || !countryAnswer.answerValue || !stateAnswer || !stateAnswer.answerValue) {
        setValue('');
      }
    }
  }, [question.id, answers, getAnswerById]);

  useEffect(() => {
    if (isActive && shouldShowAISuggestions) {
      fetchSuggestions();
      fetchAnswerSuggestion();
    }
  }, [isActive, question.id, shouldShowAISuggestions, fetchSuggestions, fetchAnswerSuggestion]);

  useEffect(() => {
    if (isActive && shouldShowAISuggestions && !loadingAnswerSuggestion) {
      const timer = setTimeout(() => {
        fetchAnswerSuggestion();
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, shouldShowAISuggestions, answers.length]);

  const handleNext = async () => {
    if (value.trim()) {
      setAnswer(question.id, question.title, value);

      if (isLastQuestion) {
        completeForm();
      } else {
        onNext();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (question.type === 'dropdown' && question.options) {
      const matchedOption = question.options.find((option) => suggestion.toLowerCase().includes(option.toLowerCase()));
      if (matchedOption) {
        handleInputChange(matchedOption);
      } else {
        const optionMatch = suggestion.match(/(?:select|choose|pick)\s+([^-\n]+)/i);
        if (optionMatch) {
          const extractedOption = optionMatch[1].trim();
          const foundOption = question.options.find(
            (opt) =>
              opt.toLowerCase().includes(extractedOption.toLowerCase()) ||
              extractedOption.toLowerCase().includes(opt.toLowerCase()),
          );
          if (foundOption) {
            handleInputChange(foundOption);
          } else {
            handleInputChange(suggestion);
          }
        } else {
          handleInputChange(suggestion);
        }
      }
    } else {
      handleInputChange(suggestion);
    }
  };

  const handleAnswerSuggestionClick = () => {
    if (answerSuggestion) {
      if (question.type === 'dropdown' && question.options) {
        const matchedOption = question.options.find(
          (option) => option.toLowerCase() === answerSuggestion.toLowerCase(),
        );
        if (matchedOption) {
          handleInputChange(matchedOption);
        } else {
          const partialMatch = question.options.find(
            (option) =>
              option.toLowerCase().includes(answerSuggestion.toLowerCase()) ||
              answerSuggestion.toLowerCase().includes(option.toLowerCase()),
          );
          handleInputChange(partialMatch || answerSuggestion);
        }
      } else {
        handleInputChange(answerSuggestion);
      }
    }
  };

  const handleInputChange = (newValue: string) => {
    setValue(newValue);

    if (question.id === 'country') {
      const stateAnswer = getAnswerById('state');
      const cityAnswer = getAnswerById('city');
      if (stateAnswer) {
        updateAnswer('state', '');
      }
      if (cityAnswer) {
        updateAnswer('city', '');
      }
    } else if (question.id === 'state') {
      const cityAnswer = getAnswerById('city');
      if (cityAnswer) {
        updateAnswer('city', '');
      }
    }
  };

  const renderInput = () => {
    if (question.type === 'dropdown') {
      let dropdownOptions = question.options || [];

      if (question.id === 'state') {
        const countryAnswer = getAnswerById('country');
        if (countryAnswer && countryAnswer.answerValue) {
          dropdownOptions = getStatesForCountry(countryAnswer.answerValue);
        } else {
          dropdownOptions = ['Please select a country first'];
        }
      } else if (question.id === 'city') {
        const countryAnswer = getAnswerById('country');
        const stateAnswer = getAnswerById('state');
        if (countryAnswer && stateAnswer && countryAnswer.answerValue && stateAnswer.answerValue) {
          dropdownOptions = getCitiesForState(countryAnswer.answerValue, stateAnswer.answerValue);
        } else if (!stateAnswer || !stateAnswer.answerValue) {
          dropdownOptions = ['Please select a state first'];
        } else {
          dropdownOptions = ['Please select a country and state first'];
        }
      }

      const isDisabled =
        dropdownOptions.length === 0 || dropdownOptions[0]?.toLowerCase().includes('please select');

      return (
        <DropdownSelect
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={isDisabled}
        >
          <option value="">Select an option...</option>
          {dropdownOptions.map((option) => (
            <option key={option} value={option} disabled={option.includes('Please select')}>
              {option}
            </option>
          ))}
        </DropdownSelect>
      );
    }

    if (question.type === 'textarea') {
      return (
        <MultilineTextarea
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={question.placeholder || 'Type your answer...'}
          rows={6}
        />
      );
    }

    return (
      <TextInput
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={question.placeholder || 'Type your answer...'}
      />
    );
  };

  const helperMessageStateMissing =
    question.id === 'state' && !getAnswerById('country')?.answerValue ? 'Please select a country first' : '';
  const helperMessageCityMissing =
    question.id === 'city' && (!getAnswerById('country')?.answerValue || !getAnswerById('state')?.answerValue)
      ? 'Please select a country and state first'
      : '';

  return (
    <div className="animate-slide-in">
      <UiCard>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div
            className={classNames(
              'flex-1 space-y-4',
              shouldShowAISuggestions ? 'lg:pr-6' : '',
            )}
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{question.section}</p>
              <h3 className="mt-1 text-xl font-semibold text-[var(--text-dark)]">{question.title}</h3>
            </div>
            <div className="space-y-3">
              {renderInput()}
              {helperMessageStateMissing && (
                <p className="text-sm text-amber-600">⚠️ {helperMessageStateMissing}</p>
              )}
              {helperMessageCityMissing && (
                <p className="text-sm text-amber-600">⚠️ {helperMessageCityMissing}</p>
              )}
            </div>
          </div>

          {shouldShowAISuggestions && (
            <div className="lg:w-[320px]">
              <AiSuggestionCard
                className="bg-white"
                description="Click a suggestion to autofill your response."
              >
                {(loadingSuggestions || loadingAnswerSuggestion) &&
                  suggestions.length === 0 &&
                  !answerSuggestion &&
                  !errorSuggestions &&
                  !errorAnswerSuggestion && (
                    <p className="text-sm text-[var(--text-muted)]">⏳ Generating AI suggestions...</p>
                  )}

                {((answerSuggestion && !loadingAnswerSuggestion) || suggestions.length > 0) && (
                  <div className="space-y-2">
                    {(loadingSuggestions || loadingAnswerSuggestion) && (
                      <p className="text-sm text-[var(--text-muted)]">Generating suggestions...</p>
                    )}
                    {(() => {
                      const allSuggestions: string[] = [];
                      if (answerSuggestion && !loadingAnswerSuggestion) {
                        allSuggestions.push(answerSuggestion);
                      }
                      allSuggestions.push(...suggestions);
                      if (allSuggestions.length === 0) return null;

                      return allSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion}-${index}`}
                          onClick={() =>
                            index === 0 && answerSuggestion
                              ? handleAnswerSuggestionClick()
                              : handleSuggestionClick(suggestion)
                          }
                          className="w-full rounded-[var(--radius-input)] border border-[var(--border)] px-4 py-2 text-left text-sm text-[var(--text-dark)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/60"
                        >
                          <span className="mr-2 text-xs font-semibold text-[var(--text-muted)]">{index + 1}.</span>
                          {suggestion}
                        </button>
                      ));
                    })()}
                    <p className="text-xs text-[var(--text-muted)]">💡 Tap any suggestion to use it as your answer.</p>
                  </div>
                )}

                {errorSuggestions && !loadingSuggestions && (
                  <p className="text-xs text-amber-600">{errorSuggestions}</p>
                )}
                {errorAnswerSuggestion && !loadingAnswerSuggestion && (
                  <p className="text-xs text-amber-600">{errorAnswerSuggestion}</p>
                )}

                {!loadingSuggestions &&
                  !loadingAnswerSuggestion &&
                  suggestions.length === 0 &&
                  !answerSuggestion &&
                  !errorSuggestions &&
                  !errorAnswerSuggestion &&
                  isActive && (
                    <p className="text-sm text-[var(--text-muted)]">
                      💭 AI suggestions are being generated based on your previous answers...
                    </p>
                  )}
              </AiSuggestionCard>
            </div>
          )}
        </div>

        {isActive && (
          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <PrimaryButton type="button" onClick={handleNext} disabled={!value.trim()}>
              {value.trim() ? (isLastQuestion ? 'Generate Summary' : 'Next Question') : 'Type your answer to continue'}
            </PrimaryButton>
            {value.trim() && (
              <p className="mt-2 text-center text-sm font-semibold text-green-600">✓ Ready to proceed!</p>
            )}
          </div>
        )}
      </UiCard>
    </div>
  );
}
