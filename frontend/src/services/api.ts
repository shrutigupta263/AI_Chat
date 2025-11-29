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
    console.error('Error fetching suggestions:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      config: error?.config?.url
    });
    // Re-throw with more context so the component can show a helpful error
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Failed to connect to the AI service. Please ensure the backend is running.'
    );
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
    console.error('Error fetching answer suggestion:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      config: error?.config?.url
    });
    // Re-throw with more context
    throw new Error(
      error?.response?.data?.message || 
      error?.message || 
      'Failed to connect to the AI service. Please ensure the backend is running.'
    );
  }
};

