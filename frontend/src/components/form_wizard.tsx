'use client';

import { useEffect, useState } from 'react';
import { useFormStore } from '@/store/form_store';
import { FORM_QUESTIONS, Question } from '@/config/questions';
import QuestionBlock from './question_block';
import SceneBlock from './scene_block';

export default function FormWizard() {
  const {
    currentQuestionIndex,
    nextQuestion,
    goToQuestion,
    scenes,
    addScene,
    setAnswer,
  } = useFormStore();

  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [showScenes, setShowScenes] = useState(false);
  const [showAddSceneButton, setShowAddSceneButton] = useState(false);

  useEffect(() => {
    // Determine which questions to show
    const questionsToShow: Question[] = [];
    
    // Always show questions up to and including the current question index
    for (let i = 0; i <= currentQuestionIndex && i < FORM_QUESTIONS.length; i++) {
      const question = FORM_QUESTIONS[i];
      
      // Skip scene questions as they're handled separately
      if (question.type !== 'scene') {
        questionsToShow.push(question);
      }
    }
    
    // Ensure the current question is always visible (important for questions after scenes)
    const currentQuestion = FORM_QUESTIONS[currentQuestionIndex];
    if (currentQuestion && currentQuestion.type !== 'scene') {
      // If current question is not a scene and not already in the list, add it
      // This ensures questions after scenes are always visible
      if (!questionsToShow.find(q => q.id === currentQuestion.id)) {
        questionsToShow.push(currentQuestion);
        // Sort to maintain proper order
        questionsToShow.sort((a, b) => {
          const indexA = FORM_QUESTIONS.findIndex(q => q.id === a.id);
          const indexB = FORM_QUESTIONS.findIndex(q => q.id === b.id);
          return indexA - indexB;
        });
      }
    }
    
    setVisibleQuestions(questionsToShow);

    // Show scenes section when we reach scene questions (indices 9 or 10)
    // Keep them visible even after moving past (index 11+) so users can see their answers
    if (currentQuestionIndex >= 9) {
      setShowScenes(true);
    }

    // Check if we should show "Add Scene" button
    // Show it only when actively on scene questions (indices 9 or 10)
    if (currentQuestionIndex === 9 || currentQuestionIndex === 10) {
      setShowAddSceneButton(true);
    } else {
      setShowAddSceneButton(false);
    }
  }, [currentQuestionIndex]);

  // Scroll to active question when it changes
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      const activeQuestion = document.querySelector('[data-question-active="true"]');
      if (activeQuestion) {
        // Only scroll if we're moving forward (not backward)
        // This ensures downward flow
        activeQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, visibleQuestions]);

  const handleNext = () => {
    nextQuestion();
  };

  const handleScenesComplete = () => {
    // Save all scenes to answers
    scenes.forEach((scene, index) => {
      if (scene.content) {
        setAnswer(scene.id, `Scene ${index + 1}`, scene.content);
      }
    });
    
    // Simply advance to the next question (maintains natural flow)
    // This will advance from scene_1 (index 9) -> scene_2 (index 10) -> video_ending (index 11)
    nextQuestion();
  };

  const isLastQuestion = currentQuestionIndex >= FORM_QUESTIONS.length - 1;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          UGC Campaign Brief
        </h1>
        <p className="text-gray-600">
          Answer each question with AI assistance to create your perfect brief
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Question {Math.min(currentQuestionIndex + 1, FORM_QUESTIONS.length)} of{' '}
          {FORM_QUESTIONS.length}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {visibleQuestions.map((question, index) => {
          // Find the actual index of this question in the full list
          const actualIndex = FORM_QUESTIONS.findIndex(q => q.id === question.id);
          const isActive = actualIndex === currentQuestionIndex;
          
          return (
            <div key={question.id}>
              <div 
                data-question-active={isActive}
                data-question-id={question.id}
              >
                <QuestionBlock
                  question={question}
                  isActive={isActive}
                  onNext={handleNext}
                  isLastQuestion={isLastQuestion}
                />
              </div>
              
              {/* Insert Scenes Section after video_opener (index 8) when we reach scene questions */}
              {actualIndex === 8 && showScenes && (
                <div className="mb-8 animate-slide-in">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Video Script - Scenes
                    </h3>
                    {(currentQuestionIndex === 9 || currentQuestionIndex === 10) && (
                      <p className="text-gray-600 mb-6">
                        Describe what happens in each scene of your video
                      </p>
                    )}

                    {/* Scene Blocks */}
                    {scenes.map((scene, index) => (
                      <SceneBlock
                        key={scene.id}
                        sceneId={scene.id}
                        sceneNumber={index + 1}
                        isActive={currentQuestionIndex === 9 || currentQuestionIndex === 10} // Active only when on scene questions
                        canDelete={scenes.length > 2}
                      />
                    ))}

                    {/* Add Scene Button */}
                    {showAddSceneButton && (
                      <button
                        onClick={addScene}
                        className="w-full py-3 px-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 font-semibold hover:bg-purple-50 transition-colors"
                      >
                        + Add Another Scene
                      </button>
                    )}

                    {/* Continue Button after Scenes */}
                    {/* Show button when user is at scene questions (indices 9 or 10) */}
                    {(currentQuestionIndex === 9 || currentQuestionIndex === 10) && (
                      <div className="mt-6">
                        <button
                          onClick={handleScenesComplete}
                          disabled={scenes.length < 2 || !scenes[0]?.content?.trim() || !scenes[1]?.content?.trim()}
                          className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform ${
                            scenes.length >= 2 && scenes[0]?.content?.trim() && scenes[1]?.content?.trim()
                              ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {scenes.length >= 2 && scenes[0]?.content?.trim() && scenes[1]?.content?.trim() ? (
                            <>→ Continue to Next Question</>
                          ) : (
                            'Fill both scenes to continue'
                          )}
                        </button>
                        {scenes.length >= 2 && scenes[0]?.content?.trim() && scenes[1]?.content?.trim() && (
                          <p className="text-center text-sm text-green-600 mt-2 font-semibold animate-pulse">
                            ✓ Ready to proceed!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / FORM_QUESTIONS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

