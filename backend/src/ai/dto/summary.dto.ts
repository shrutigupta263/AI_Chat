export class Answer {
  question: string;
  answer: string;
}

export class SummaryRequestDto {
  allAnswers: Answer[];
}

export class SummaryResponseDto {
  summary: string;
}
