'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Question } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import UiCard from '@/components/ui/ui_card';
import PrimaryButton from '@/components/ui/primary_button';
import SecondaryButton from '@/components/ui/secondary_button';
import AiSuggestionCard from '@/components/ui/ai_suggestion_card';
import FormField from './form_field';
import SceneBlock from '@/components/scene_block';
import { useAiSuggestions } from '@/hooks/use_ai_suggestions';
import { getAnswerSuggestion, getSuggestions } from '@/services/api';

interface ContentRequirementsStepProps {
  questionIds: string[];
  questionMap: Record<string, Question>;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
}

export default function ContentRequirementsStep({
  questionIds,
  questionMap,
  onNext,
  onPrevious,
  isActive,
}: ContentRequirementsStepProps) {
  const { answers, setAnswer, scenes, addScene } = useFormStore();
  const [activeQuestionId, setActiveQuestionId] = useState(questionIds[0]);
  const [combinedSceneSuggestions, setCombinedSceneSuggestions] = useState<string[]>([]);
  const [loadingSceneSuggestions, setLoadingSceneSuggestions] = useState(false);

  const answerMap = useMemo(() => {
    const map: Record<string, string> = {};
    answers.forEach((answer) => {
      map[answer.questionId] = answer.answerValue;
    });
    return map;
  }, [answers]);

  const questions = questionIds
    .map((id) => questionMap[id])
    .filter((question): question is Question => Boolean(question));

  const scriptQuestions = questions.filter((question) => question.type !== 'scene');
  const activeQuestion = questions.find((question) => question.id === activeQuestionId) || scriptQuestions[0];

  const { suggestions, answerSuggestion, loading, error, canShowSuggestions } = useAiSuggestions(
    activeQuestion,
    isActive,
  );

  const fetchCombinedSceneSuggestions = useCallback(async () => {
    if (!isActive) return;
    setLoadingSceneSuggestions(true);
    try {
      const previousAnswers = answers.map((answer) => ({
        question: answer.questionTitle,
        answer: answer.answerValue,
      }));

      const [scene1Suggestions, scene2Suggestions, scene1Answer, scene2Answer] = await Promise.all([
        getSuggestions({
          currentQuestion: 'Scene 1',
          questionType: 'scene',
          previousAnswers,
        }),
        getSuggestions({
          currentQuestion: 'Scene 2',
          questionType: 'scene',
          previousAnswers,
        }),
        getAnswerSuggestion({
          currentQuestion: 'Scene 1',
          questionType: 'scene',
          previousAnswers,
        }),
        getAnswerSuggestion({
          currentQuestion: 'Scene 2',
          questionType: 'scene',
          previousAnswers,
        }),
      ]);

      const combined = [
        ...(scene1Answer ? [scene1Answer] : []),
        ...(scene2Answer ? [scene2Answer] : []),
        ...scene1Suggestions,
        ...scene2Suggestions,
      ];

      const unique = Array.from(new Set(combined)).slice(0, 6);
      setCombinedSceneSuggestions(unique);
    } catch (err) {
      console.error('Error fetching scene suggestions', err);
      setCombinedSceneSuggestions([]);
    } finally {
      setLoadingSceneSuggestions(false);
    }
  }, [answers, isActive]);

  useEffect(() => {
    fetchCombinedSceneSuggestions();
  }, [fetchCombinedSceneSuggestions]);

  const handleSuggestionApply = (suggestion: string) => {
    if (!activeQuestion) return;
    setAnswer(activeQuestion.id, activeQuestion.title, suggestion);
  };

  const handleSceneSuggestionApply = (suggestion: string, sceneNumber: number) => {
    const scene = scenes[sceneNumber - 1];
    if (!scene) return;
    setAnswer(scene.id, `Scene ${sceneNumber}`, suggestion);
  };

  const mandatoryScriptFields = ['video_overview', 'video_opener', 'video_ending'];
  const isScriptComplete = mandatoryScriptFields.every((id) => (answerMap[id]?.trim() || '').length > 0);
  const areScenesReady =
    scenes.length >= 2 && Boolean(scenes[0]?.content?.trim()) && Boolean(scenes[1]?.content?.trim());

  const isStepComplete = isScriptComplete && areScenesReady;

  return (
    <UiCard padding="lg" className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">Step 4 · Content Requirements</p>
        <h2 className="mt-2 text-[22px] font-semibold text-[var(--text-dark)]">Craft the storyline & talking points</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Define the flow, tone, and must-have talking points to guide creators effortlessly.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6">
          {scriptQuestions.map((question) => (
            <FormField
              key={question.id}
              question={question}
              value={answerMap[question.id] || ''}
              onFocus={() => setActiveQuestionId(question.id)}
              onChange={(value) => setAnswer(question.id, question.title, value)}
            />
          ))}

          <div className="space-y-4">
            <p className="text-base font-semibold text-[var(--text-dark)]">Scenes</p>
            <div className="space-y-4">
              {scenes.map((scene, index) => (
                <SceneBlock
                  key={scene.id}
                  sceneId={scene.id}
                  sceneNumber={index + 1}
                  isActive={isActive}
                  canDelete={scenes.length > 2}
                  combinedSuggestions={combinedSceneSuggestions}
                  onSuggestionClick={handleSceneSuggestionApply}
                  layout="plain"
                  onFocus={() => {
                    const sceneQuestionId = `scene_${index + 1}`;
                    if (questionMap[sceneQuestionId]) {
                      setActiveQuestionId(sceneQuestionId);
                    }
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addScene}
              className="w-full rounded-2xl border-2 border-dashed border-[var(--border)] py-3 text-sm font-semibold text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              + Add another scene
            </button>
            {!areScenesReady && (
              <p className="text-sm text-amber-600">
                Add content for at least two scenes before continuing.
              </p>
            )}
          </div>
        </div>

        <div className="lg:w-[320px]">
          <AiSuggestionCard
            title="Creative AI suggestions"
            description={
              activeQuestion?.type === 'scene'
                ? 'Use these prompts to inspire your next scene.'
                : 'Tap any suggestion to populate the focused field.'
            }
          >
            {activeQuestion?.type === 'scene' ? (
              <>
                {loadingSceneSuggestions && (
                  <p className="text-sm text-[var(--text-muted)]">Gathering cinematic ideas…</p>
                )}
                {!loadingSceneSuggestions && combinedSceneSuggestions.length > 0 && (
                  <div className="space-y-2">
                    {combinedSceneSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSceneSuggestionApply(suggestion, Number(activeQuestion.id.split('_')[1]))}
                        className="w-full rounded-[var(--radius-input)] border border-[var(--border)] bg-white px-4 py-2 text-left text-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/60"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                {!loadingSceneSuggestions && combinedSceneSuggestions.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)]">
                    Provide more context in earlier steps to unlock richer scene prompts.
                  </p>
                )}
              </>
            ) : (
              <>
                {canShowSuggestions && loading && (
                  <p className="text-sm text-[var(--text-muted)]">Generating inspiration…</p>
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
                {(!canShowSuggestions || (!loading && !answerSuggestion && suggestions.length === 0)) && (
                  <p className="text-sm text-[var(--text-muted)]">
                    AI will surface custom talking points based on your previous answers.
                  </p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
              </>
            )}
          </AiSuggestionCard>
        </div>
      </div>

      {isActive && (
        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 lg:flex-row lg:items-center lg:justify-between">
          <SecondaryButton type="button" onClick={onPrevious} variant="ghost">
            ← Previous
          </SecondaryButton>
          <div className="text-right">
            <PrimaryButton type="button" onClick={onNext} disabled={!isStepComplete}>
              Next
            </PrimaryButton>
            {!isStepComplete && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Fill the overview, opener, ending, and at least the first two scenes to continue.
              </p>
            )}
          </div>
        </div>
      )}
    </UiCard>
  );
}


