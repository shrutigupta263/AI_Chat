import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const getSuggestions = async (
  data: SuggestionsRequest
): Promise<string[]> => {
  try {
    const response = await api.post<SuggestionsResponse>('/ai/suggestions', data);
    return response.data.suggestions;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

export const generateSummary = async (
  data: SummaryRequest
): Promise<string> => {
  try {
    const response = await api.post<SummaryResponse>('/ai/generate-summary', data);
    return response.data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
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
    return response.data.suggestion;
  } catch (error) {
    console.error('Error fetching post-answer suggestion:', error);
    throw error;
  }
};

export const getAnswerSuggestion = async (
  data: AnswerSuggestionRequest
): Promise<string> => {
  try {
    const response = await api.post<AnswerSuggestionResponse>(
      '/ai/answer-suggestion',
      data
    );
    return response.data.suggestion;
  } catch (error) {
    console.error('Error fetching answer suggestion:', error);
    throw error;
  }
};

