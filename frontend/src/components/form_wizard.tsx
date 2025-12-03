'use client';

import { useState } from 'react';
import '@/styles/ugc_form.css';
import { useFormStore } from '@/store/form_store';
import { FORM_QUESTIONS, Question } from '@/config/questions';
import StepChip from './ui/step_chip';
import BasicInfoStep from './steps/basic_info_step';
import ProductDetailsStep from './steps/product_details_step';
import ContentRequirementsStep from './steps/content_requirements_step';
import DeliveryTimelineStep from './steps/delivery_timeline_step';
import FinalPreviewStep from './steps/final_preview_step';

interface StepDefinition {
  id: string;
  label: string;
  questionIds: string[];
}

const STEP_FLOW: StepDefinition[] = [
  {
    id: 'basics',
    label: 'Basics',
    questionIds: [
      'product_description',
      'product_name',
      'target_audience',
      'product_vibe',
      // Conditional questions that may appear based on answers
      'main_problem',
      'differentiator',
      'current_stage',
      'primary_goal',
    ],
  },
  {
    id: 'product_details',
    label: 'Product Details',
    questionIds: ['product_selling_points'],
  },
  {
    id: 'content_requirements',
    label: 'Content Requirements',
    questionIds: ['video_overview', 'video_opener', 'scene_1', 'scene_2', 'video_ending'],
  },
  {
    id: 'delivery_timeline',
    label: 'Delivery & Timeline',
    questionIds: ['wardrobe', 'creative_direction', 'legal_disclaimers'],
  },
  {
    id: 'final_preview',
    label: 'Final Preview',
    questionIds: [],
  },
];

const QUESTION_MAP: Record<string, Question> = FORM_QUESTIONS.reduce((acc, question) => {
  acc[question.id] = question;
  return acc;
}, {} as Record<string, Question>);

const QUESTION_INDEX_MAP = FORM_QUESTIONS.reduce((acc, question, index) => {
  acc[question.id] = index;
  return acc;
}, {} as Record<string, number>);

export default function FormWizard() {
  const { goToQuestion, completeForm } = useFormStore();
  const [activeStep, setActiveStep] = useState(0);

  const questionCount = FORM_QUESTIONS.length;
  const totalSteps = STEP_FLOW.length;
  const progressPercent = Math.min(((activeStep + 1) / totalSteps) * 100, 100);

  const updateStep = (stepIndex: number) => {
    const safeIndex = Math.max(0, Math.min(stepIndex, STEP_FLOW.length - 1));
    setActiveStep(safeIndex);

    const step = STEP_FLOW[safeIndex];
    const anchorQuestionId = step.questionIds[0];
    if (anchorQuestionId && QUESTION_INDEX_MAP[anchorQuestionId] !== undefined) {
      goToQuestion(QUESTION_INDEX_MAP[anchorQuestionId]);
    } else if (step.id === 'final_preview') {
      goToQuestion(questionCount - 1);
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleFinish = () => {
    completeForm();
  };

  const renderActiveStep = () => {
    const currentStep = STEP_FLOW[activeStep];

    switch (currentStep.id) {
      case 'basics':
        return (
          <BasicInfoStep
            questionIds={currentStep.questionIds}
            questionMap={QUESTION_MAP}
            onNext={() => updateStep(activeStep + 1)}
            isActive
          />
        );
      case 'product_details':
        return (
          <ProductDetailsStep
            sellingPointsQuestion={QUESTION_MAP['product_selling_points']}
            onPrevious={() => updateStep(activeStep - 1)}
            onNext={() => updateStep(activeStep + 1)}
            isActive
          />
        );
      case 'content_requirements':
        return (
          <ContentRequirementsStep
            questionIds={currentStep.questionIds}
            questionMap={QUESTION_MAP}
            onPrevious={() => updateStep(activeStep - 1)}
            onNext={() => updateStep(activeStep + 1)}
            isActive
          />
        );
      case 'delivery_timeline':
        return (
          <DeliveryTimelineStep
            questionIds={currentStep.questionIds}
            questionMap={QUESTION_MAP}
            onPrevious={() => updateStep(activeStep - 1)}
            onNext={() => updateStep(activeStep + 1)}
            isActive
          />
        );
      case 'final_preview':
        return (
          <FinalPreviewStep
            questionMap={QUESTION_MAP}
            onPrevious={() => updateStep(activeStep - 1)}
            onFinish={handleFinish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="ugc-form-page min-h-screen">
      <div className="ugc-nav">
        <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-semibold text-white">
              N
            </div>
            <button
              type="button"
              onClick={handleBackToAdmin}
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              ← Back to Admin
            </button>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full ugc-avatar text-sm font-semibold">
            SG
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1100px] px-4 pt-10 pb-6">
        <p className="text-sm uppercase tracking-wide text-[var(--text-muted)]">Campaign setup</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[32px] font-semibold text-[var(--text-dark)]">Create UGC Brief</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Build a comprehensive brief to attract the perfect creators for your campaign.
            </p>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            Step {activeStep + 1} of {totalSteps}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {STEP_FLOW.map((step, index) => (
            <StepChip
              key={step.id}
              label={step.label}
              stepNumber={index + 1}
              isActive={index === activeStep}
              isComplete={index < activeStep}
              onClick={() => updateStep(index)}
            />
          ))}
        </div>
        <div className="mt-6 h-2 w-full rounded-full bg-[var(--border)]">
          <div
            className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1100px] px-4 pb-16">
        <div className="space-y-6">{renderActiveStep()}</div>
      </section>
    </div>
  );
}

