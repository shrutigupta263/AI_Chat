export class QuestionAnswer {
  question: string;
  answer: string;
}

export class PostAnswerSuggestionRequestDto {
  history: QuestionAnswer[];
  currentQuestion: string;
  currentAnswer: string;
}

export class PostAnswerSuggestionResponseDto {
  suggestion: string;
}

