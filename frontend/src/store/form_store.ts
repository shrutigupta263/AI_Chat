import { create } from 'zustand';

export interface Answer {
  questionId: string;
  questionTitle: string;
  answerValue: string;
}

export interface Scene {
  id: string;
  content: string;
}

interface FormState {
  answers: Answer[];
  currentQuestionIndex: number;
  scenes: Scene[];
  isComplete: boolean;
  
  // Actions
  setAnswer: (questionId: string, questionTitle: string, value: string) => void;
  updateAnswer: (questionId: string, value: string) => void;
  nextQuestion: () => void;
  goToQuestion: (index: number) => void;
  addScene: () => void;
  removeScene: (sceneId: string) => void;
  updateScene: (sceneId: string, content: string) => void;
  completeForm: () => void;
  resetForm: () => void;
  getAnswerById: (questionId: string) => Answer | undefined;
}

export const useFormStore = create<FormState>((set, get) => ({
  answers: [],
  currentQuestionIndex: 0,
  scenes: [
    { id: 'scene_1', content: '' },
    { id: 'scene_2', content: '' },
  ],
  isComplete: false,

  setAnswer: (questionId, questionTitle, value) => {
    const existingAnswerIndex = get().answers.findIndex(
      (a) => a.questionId === questionId
    );
    
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      const newAnswers = [...get().answers];
      newAnswers[existingAnswerIndex] = {
        questionId,
        questionTitle,
        answerValue: value,
      };
      set({ answers: newAnswers });
    } else {
      // Add new answer
      set({
        answers: [
          ...get().answers,
          { questionId, questionTitle, answerValue: value },
        ],
      });
    }
  },

  updateAnswer: (questionId, value) => {
    const answer = get().answers.find((a) => a.questionId === questionId);
    if (answer) {
      get().setAnswer(questionId, answer.questionTitle, value);
    }
  },

  nextQuestion: () => {
    set({ currentQuestionIndex: get().currentQuestionIndex + 1 });
  },

  goToQuestion: (index: number) => {
    set({ currentQuestionIndex: index });
  },

  addScene: () => {
    const currentScenes = get().scenes;
    const newSceneNumber = currentScenes.length + 1;
    const newScene = {
      id: `scene_${newSceneNumber}`,
      content: '',
    };
    set({ scenes: [...currentScenes, newScene] });
  },

  removeScene: (sceneId) => {
    const currentScenes = get().scenes;
    if (currentScenes.length > 2) {
      // Keep at least 2 scenes
      set({ scenes: currentScenes.filter((s) => s.id !== sceneId) });
      
      // Remove from answers too
      set({
        answers: get().answers.filter((a) => a.questionId !== sceneId),
      });
    }
  },

  updateScene: (sceneId, content) => {
    const scenes = get().scenes.map((scene) =>
      scene.id === sceneId ? { ...scene, content } : scene
    );
    set({ scenes });
  },

  completeForm: () => {
    set({ isComplete: true });
  },

  resetForm: () => {
    set({
      answers: [],
      currentQuestionIndex: 0,
      scenes: [
        { id: 'scene_1', content: '' },
        { id: 'scene_2', content: '' },
      ],
      isComplete: false,
    });
  },

  getAnswerById: (questionId) => {
    return get().answers.find((a) => a.questionId === questionId);
  },
}));

