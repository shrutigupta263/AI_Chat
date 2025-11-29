'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, QUESTIONS_WITHOUT_AI_SUGGESTIONS } from '@/config/questions';
import { getSuggestions, getAnswerSuggestion } from '@/services/api';
import { useFormStore } from '@/store/form_store';
import { getStatesForCountry, getCitiesForState } from '@/config/locations';

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

  // Check if this question should show AI suggestions
  const shouldShowAISuggestions = !QUESTIONS_WITHOUT_AI_SUGGESTIONS.includes(question.id);
  
  // Debug logging
  useEffect(() => {
    if (isActive) {
      console.log('QuestionBlock Debug:', {
        questionId: question.id,
        questionTitle: question.title,
        shouldShowAISuggestions,
        QUESTIONS_WITHOUT_AI_SUGGESTIONS
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
        setErrorSuggestions(''); // Clear any previous errors
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
          : errorMessage
      );
    } finally {
      setLoadingSuggestions(false);
    }
  }, [answers, question.title, question.type, question.options]);

  const fetchAnswerSuggestion = useCallback(async () => {
    if (!isActive) return; // Only fetch for active questions
    
    setLoadingAnswerSuggestion(true);
    setErrorAnswerSuggestion('');
    setAnswerSuggestion(''); // Clear previous suggestion
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
        setErrorAnswerSuggestion(''); // Clear any previous errors
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
          : errorMessage
      );
      setAnswerSuggestion('');
    } finally {
      setLoadingAnswerSuggestion(false);
    }
  }, [isActive, answers, question.title, question.type, question.options]);

  // Load existing answer if available
  useEffect(() => {
    const existingAnswer = getAnswerById(question.id);
    if (existingAnswer) {
      setValue(existingAnswer.answerValue);
    }
  }, [question.id, getAnswerById]);

  // Clear state field when country changes
  useEffect(() => {
    if (question.id === 'state') {
      const countryAnswer = getAnswerById('country');
      if (!countryAnswer || !countryAnswer.answerValue) {
        setValue('');
      }
    }
  }, [question.id, answers, getAnswerById]);

  // Clear city field when country or state changes
  useEffect(() => {
    if (question.id === 'city') {
      const countryAnswer = getAnswerById('country');
      const stateAnswer = getAnswerById('state');
      if (!countryAnswer || !countryAnswer.answerValue || !stateAnswer || !stateAnswer.answerValue) {
        setValue('');
      }
    }
  }, [question.id, answers, getAnswerById]);

  // Fetch AI suggestions when question becomes active (only for questions that need them)
  useEffect(() => {
    if (isActive && shouldShowAISuggestions) {
      fetchSuggestions();
      fetchAnswerSuggestion();
    }
  }, [isActive, question.id, shouldShowAISuggestions, fetchSuggestions, fetchAnswerSuggestion]);

  // Re-fetch answer suggestion when previous answers change (for dynamic updates)
  // Only for questions that should show AI suggestions
  useEffect(() => {
    if (isActive && shouldShowAISuggestions && !loadingAnswerSuggestion) {
      const timer = setTimeout(() => {
        fetchAnswerSuggestion();
      }, 300); // Small delay to avoid too many calls
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, shouldShowAISuggestions, answers.length]);


  const handleNext = async () => {
    if (value.trim()) {
      // Save the answer when Next is clicked
      setAnswer(question.id, question.title, value);
      
      // Move to next question or complete form
      if (isLastQuestion) {
        completeForm();
      } else {
        onNext();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // For dropdown questions, try to extract the option name from suggestion
    if (question.type === 'dropdown' && question.options) {
      // Look for option names in the suggestion
      const matchedOption = question.options.find(option => 
        suggestion.toLowerCase().includes(option.toLowerCase())
      );
      if (matchedOption) {
        handleInputChange(matchedOption);
      } else {
        // If no match found, try to extract first option mentioned
        const optionMatch = suggestion.match(/(?:select|choose|pick)\s+([^-\n]+)/i);
        if (optionMatch) {
          const extractedOption = optionMatch[1].trim();
          const foundOption = question.options.find(opt => 
            opt.toLowerCase().includes(extractedOption.toLowerCase()) ||
            extractedOption.toLowerCase().includes(opt.toLowerCase())
          );
          if (foundOption) {
            handleInputChange(foundOption);
          } else {
            handleInputChange(suggestion); // Fallback to full suggestion
          }
        } else {
          handleInputChange(suggestion); // Fallback to full suggestion
        }
      }
    } else {
      // For text/textarea, use suggestion directly
      handleInputChange(suggestion);
    }
    // Keep suggestions visible - don't hide them
  };

  const handleAnswerSuggestionClick = () => {
    if (answerSuggestion) {
      // For dropdown questions, use the suggestion directly (it should be an exact option)
      if (question.type === 'dropdown' && question.options) {
        // The backend already returns the exact option name
        const matchedOption = question.options.find(
          (option) => option.toLowerCase() === answerSuggestion.toLowerCase()
        );
        if (matchedOption) {
          handleInputChange(matchedOption);
        } else {
          // Fallback: try partial match
          const partialMatch = question.options.find(
            (option) =>
              option.toLowerCase().includes(answerSuggestion.toLowerCase()) ||
              answerSuggestion.toLowerCase().includes(option.toLowerCase())
          );
          handleInputChange(partialMatch || answerSuggestion);
        }
      } else {
        // For text/textarea, use suggestion directly
        handleInputChange(answerSuggestion);
      }
    }
  };

  const handleInputChange = (newValue: string) => {
    setValue(newValue);
    // Don't auto-save - only update local state
    // User must click Next button to save and proceed
    
    // Reset dependent location fields when parent selection changes
    if (question.id === 'country') {
      // Reset state and city when country changes
      const stateAnswer = getAnswerById('state');
      const cityAnswer = getAnswerById('city');
      if (stateAnswer) {
        updateAnswer('state', '');
      }
      if (cityAnswer) {
        updateAnswer('city', '');
      }
    } else if (question.id === 'state') {
      // Reset city when state changes
      const cityAnswer = getAnswerById('city');
      if (cityAnswer) {
        updateAnswer('city', '');
      }
    }
  };

  const renderInput = () => {
    if (question.type === 'dropdown') {
      let dropdownOptions = question.options || [];

      // Dynamic location-based dropdowns
      if (question.id === 'state') {
        // Get country selection from answers
        const countryAnswer = getAnswerById('country');
        if (countryAnswer && countryAnswer.answerValue) {
          dropdownOptions = getStatesForCountry(countryAnswer.answerValue);
        } else {
          dropdownOptions = ['Please select a country first'];
        }
      } else if (question.id === 'city') {
        // Get country and state selections from answers
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

      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white"
          disabled={dropdownOptions.length === 0 || dropdownOptions[0]?.includes('Please select')}
        >
          <option value="">Select an option...</option>
          {dropdownOptions.map((option) => (
            <option key={option} value={option} disabled={option.includes('Please select')}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (question.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={question.placeholder || "Type your answer..."}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-y"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={question.placeholder || "Type your answer..."}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
      />
    );
  };

  // Form-based layout for all questions (active and answered)
  return (
    <div className="mb-6 animate-slide-in">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" style={{ overflow: 'visible', minHeight: isActive ? '400px' : 'auto' }}>
        {/* Question Title - Bold heading */}
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {question.title}
        </h3>

        {/* Input Field - Always editable */}
        <div className="mb-4">
          {renderInput()}
          
          {/* Helper text for location-dependent fields */}
          {question.id === 'state' && !getAnswerById('country')?.answerValue && (
            <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>Please select a country first</span>
            </p>
          )}
          {question.id === 'city' && (!getAnswerById('country')?.answerValue || !getAnswerById('state')?.answerValue) && (
            <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>Please select a country and state first</span>
            </p>
          )}
        </div>

        {/* AI Suggestions Section - Always show for questions that need AI suggestions */}
        {shouldShowAISuggestions && (
          <div className="mb-4 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <p className="text-sm font-semibold text-gray-700">
                ✨ AI Suggestions
              </p>
            </div>
            
            {/* Always show something - loading, content, or message */}
            {(loadingSuggestions || loadingAnswerSuggestion) && suggestions.length === 0 && !answerSuggestion && !errorSuggestions && !errorAnswerSuggestion && (
              <div className="text-sm text-gray-500 italic mb-3">
                ⏳ Generating AI suggestions...
              </div>
            )}

            {/* AI Answer Suggestion - Single suggestion button (show for all questions) */}
            {loadingAnswerSuggestion ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>Generating recommendation...</span>
              </div>
            ) : answerSuggestion ? (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">✨ AI Recommended Answer:</p>
                <button
                  onClick={handleAnswerSuggestionClick}
                  className="text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700 w-full"
                >
                  {answerSuggestion}
                </button>
              </div>
            ) : errorAnswerSuggestion ? (
              <div className="mb-3">
                <p className="text-xs text-amber-600 italic">{errorAnswerSuggestion}</p>
              </div>
            ) : null}

            {/* Multiple AI Suggestions - Show when we have suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {suggestions.length} AI Suggestion{suggestions.length > 1 ? 's' : ''}:
                </p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`text-left px-4 py-2 rounded-lg transition-colors text-sm w-full border ${
                      question.type === 'dropdown'
                        ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                        : question.type === 'textarea'
                        ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold opacity-60 mt-0.5">{index + 1}.</span>
                      <span className="flex-1">{suggestion}</span>
                    </div>
                  </button>
                ))}
                <p className="text-xs text-gray-500 mt-2 italic">
                  💡 Click any suggestion to use it as your answer
                </p>
              </div>
            )}

            {/* Loading Suggestions */}
            {loadingSuggestions && suggestions.length === 0 && !errorSuggestions && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>Loading AI suggestions...</span>
              </div>
            )}

            {/* Error Message for Suggestions */}
            {errorSuggestions && !loadingSuggestions && (
              <div className="mb-3">
                <p className="text-xs text-amber-600 italic">{errorSuggestions}</p>
              </div>
            )}

            {/* No Suggestions Available - Show helpful message */}
            {!loadingSuggestions && !loadingAnswerSuggestion && 
             suggestions.length === 0 && !answerSuggestion && !errorSuggestions && !errorAnswerSuggestion && isActive && (
              <div className="text-sm text-gray-500 italic mb-3">
                💭 AI suggestions are being generated based on your previous answers...
              </div>
            )}

          </div>
        )}

        {/* Next Button - Always show for active questions */}
        {isActive && (
          <div className="mt-6 pt-4 border-t-2 border-gray-300" style={{ clear: 'both', width: '100%' }}>
            <button
              type="button"
              onClick={handleNext}
              disabled={!value.trim()}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform ${
                value.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{ 
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {value.trim() ? (
                <>
                  {isLastQuestion ? '✓ Generate Summary' : '→ Next Question'}
                </>
              ) : (
                'Type your answer to continue'
              )}
            </button>
            {value.trim() && (
              <p className="text-center text-sm text-green-600 mt-2 font-semibold animate-pulse">
                ✓ Ready to proceed!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

