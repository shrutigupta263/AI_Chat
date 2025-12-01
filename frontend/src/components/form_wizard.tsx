'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFormStore } from '@/store/form_store';
import { FORM_QUESTIONS, Question } from '@/config/questions';
import { getSuggestions, getAnswerSuggestion } from '@/services/api';
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
    updateScene,
    answers,
  } = useFormStore();

  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  const [showScenes, setShowScenes] = useState(false);
  const [showAddSceneButton, setShowAddSceneButton] = useState(false);
  const [combinedSceneSuggestions, setCombinedSceneSuggestions] = useState<string[]>([]);
  const [loadingSceneSuggestions, setLoadingSceneSuggestions] = useState(false);

  // Fetch combined AI suggestions for scenes
  const fetchCombinedSceneSuggestions = useCallback(async () => {
    if (currentQuestionIndex !== 17 && currentQuestionIndex !== 18) return;
    
    setLoadingSceneSuggestions(true);
    try {
      const previousAnswers = answers.map((a) => ({
        question: a.questionTitle,
        answer: a.answerValue,
      }));

      // Fetch suggestions for both scenes and combine them
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

      // Combine all suggestions into one array
      const allSuggestions: string[] = [];
      if (scene1Answer) allSuggestions.push(scene1Answer);
      if (scene2Answer) allSuggestions.push(scene2Answer);
      allSuggestions.push(...scene1Suggestions);
      allSuggestions.push(...scene2Suggestions);

      // Remove duplicates and limit to 5
      const uniqueSuggestions = Array.from(new Set(allSuggestions)).slice(0, 5);
      setCombinedSceneSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error('Error fetching scene suggestions:', error);
      setCombinedSceneSuggestions([]);
    } finally {
      setLoadingSceneSuggestions(false);
    }
  }, [currentQuestionIndex, answers]);

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

    // Show scenes section when we reach scene questions (indices 17 or 18)
    // Keep them visible even after moving past (index 19+) so users can see their answers
    if (currentQuestionIndex >= 17) {
      setShowScenes(true);
    }

    // Check if we should show "Add Scene" button
    // Show it only when actively on scene questions (indices 17 or 18)
    if (currentQuestionIndex === 17 || currentQuestionIndex === 18) {
      setShowAddSceneButton(true);
    } else {
      setShowAddSceneButton(false);
    }

    // Fetch combined suggestions when on scene questions
    if (currentQuestionIndex === 17 || currentQuestionIndex === 18) {
      fetchCombinedSceneSuggestions();
    }
  }, [currentQuestionIndex, fetchCombinedSceneSuggestions]);

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

  const handleSceneSuggestionClick = (suggestion: string, sceneNumber: number) => {
    const sceneId = `scene_${sceneNumber}`;
    updateScene(sceneId, suggestion);
    setAnswer(sceneId, `Scene ${sceneNumber}`, suggestion);
  };

  const handleScenesNext = () => {
    // Save all scenes to answers
    scenes.forEach((scene, index) => {
      if (scene.content) {
        setAnswer(scene.id, `Scene ${index + 1}`, scene.content);
      }
    });
    
    // Advance to the next question
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
              
              {/* Insert Scenes Section after video_opener (index 16) when we reach scene questions */}
              {actualIndex === 16 && showScenes && (
                <div className="mb-8">
                  {/* Scene Blocks - Same card UI as other questions */}
                  {scenes.map((scene, index) => (
                    <SceneBlock
                      key={scene.id}
                      sceneId={scene.id}
                      sceneNumber={index + 1}
                      isActive={currentQuestionIndex === 17 || currentQuestionIndex === 18}
                      canDelete={scenes.length > 2}
                      combinedSuggestions={combinedSceneSuggestions}
                      onSuggestionClick={handleSceneSuggestionClick}
                    />
                  ))}

                  {/* Combined AI Suggestions for Both Scenes */}
                  {(currentQuestionIndex === 17 || currentQuestionIndex === 18) && (
                    <div className="mb-6 animate-slide-in">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="mb-4 border-b border-gray-200 pb-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-700">
                              ✨ AI Suggestions for Scenes
                            </p>
                          </div>
                        </div>

                        {/* Loading state */}
                        {loadingSceneSuggestions && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span>Generating suggestions...</span>
                          </div>
                        )}

                        {/* Combined suggestions list */}
                        {!loadingSceneSuggestions && combinedSceneSuggestions.length > 0 && (
                          <div className="space-y-2 mb-3">
                            {combinedSceneSuggestions.map((suggestion, index) => (
                              <div key={index} className="flex gap-2">
                                <button
                                  onClick={() => handleSceneSuggestionClick(suggestion, 1)}
                                  className="flex-1 text-left px-4 py-2 bg-green-50 text-green-800 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs font-bold opacity-60 mt-0.5">{index + 1}.</span>
                                    <span className="flex-1">{suggestion}</span>
                                    <span className="text-xs text-green-600">→ Scene 1</span>
                                  </div>
                                </button>
                                <button
                                  onClick={() => handleSceneSuggestionClick(suggestion, 2)}
                                  className="flex-1 text-left px-4 py-2 bg-green-50 text-green-800 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs font-bold opacity-60 mt-0.5">{index + 1}.</span>
                                    <span className="flex-1">{suggestion}</span>
                                    <span className="text-xs text-green-600">→ Scene 2</span>
                                  </div>
                                </button>
                              </div>
                            ))}
                            <p className="text-xs text-gray-500 mt-2 italic">
                              💡 Click any suggestion to use it for Scene 1 or Scene 2
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add Scene Button */}
                  {showAddSceneButton && (
                    <div className="mb-6">
                      <button
                        onClick={addScene}
                        className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        + Add Another Scene
                      </button>
                    </div>
                  )}

                  {/* Next Question Button after Scenes */}
                  {(currentQuestionIndex === 17 || currentQuestionIndex === 18) && (
                    <div className="mb-6">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <button
                          onClick={handleScenesNext}
                          disabled={scenes.length < 2 || !scenes[0]?.content?.trim() || !scenes[1]?.content?.trim()}
                          className={`w-full py-4 rounded-lg font-bold text-lg transition-all transform ${
                            scenes.length >= 2 && scenes[0]?.content?.trim() && scenes[1]?.content?.trim()
                              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {scenes.length >= 2 && scenes[0]?.content?.trim() && scenes[1]?.content?.trim() ? (
                            <>→ Next Question</>
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
                    </div>
                  )}
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

