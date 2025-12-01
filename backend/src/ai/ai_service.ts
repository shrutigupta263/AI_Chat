import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
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

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async getSuggestions(
    dto: SuggestionsRequestDto,
  ): Promise<SuggestionsResponseDto> {
    try {
      const { currentQuestion, questionType, options, previousAnswers } = dto;

      // Build context from previous answers
      const context = previousAnswers
        .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
        .join("\n\n");

      // Generate different prompts based on question type
      let typeSpecificInstructions = "";
      let suggestionFormat = "";

      if (questionType === "dropdown" && options && options.length > 0) {
        typeSpecificInstructions = `This is a DROPDOWN question with the following options: ${options.join(", ")}.

For dropdown questions, provide suggestions that:
- Recommend which option(s) to select based on context
- Explain WHY that option is best for their use case
- Consider their previous answers to make the recommendation
- Format: "Select [Option Name] - [Brief reason why]" or "Choose [Option] because [reason]"
- Provide 4-5 different option recommendations with reasoning`;
      } else if (questionType === "textarea") {
        typeSpecificInstructions = `This is a TEXTAREA question (multi-line text input).

For textarea questions, provide:
- Detailed, comprehensive suggestions (2-3 sentences each)
- Multiple different angles or approaches
- Complete thoughts that can be used directly or adapted
- Varied perspectives on the same topic
- Each suggestion should be substantial and well-developed`;
      } else if (questionType === "text") {
        typeSpecificInstructions = `This is a TEXT question (single-line input).

For text questions, provide:
- Concise, specific suggestions (1 sentence each)
- Different variations or approaches
- Practical, ready-to-use answers
- Varied options that cover different aspects`;
      } else if (questionType === "scene") {
        typeSpecificInstructions = `This is a SCENE question for video script.

For scene questions, provide:
- Detailed scene descriptions (2-3 sentences each)
- Different creative approaches for the scene
- Visual and action-oriented suggestions
- Varied scene concepts that can be used directly`;
      }

      const prompt = `You are helping to fill out a UGC (User Generated Content) campaign brief form. Generate 4-5 diverse, useful, and specific suggestions for the following question.

Current Question: ${currentQuestion}
Question Type: ${questionType}

${typeSpecificInstructions}

${
  context
    ? `IMPORTANT - Previous answers from the user (use these to make personalized suggestions):\n${context}\n\nYou MUST use the information from previous answers to generate relevant, personalized suggestions. For example:
- If they mentioned a specific product, reference it directly
- If they chose a platform, tailor suggestions specifically for that platform
- If they specified demographics, incorporate those details
- Build on their previous answers to create coherent, context-aware suggestions
- Make each suggestion feel personalized and relevant to their specific situation\n`
    : "This is the first question, so provide general but helpful suggestions that are still valuable.\n"
}

Requirements:
- Generate 4-5 DIFFERENT suggestions (not variations of the same idea)
- Each suggestion should be UNIQUE and offer a different perspective
- Make them practical, actionable, and ready to use
- CRITICAL: If previous answers exist, you MUST reference and build upon them
- Make suggestions feel personalized based on what the user has already shared
- Return ONLY the suggestions, one per line
- Do not number them or add bullet points
- Each suggestion should be valuable and distinct from others

Generate diverse, varied suggestions now:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates concise, relevant suggestions for UGC campaign briefs.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens:
          questionType === "textarea" || questionType === "scene" ? 500 : 400,
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || "";

      // Split by newlines and filter empty lines
      let suggestions = responseText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 5); // Max 5 suggestions for variety

      // For dropdown questions, try to extract option names from suggestions
      if (questionType === "dropdown" && options && options.length > 0) {
        // Keep suggestions as-is but they should contain option recommendations
        // The frontend will handle extracting option names
      }

      return { suggestions };
    } catch (error) {
      console.error("Error generating suggestions:", error);
      throw new HttpException(
        "Failed to generate suggestions",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateSummary(dto: SummaryRequestDto): Promise<SummaryResponseDto> {
    try {
      const { allAnswers } = dto;

      // Build the answers list
      const answersText = allAnswers
        .map((item) => `**${item.question}**\n${item.answer}`)
        .join("\n\n");

      const prompt = `You are creating a professional UGC (User Generated Content) creative brief based on the following form responses.

Generate a clean, well-structured creative brief using the answers below. Follow these requirements EXACTLY:

1. Use these section headings in this exact order:
   - ### Product / Service Education
   - ### Video Information
   - ### Video Script
   - ### Production Rules

2. Under each section, organize the relevant answers with clear labels
3. Use bullet points or clean formatting
4. Do NOT merge sections or change section names
5. Make it professional and easy to read
6. Include ALL provided information

Here are the form responses:

${answersText}

Generate the creative brief now:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional creative brief writer. Generate clear, well-structured UGC campaign briefs.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const summary = completion.choices[0]?.message?.content?.trim() || "";

      return { summary };
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new HttpException(
        "Failed to generate summary",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPostAnswerSuggestion(
    dto: PostAnswerSuggestionRequestDto,
  ): Promise<PostAnswerSuggestionResponseDto> {
    try {
      const { history, currentQuestion, currentAnswer } = dto;

      // Build conversation history for context
      const conversationHistory = history
        .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
        .join("\n\n");

      const prompt = `You are an AI assistant helping users fill out a UGC (User Generated Content) campaign brief form. 

The user has just answered a question. Based on their answer and the entire conversation history, provide a helpful, personalized suggestion or insight.

Conversation History:
${conversationHistory || "No previous answers yet."}

Current Question: ${currentQuestion}
User's Answer: ${currentAnswer}

Provide a brief, helpful suggestion (2-3 sentences max) that:
- Acknowledges their answer positively
- Offers relevant insight or next-step guidance
- Is personalized based on their previous answers
- Helps them think about the next question or improve their brief
- Uses a friendly, conversational tone

Generate your suggestion now:`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, friendly AI assistant that provides personalized feedback and suggestions for UGC campaign briefs. Keep responses concise, relevant, and encouraging.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const suggestion = completion.choices[0]?.message?.content?.trim() || "";

      return { suggestion };
    } catch (error) {
      console.error("Error generating post-answer suggestion:", error);
      throw new HttpException(
        "Failed to generate post-answer suggestion",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAnswerSuggestion(
    dto: AnswerSuggestionRequestDto,
  ): Promise<AnswerSuggestionResponseDto> {
    try {
      const {
        currentQuestion,
        questionType,
        options,
        previousAnswers,
        userProfile,
        metadata,
      } = dto;

      // Build context from previous answers
      const context = previousAnswers
        .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
        .join("\n\n");

      // Generate type-specific instructions
      let typeSpecificInstructions = "";

      if (questionType === "dropdown" && options && options.length > 0) {
        typeSpecificInstructions = `This is a DROPDOWN question with the following options: ${options.join(", ")}.
You MUST return ONLY the exact option name from the list above.
Do NOT add any explanation, prefix, or suffix.
Just return the single best option name.`;
      } else if (questionType === "textarea") {
        typeSpecificInstructions = `This is a TEXTAREA question (multi-line text input).
Provide a complete, well-structured answer (2-4 sentences).
Make it detailed and professional.
Do NOT add any explanation or meta-commentary.
Just return the direct answer.`;
      } else if (questionType === "text") {
        typeSpecificInstructions = `This is a TEXT question (single-line input).
Provide a concise, specific answer.
Do NOT add any explanation or meta-commentary.
Just return the direct answer.`;
      } else if (questionType === "scene") {
        typeSpecificInstructions = `This is a SCENE question for video script.
Provide a detailed scene description (2-3 sentences).
Make it visual and action-oriented.
Do NOT add any explanation or meta-commentary.
Just return the direct scene description.`;
      }

      const prompt = `You are helping to fill out a UGC (User Generated Content) campaign brief form. Generate ONE single, direct answer suggestion for the following question.

Current Question: ${currentQuestion}
Question Type: ${questionType}

${typeSpecificInstructions}

${
  context
    ? `IMPORTANT - Previous answers from the user (use these to make a personalized suggestion):\n${context}\n\nYou MUST use the information from previous answers to generate a relevant, personalized suggestion. For example:
- If they mentioned a specific product, reference it directly
- If they chose a platform, tailor the suggestion specifically for that platform
- If they specified demographics, incorporate those details
- Build on their previous answers to create a coherent, context-aware suggestion
- Make the suggestion feel personalized and relevant to their specific situation\n`
    : "This is the first question, so provide a general but helpful suggestion.\n"
}

${userProfile ? `User Profile Data:\n${JSON.stringify(userProfile, null, 2)}\n` : ""}
${metadata ? `Additional Metadata:\n${JSON.stringify(metadata, null, 2)}\n` : ""}

CRITICAL REQUIREMENTS:
- Return ONLY ONE direct answer
- NO hints, NO explanations, NO meta-commentary
- NO prefixes like "You could say..." or "Try..."
- Just the raw answer that the user can directly use
- Make it personalized and specific based on the context
- For dropdown questions, return ONLY the exact option name

Example of what to return:
- For "What is your travel budget?" → "₹15,000–₹20,000"
- For "Select Platform" → "Instagram"
- For "Video Overview" → "A 30-second product showcase featuring the key benefits with upbeat background music and dynamic transitions between scenes."

Generate the direct answer now (ONLY the answer, nothing else):`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates direct, concise answers for form questions. Return ONLY the answer itself, with no explanations or meta-commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens:
          questionType === "textarea" || questionType === "scene" ? 300 : 150,
      });

      const suggestion = completion.choices[0]?.message?.content?.trim() || "";

      // For dropdown questions, validate that the suggestion matches one of the options
      if (questionType === "dropdown" && options && options.length > 0) {
        const matchedOption = options.find(
          (option) =>
            suggestion.toLowerCase() === option.toLowerCase() ||
            suggestion.toLowerCase().includes(option.toLowerCase()) ||
            option.toLowerCase().includes(suggestion.toLowerCase()),
        );

        if (matchedOption) {
          return { suggestion: matchedOption };
        }
      }

      return { suggestion };
    } catch (error) {
      console.error("Error generating answer suggestion:", error);
      throw new HttpException(
        "Failed to generate answer suggestion",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
