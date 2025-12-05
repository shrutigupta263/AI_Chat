export class FollowUpPreviousAnswer {
  question: string;
  answer: string;
}

export class FollowUpQuestionBlock {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "select";
  suggestions: string[];
  answer: string;
}

export class FollowUpQuestionsRequestDto {
  previousAnswers: FollowUpPreviousAnswer[];
  answeredQuestionIds?: string[];
}

export class FollowUpQuestionsResponseDto {
  questions: FollowUpQuestionBlock[];
}

