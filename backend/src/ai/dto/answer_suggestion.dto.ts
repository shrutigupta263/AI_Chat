export class QuestionAnswer {
  question: string;
  answer: string;
}

export class AnswerSuggestionRequestDto {
  currentQuestion: string;
  questionType: 'text' | 'textarea' | 'dropdown' | 'scene';
  options?: string[];
  previousAnswers: QuestionAnswer[];
  userProfile?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class AnswerSuggestionResponseDto {
  suggestion: string;
}

