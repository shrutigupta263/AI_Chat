import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timeout');
      return Promise.reject(new Error('Request timeout. The server is taking too long to respond.'));
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('[API] Network error - Backend may not be running');
      return Promise.reject(new Error('Cannot connect to backend server. Please ensure the backend is running on http://localhost:3001'));
    }
    if (error.response) {
      // Server responded with error status
      console.error('[API] Server error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('[API] No response received:', error.request);
      return Promise.reject(new Error('No response from server. Please check if the backend is running.'));
    }
    return Promise.reject(error);
  }
);

export interface PreviousAnswer {
  question: string;
  answer: string;
}

export interface SuggestionsRequest {
  currentQuestion: string;
  questionType: 'text' | 'textarea' | 'dropdown' | 'scene';
  options?: string[];
  previousAnswers: PreviousAnswer[];
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface SummaryRequest {
  allAnswers: PreviousAnswer[];
}

export interface SummaryResponse {
  summary: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface PostAnswerSuggestionRequest {
  history: QuestionAnswer[];
  currentQuestion: string;
  currentAnswer: string;
}

export interface PostAnswerSuggestionResponse {
  suggestion: string;
}

export interface AnswerSuggestionRequest {
  currentQuestion: string;
  questionType: 'text' | 'textarea' | 'dropdown' | 'scene';
  options?: string[];
  previousAnswers: PreviousAnswer[];
  userProfile?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AnswerSuggestionResponse {
  suggestion: string;
}

export interface FollowUpQuestionBlock {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'select';
  suggestions: string[];
  answer: string;
}

export interface FollowUpQuestionsRequest {
  previousAnswers: PreviousAnswer[];
  answeredQuestionIds?: string[];
}

export interface FollowUpQuestionsResponse {
  questions: FollowUpQuestionBlock[];
}

export const getSuggestions = async (
  data: SuggestionsRequest
): Promise<string[]> => {
  try {
    console.log('Fetching suggestions from:', `${API_URL}/ai/suggestions`);
    console.log('Request data:', data);
    const response = await api.post<SuggestionsResponse>('/ai/suggestions', data);
    console.log('Suggestions response:', response.data);
    if (!response.data || !response.data.suggestions) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response from server');
    }
    return response.data.suggestions || [];
  } catch (error: any) {
    // Error is already handled by interceptor, just re-throw
    throw error;
  }
};

export const generateFollowUpQuestions = async (
  data: FollowUpQuestionsRequest
): Promise<FollowUpQuestionBlock[]> => {
  try {
    console.log('Fetching follow-up questions from:', `${API_URL}/ai/follow-up-questions`);
    console.log('Request data:', data);
    const response = await api.post<FollowUpQuestionsResponse>('/ai/follow-up-questions', data);
    if (!response.data || !Array.isArray(response.data.questions)) {
      throw new Error('Invalid response from server');
    }
    return response.data.questions;
  } catch (error: any) {
    // Error is already handled by interceptor, just re-throw
    throw error;
  }
};

export const generateSummary = async (
  data: SummaryRequest
): Promise<string> => {
  try {
    const response = await api.post<SummaryResponse>('/ai/generate-summary', data);
    if (!response.data || !response.data.summary) {
      throw new Error('Invalid response from server');
    }
    return response.data.summary;
  } catch (error: any) {
    // Error is already handled by interceptor, just re-throw
    throw error;
  }
};

export const getPostAnswerSuggestion = async (
  data: PostAnswerSuggestionRequest
): Promise<string> => {
  try {
    const response = await api.post<PostAnswerSuggestionResponse>(
      '/ai/post-answer-suggestion',
      data
    );
    if (!response.data || response.data.suggestion === undefined) {
      throw new Error('Invalid response from server');
    }
    return response.data.suggestion;
  } catch (error: any) {
    // Error is already handled by interceptor, just re-throw
    throw error;
  }
};

export const getAnswerSuggestion = async (
  data: AnswerSuggestionRequest
): Promise<string> => {
  try {
    console.log('Fetching answer suggestion from:', `${API_URL}/ai/answer-suggestion`);
    console.log('Request data:', data);
    const response = await api.post<AnswerSuggestionResponse>(
      '/ai/answer-suggestion',
      data
    );
    console.log('Answer suggestion response:', response.data);
    if (!response.data || response.data.suggestion === undefined) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response from server');
    }
    return response.data.suggestion || '';
  } catch (error: any) {
    // Error is already handled by interceptor, just re-throw
    throw error;
  }
};

