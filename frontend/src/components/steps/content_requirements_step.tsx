'use client';

import { useMemo } from 'react';
import { Question } from '@/config/questions';
import { useFormStore } from '@/store/form_store';
import UiCard from '@/components/ui/ui_card';
import PrimaryButton from '@/components/ui/primary_button';
import SecondaryButton from '@/components/ui/secondary_button';
import ContentFieldWithAi from './content_field_with_ai';
import FormField from './form_field';
import SceneBlock from '@/components/scene_block';

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

  const scriptQuestions = questions.filter((question) => question.type !== 'scene' && question.id !== 'references');

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

      <div className="space-y-6">
        {scriptQuestions.map((question) => (
          <ContentFieldWithAi
            key={question.id}
            question={question}
            value={answerMap[question.id] || ''}
            onChange={(value) => setAnswer(question.id, question.title, value)}
            isActive={isActive}
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
                layout="plain"
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
            <p className="text-sm text-amber-600">Add content for at least two scenes before continuing.</p>
          )}
        </div>

        {questionMap['references'] && (
          <FormField
            question={questionMap['references']}
            value={answerMap['references'] || ''}
            onChange={(value) => setAnswer('references', questionMap['references'].title, value)}
          />
        )}
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


