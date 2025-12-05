'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Question } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import UiCard from '@/components/ui/ui_card';
import PrimaryButton from '@/components/ui/primary_button';
import SecondaryButton from '@/components/ui/secondary_button';
import TextInput from '@/components/ui/text_input';
import TagChip from '@/components/ui/tag_chip';
import {
  getSuggestions,
  PreviousAnswer,
  generateFollowUpQuestions,
  FollowUpQuestionBlock,
} from '@/services/api';

interface BasicInfoStepProps {
  questionIds: string[];
  questionMap: Record<string, Question>;
  onNext: () => void;
  onGenerateMoreQuestions: () => void;
  isActive: boolean;
}

interface BasicFlowItem {
  id: string;
  prompt: string;
  placeholder: string;
  paragraph: (answer: string) => string;
  fallbackSuggestions: string[];
  aiPrompt?: string;
  // Condition to show this question based on previous answers
  condition?: (answerMap: Record<string, string>) => boolean;
}

// Core questions that always appear first
const CORE_QUESTIONS: BasicFlowItem[] = [
  {
    id: 'product_description',
    prompt: 'Tell the creator about the product or service ___',
    placeholder: 'e.g., brightening serum',
    paragraph: (answer) => `Tell the creator about the product or service i.e ${answer}.`,
    fallbackSuggestions: ['skincare serum', 'fintech app', 'eco cleaner', 'fitness plan'],
    aiPrompt: 'Tell the creator about the product or service in 1-3 words',
  },
  {
    id: 'product_name',
    prompt: 'What is the name of your product or service ___',
    placeholder: 'e.g., GlowSerum',
    paragraph: (answer) => `The name of your product or service is ${answer}.`,
    fallbackSuggestions: ['GlowSerum', 'NugVerse', 'TaskFlow', 'BrightDrop'],
    aiPrompt: 'Suggest a concise product name (1-2 words)',
  },
  {
    id: 'target_audience',
    prompt: 'Who is the target audience ___',
    placeholder: 'e.g., Gen Z women',
    paragraph: (answer) => `The target audience is ${answer}.`,
    fallbackSuggestions: ['Gen Z', 'Busy moms', 'Founders', 'Designers'],
    aiPrompt: 'Describe the target audience in 1-2 words',
  },
  {
    id: 'product_vibe',
    prompt: 'Preferred visual style or color guideline ___',
    placeholder: 'e.g., Minimal neutrals',
    paragraph: (answer) => `Preferred visual style or color guideline is ${answer}.`,
    fallbackSuggestions: ['Minimal', 'Vibrant', 'Pastel', 'Bold neon'],
    aiPrompt: 'Suggest a visual style or color guideline in 1-2 words',
  },
];

// Additional questions that appear conditionally
const CONDITIONAL_QUESTIONS: BasicFlowItem[] = [
  {
    id: 'main_problem',
    prompt: 'What main problem does your product solve ___',
    placeholder: 'e.g., dull skin',
    paragraph: (answer) => `The main problem it solves is ${answer}.`,
    fallbackSuggestions: ['dull skin', 'time management', 'waste reduction', 'fitness motivation'],
    aiPrompt: 'Describe the main problem in 1-2 words',
    condition: (answerMap) => Boolean(answerMap['product_description']),
  },
  {
    id: 'differentiator',
    prompt: 'What makes your product different ___',
    placeholder: 'e.g., organic ingredients',
    paragraph: (answer) => `What makes it different is ${answer}.`,
    fallbackSuggestions: ['organic ingredients', 'AI-powered', 'zero waste', 'personalized plans'],
    aiPrompt: 'Describe what makes it different in 1-2 words',
    condition: (answerMap) => Boolean(answerMap['product_name']),
  },
  {
    id: 'current_stage',
    prompt: 'What stage are you in ___',
    placeholder: 'e.g., ready to launch',
    paragraph: (answer) => `Currently in the stage of ${answer}.`,
    fallbackSuggestions: ['ready to launch', 'early users', 'prototype', 'idea'],
    aiPrompt: 'Describe current stage in 1-2 words',
    condition: (answerMap) => Boolean(answerMap['target_audience']),
  },
  {
    id: 'primary_goal',
    prompt: 'What is your primary goal ___',
    placeholder: 'e.g., growth',
    paragraph: (answer) => `The primary goal is ${answer}.`,
    fallbackSuggestions: ['growth', 'awareness', 'sales', 'validation'],
    aiPrompt: 'Describe primary goal in 1-2 words',
    condition: (answerMap) => Boolean(answerMap['product_vibe'] || answerMap['main_problem']),
  },
];

const MAX_SUGGESTION_WORDS = 2;
const MAX_SUGGESTIONS = 5;

const normalizeText = (value: string) => value.trim().replace(/\s+/g, ' ');

const shortenSuggestion = (value: string) => {
  const cleanValue = normalizeText(value);
  if (!cleanValue) return '';
  const words = cleanValue.split(' ').slice(0, MAX_SUGGESTION_WORDS);
  return words.join(' ');
};

export default function BasicInfoStep({ questionIds, questionMap, onNext, onGenerateMoreQuestions, isActive }: BasicInfoStepProps) {
  const { answers, setAnswer } = useFormStore();
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestionBlock[]>([]);
  const [followUpInputValue, setFollowUpInputValue] = useState('');
  const [followUpInputError, setFollowUpInputError] = useState('');
  const [moreQuestionsLoading, setMoreQuestionsLoading] = useState(false);
  const [moreQuestionsError, setMoreQuestionsError] = useState('');

  const answerMap = useMemo(() => {
    const map: Record<string, string> = {};
    answers.forEach((answer) => {
      map[answer.questionId] = answer.answerValue;
    });
    return map;
  }, [answers]);

  const flowSequence = useMemo(() => {
    const sequence: BasicFlowItem[] = [];
    const addedIds = new Set<string>();
    
    // Filter allowed questions
    const allowedIds = questionIds.length ? new Set(questionIds) : null;
    
    // Helper to check if question should be included
    const shouldInclude = (id: string) => {
      if (addedIds.has(id)) return false;
      if (allowedIds && !allowedIds.has(id)) return false;
      return true;
    };
    
    // Helper to add question if condition is met
    const addIfConditionMet = (item: BasicFlowItem) => {
      if (!shouldInclude(item.id)) return false;
      if (item.condition && !item.condition(answerMap)) return false;
      sequence.push(item);
      addedIds.add(item.id);
      return true;
    };
    
    // Build sequence with core questions and conditionals
    CORE_QUESTIONS.forEach((core) => {
      if (!shouldInclude(core.id)) return;
      
      // Add the core question
      sequence.push(core);
      addedIds.add(core.id);
      
      // After product_description, check for main_problem
      if (core.id === 'product_description') {
        const mainProblem = CONDITIONAL_QUESTIONS.find((q) => q.id === 'main_problem');
        if (mainProblem) addIfConditionMet(mainProblem);
      }
      
      // After product_name, check for differentiator
      if (core.id === 'product_name') {
        const differentiator = CONDITIONAL_QUESTIONS.find((q) => q.id === 'differentiator');
        if (differentiator) addIfConditionMet(differentiator);
      }
      
      // After target_audience, check for current_stage
      if (core.id === 'target_audience') {
        const currentStage = CONDITIONAL_QUESTIONS.find((q) => q.id === 'current_stage');
        if (currentStage) addIfConditionMet(currentStage);
      }
    });
    
    // After product_vibe, check for primary_goal (or after main_problem if it was added)
    if (sequence.some((q) => q.id === 'product_vibe' || q.id === 'main_problem')) {
      const primaryGoal = CONDITIONAL_QUESTIONS.find((q) => q.id === 'primary_goal');
      if (primaryGoal) addIfConditionMet(primaryGoal);
    }
    
    return sequence;
  }, [questionIds, answerMap]);

  const paragraphText = useMemo(
    () =>
      flowSequence
        .map((item) => {
          const value = answerMap[item.id];
          if (!value) return null;
          return item.paragraph(value);
        })
        .filter((value): value is string => Boolean(value))
        .join(' '),
    [answerMap, flowSequence],
  );

  const activeIndex = flowSequence.findIndex((item) => !normalizeText(answerMap[item.id] || ''));
  const isComplete = activeIndex === -1;
  const activeQuestion = isComplete ? null : flowSequence[activeIndex];

  const previousAnswers = useMemo(
    () =>
      flowSequence
        .map((item) => {
          const value = answerMap[item.id];
          if (!value) return null;
          const title = questionMap[item.id]?.title || item.prompt.replace(/\s*___$/, '');
          return {
            question: title,
            answer: value,
          } as PreviousAnswer;
        })
        .filter((entry): entry is PreviousAnswer => Boolean(entry)),
    [answerMap, flowSequence, questionMap],
  );

  const allPreviousAnswers = useMemo(
    () =>
      answers
        .map((item) => {
          const title = questionMap[item.questionId]?.title || item.questionTitle || item.questionId;
          return {
            question: title,
            answer: item.answerValue,
          } as PreviousAnswer;
        })
        .filter((entry) => Boolean(entry.question) && Boolean(entry.answer)),
    [answers, questionMap],
  );

  const answeredQuestionIds = useMemo(() => answers.map((item) => item.questionId), [answers]);

  useEffect(() => {
    setInputValue('');
    setInputError('');
  }, [activeQuestion?.id]);

  useEffect(() => {
    if (!activeQuestion || !isActive) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;

    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        const list = await getSuggestions({
          currentQuestion: activeQuestion.aiPrompt || activeQuestion.prompt.replace(/\s*___$/, ''),
          questionType: 'text',
          previousAnswers,
        });

        if (cancelled) return;

        const normalized = Array.from(
          new Set(
            list
              .map((suggestion) => shortenSuggestion(suggestion))
              .filter((item) => item.length > 0),
          ),
        ).slice(0, MAX_SUGGESTIONS);

        setSuggestions(normalized.length ? normalized : activeQuestion.fallbackSuggestions);
      } catch (error) {
        if (!cancelled) {
          setSuggestions(activeQuestion.fallbackSuggestions);
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [activeQuestion?.id, activeQuestion?.aiPrompt, activeQuestion?.prompt, activeQuestion?.fallbackSuggestions, previousAnswers, isActive]);

  useEffect(() => {
    setFollowUpQuestions([]);
    setMoreQuestionsError('');
  }, [previousAnswers]);

  const activeFollowUp = useMemo(
    () => followUpQuestions.find((item) => !normalizeText(item.answer || '')),
    [followUpQuestions],
  );

  const followUpComplete = followUpQuestions.length > 0 && !activeFollowUp;

  useEffect(() => {
    setFollowUpInputValue('');
    setFollowUpInputError('');
  }, [activeFollowUp?.id]);

  const handleSubmit = useCallback(
    (rawValue?: string) => {
      if (!activeQuestion) return;
      const value = normalizeText((rawValue ?? inputValue).trim());
      if (!value) {
        setInputError('Please enter a short answer.');
        return;
      }
      const questionTitle = questionMap[activeQuestion.id]?.title || activeQuestion.prompt.replace(/\s*___$/, '');
      setAnswer(activeQuestion.id, questionTitle, value);
      setInputValue('');
      setInputError('');
    },
    [activeQuestion, inputValue, questionMap, setAnswer],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleFollowUpSubmit = useCallback(
    (rawValue?: string) => {
      if (!activeFollowUp) return;
      const value = normalizeText((rawValue ?? followUpInputValue).trim());
      if (!value) {
        setFollowUpInputError('Please enter a short answer.');
        return;
      }
      setAnswer(activeFollowUp.id, activeFollowUp.label, value);
      setFollowUpQuestions((list) =>
        list.map((item) =>
          item.id === activeFollowUp.id ? { ...item, answer: value } : item,
        ),
      );
      setFollowUpInputValue('');
      setFollowUpInputError('');
    },
    [activeFollowUp, followUpInputValue, setAnswer],
  );

  const handleFollowUpKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleFollowUpSubmit();
      }
    },
    [handleFollowUpSubmit],
  );

  const handleGenerateMoreQuestions = useCallback(async () => {
    if (!isComplete || moreQuestionsLoading) return;
    setMoreQuestionsError('');
    setMoreQuestionsLoading(true);
    setFollowUpInputValue('');
    setFollowUpInputError('');
    try {
      const questions = await generateFollowUpQuestions({
        previousAnswers: allPreviousAnswers,
        answeredQuestionIds,
      });
      setFollowUpQuestions(
        questions.map((q, index) => ({
          ...q,
          id: q.id || `q_extra_${index + 1}`,
          answer: '',
        })),
      );
      onGenerateMoreQuestions();
    } catch (error: any) {
      const message =
        error?.message || 'Unable to generate more questions right now.';
      setMoreQuestionsError(message);
    } finally {
      setMoreQuestionsLoading(false);
    }
  }, [isComplete, moreQuestionsLoading, allPreviousAnswers, answeredQuestionIds, onGenerateMoreQuestions]);

  const displaySuggestions = suggestions.length
    ? suggestions
    : activeQuestion?.fallbackSuggestions || [];

  return (
    <UiCard padding="lg" className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Step 1 · Basics</p>
        <h2 className="text-[22px] font-semibold text-[var(--text-dark)]">Build your intro in one card</h2>
      </div>

      <div className="space-y-6">
        {!isComplete && activeQuestion ? (
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm space-y-6">
            {paragraphText && (
              <div className="pb-6 border-b border-[var(--border)]" aria-live="polite">
                <p className="text-base leading-relaxed text-[var(--text-dark)]">
                  {paragraphText}
                </p>
              </div>
            )}

            <div>
              <p className="text-lg font-semibold text-[var(--text-dark)]">{activeQuestion.prompt}</p>

              <div className="mt-4 space-y-2">
                <TextInput
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeQuestion.placeholder}
                  autoFocus
                />
                <p className="text-xs text-[var(--text-muted)]">Keep it to one quick phrase · Press Enter to save.</p>
                {inputError && <p className="text-xs font-semibold text-[#D14343]">{inputError}</p>}
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">AI suggestions</p>
                {suggestionsLoading && (
                  <p className="text-xs text-[var(--text-muted)]">Thinking...</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {displaySuggestions.map((suggestion) => (
                    <TagChip key={suggestion} onClick={() => handleSubmit(suggestion)}>
                      {suggestion}
                    </TagChip>
                  ))}
                  {displaySuggestions.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">No suggestions right now.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : isComplete ? (
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm" aria-live="polite">
            <p className="text-base leading-relaxed text-[var(--text-dark)]">
              {paragraphText}
            </p>
          </div>
        ) : null}
      </div>

      {isComplete && isActive && (
        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <PrimaryButton
            type="button"
            onClick={handleGenerateMoreQuestions}
            className="!text-sm w-40"
            disabled={moreQuestionsLoading}
          >
            {moreQuestionsLoading ? 'Generating...' : 'Generate More Questions'}
          </PrimaryButton>
          <div className="text-right">
            <PrimaryButton type="button" onClick={onNext} className="w-auto">
              Next →
            </PrimaryButton>
          </div>
        </div>
      )}

      {isActive && (followUpQuestions.length > 0 || moreQuestionsLoading || moreQuestionsError) && (
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-[var(--text-dark)]">Follow-up questions to fill gaps</p>
            {moreQuestionsLoading && (
              <p className="text-sm text-[var(--text-muted)]">Generating...</p>
            )}
          </div>

          {moreQuestionsError && (
            <p className="text-xs font-semibold text-[#D14343]">{moreQuestionsError}</p>
          )}

          {activeFollowUp ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-base font-semibold text-[var(--text-dark)]">{activeFollowUp.label}</p>
                <p className="text-xs text-[var(--text-muted)]">New question · {activeFollowUp.type === 'select' ? 'choose an option or type' : 'type an answer'}</p>
              </div>

              <div className="space-y-2">
                <TextInput
                  value={followUpInputValue}
                  onChange={(event) => setFollowUpInputValue(event.target.value)}
                  onKeyDown={handleFollowUpKeyDown}
                  placeholder={activeFollowUp.placeholder || 'Type your answer...'}
                  autoFocus
                />
                <p className="text-xs text-[var(--text-muted)]">Keep it to one quick phrase · Press Enter to save.</p>
                {followUpInputError && <p className="text-xs font-semibold text-[#D14343]">{followUpInputError}</p>}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">AI suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {activeFollowUp.suggestions.length > 0 ? (
                    activeFollowUp.suggestions.map((suggestion) => (
                      <TagChip key={`${activeFollowUp.id}-${suggestion}`} onClick={() => handleFollowUpSubmit(suggestion)}>
                        {suggestion}
                      </TagChip>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">No suggestions right now.</p>
                  )}
                </div>
              </div>
            </div>
          ) : followUpComplete ? (
            <p className="text-sm text-[var(--text-muted)]">All follow-up questions answered.</p>
          ) : moreQuestionsLoading ? (
            <p className="text-sm text-[var(--text-muted)]">Generating tailored follow-up questions...</p>
          ) : null}
        </div>
      )}
    </UiCard>
  );
}


