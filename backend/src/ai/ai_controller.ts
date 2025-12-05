import { Controller, Post, Body } from "@nestjs/common";
import { AiService } from "./ai_service";
import {
  SuggestionsRequestDto,
  SuggestionsResponseDto,
} from "./dto/suggestions.dto";
import { SummaryRequestDto, SummaryResponseDto } from "./dto/summary.dto";
import {
  PostAnswerSuggestionRequestDto,
  PostAnswerSuggestionResponseDto,
} from "./dto/post_answer_suggestion.dto";
import {
  AnswerSuggestionRequestDto,
  AnswerSuggestionResponseDto,
} from "./dto/answer_suggestion.dto";
import {
  FollowUpQuestionsRequestDto,
  FollowUpQuestionsResponseDto,
} from "./dto/follow_up_questions.dto";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("suggestions")
  async getSuggestions(
    @Body() dto: SuggestionsRequestDto,
  ): Promise<SuggestionsResponseDto> {
    return this.aiService.getSuggestions(dto);
  }

  @Post("follow-up-questions")
  async generateFollowUpQuestions(
    @Body() dto: FollowUpQuestionsRequestDto,
  ): Promise<FollowUpQuestionsResponseDto> {
    return this.aiService.generateFollowUpQuestions(dto);
  }

  @Post("generate-summary")
  async generateSummary(
    @Body() dto: SummaryRequestDto,
  ): Promise<SummaryResponseDto> {
    return this.aiService.generateSummary(dto);
  }

  @Post("post-answer-suggestion")
  async getPostAnswerSuggestion(
    @Body() dto: PostAnswerSuggestionRequestDto,
  ): Promise<PostAnswerSuggestionResponseDto> {
    return this.aiService.getPostAnswerSuggestion(dto);
  }

  @Post("answer-suggestion")
  async getAnswerSuggestion(
    @Body() dto: AnswerSuggestionRequestDto,
  ): Promise<AnswerSuggestionResponseDto> {
    return this.aiService.getAnswerSuggestion(dto);
  }
}
