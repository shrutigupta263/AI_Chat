export class PreviousAnswer {
  question: string;
  answer: string;
}

export class SuggestionsRequestDto {
  currentQuestion: string;
  questionType: 'text' | 'textarea' | 'dropdown' | 'scene';
  options?: string[];
  previousAnswers: PreviousAnswer[];
}

export class SuggestionsResponseDto {
  suggestions: string[];
}

