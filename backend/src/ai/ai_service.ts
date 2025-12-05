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
import {
  FollowUpQuestionsRequestDto,
  FollowUpQuestionsResponseDto,
  FollowUpQuestionBlock,
} from "./dto/follow_up_questions.dto";

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

  /**
   * Detects if a question is a Step 1 basic info question that requires very short suggestions (1-2 words)
   */
  private isBasicInfoQuestion(question: string): boolean {
    const normalizedQuestion = question.toLowerCase();
    const basicInfoKeywords = [
      "tell the creator about the product or service",
      "what is the name of your product or service",
      "who is the target audience",
      "preferred visual style",
      "color guideline",
      "product or service",
      "product name",
      "target audience",
      "visual style",
      "in 1-3 words",
      "in 1-2 words",
      "concise",
      "short",
    ];

    return basicInfoKeywords.some((keyword) =>
      normalizedQuestion.includes(keyword)
    );
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

      // Detect if this is a Step 1 basic info question (needs very short suggestions: 1-2 words)
      const isBasicInfoQuestion = this.isBasicInfoQuestion(currentQuestion);

      // Generate different prompts based on question type
      let typeSpecificInstructions = "";
      let suggestionFormat = "";

      if (isBasicInfoQuestion) {
        // Step 1 basic questions need VERY SHORT suggestions (1-2 words max)
        typeSpecificInstructions = `This is a BASIC INFO question that requires VERY SHORT suggestions.

CRITICAL REQUIREMENTS:
- Generate ONLY 1-2 WORD suggestions (maximum 2 words per suggestion)
- Each suggestion must be a short keyword or phrase (e.g., "skincare serum", "Gen Z", "Minimal")
- Generate 4-5 DIFFERENT, CONTEXTUAL suggestions that directly relate to the question
- Use previous answers to make suggestions more relevant and personalized
- Each suggestion should be immediately usable as a fill-in-the-blank answer
- AVOID long descriptions, sentences, or explanations
- Return ONLY the short keyword/phrase, nothing else

EXAMPLES:
- Question: "Tell the creator about the product or service" → "skincare serum", "fitness app", "eco cleaner"
- Question: "What is the name of your product" → "GlowSerum", "TaskFlow", "BrightDrop"  
- Question: "Who is the target audience" → "Gen Z women", "Busy moms", "Fitness enthusiasts"
- Question: "Preferred visual style" → "Minimal", "Vibrant", "Pastel neutrals"

If previous answers exist, tailor suggestions based on them:
- If product description is "skincare serum" → suggest related product names like "GlowSerum", "RadiancePlus"
- If product name is "GlowSerum" → suggest relevant audiences like "beauty enthusiasts", "Gen Z"
- If audience is "Gen Z" → suggest visual styles like "Vibrant", "Bold colors"`;
      } else if (questionType === "dropdown" && options && options.length > 0) {
        typeSpecificInstructions = `This is a DROPDOWN question with the following options: ${options.join(", ")}.

For dropdown questions, provide REALISTIC suggestions that:
- Recommend specific options based on ACTUAL context and use cases
- Include concrete reasons with real-world scenarios (e.g., "Select Instagram Reels - ideal for your target demographic of 18-34 year-olds who prefer short-form video content")
- Reference specific details from previous answers (product names, demographics, budgets, etc.)
- Format: "Select [Option Name] - [Specific, realistic reason with context]"
- Provide 4-5 different option recommendations, each with detailed, realistic reasoning
- AVOID generic reasons like "good for marketing" - be specific and contextual`;
      } else if (questionType === "textarea") {
        typeSpecificInstructions = `This is a TEXTAREA question (multi-line text input).

For textarea questions, provide REALISTIC, PROFESSIONAL suggestions:
- Detailed, comprehensive answers (2-4 sentences each) with SPECIFIC details
- Include concrete examples, numbers, names, and real-world scenarios
- Multiple different professional approaches, each with unique perspectives
- Complete, ready-to-use answers that sound like real campaign briefs
- Each suggestion should include: specific product/service details, target audience specifics, concrete benefits, and actionable information
- AVOID vague or generic statements - every suggestion must be specific and realistic`;
      } else if (questionType === "text") {
        typeSpecificInstructions = `This is a TEXT question (single-line input).

For text questions, provide REALISTIC, SPECIFIC suggestions:
- Concise but detailed answers (1-2 sentences) with concrete information
- Include specific names, numbers, dates, or concrete details when relevant
- Different realistic variations, each with unique specific details
- Professional, ready-to-use answers that sound authentic
- Each suggestion should be specific enough to be immediately usable
- AVOID generic placeholders - use real, specific information`;
      } else if (questionType === "scene") {
        typeSpecificInstructions = `This is a SCENE question for video script.

For scene questions, provide REALISTIC, DETAILED scene descriptions:
- Detailed scene descriptions (3-4 sentences) with specific visual and action details
- Include specific camera angles, actions, dialogue, and visual elements
- Different creative approaches, each with unique visual storytelling
- Professional video production quality descriptions
- Each scene should include: specific setting details, character actions, visual elements, camera movements, and pacing
- AVOID vague descriptions - be specific about what viewers will see and hear`;
      }

      let prompt = "";
      
      if (isBasicInfoQuestion) {
        // Special prompt for Step 1 basic info questions - needs very short suggestions
        prompt = `Generate 4-5 VERY SHORT keyword suggestions (1-2 words max) for this question.

Current Question: ${currentQuestion}

${typeSpecificInstructions}

${
  context
    ? `PREVIOUS ANSWERS (CRITICAL - use these to make contextual, personalized suggestions):\n${context}\n\nYou MUST use the previous answers to generate relevant, contextual suggestions. Each suggestion should relate to what was already answered.

CONTEXTUAL RULES:
- Analyze the previous answers carefully
- Generate suggestions that make sense with the previous answers
- Each question should get DIFFERENT suggestions based on what came before

EXAMPLES OF CONTEXTUAL SUGGESTIONS:
- If previous answer: "skincare serum" (product description)
  → For product name question: Suggest "GlowSerum", "RadiancePlus", "SkinGlow", "BriteLux"
  → For audience question: Suggest "beauty enthusiasts", "Gen Z", "Skincare lovers"
  → For visual style: Suggest "Clean minimal", "Soft pastels", "Natural tones"

- If previous answers: "GlowSerum" (product name) + "beauty enthusiasts" (audience)
  → For visual style: Suggest "Elegant luxury", "Soft glam", "Premium aesthetic"

- If no previous answers: Generate diverse, realistic options without context

CRITICAL: Make sure suggestions are DIFFERENT for each question and PERSONALIZED based on previous answers.\n`
    : "This is the first question (no previous answers). Generate diverse, realistic short keyword suggestions that work well as starting points.\n"
}

REQUIREMENTS:
- Return ONLY 4-5 suggestions
- Each suggestion MUST be 1-2 words maximum  
- Make suggestions DIFFERENT from each other
- PERSONALIZE based on previous answers (if available)
- Return ONLY the keywords, one per line, no explanations
- Do not number or add prefixes

Generate contextual, personalized short keyword suggestions now:`;
      } else {
        // Standard prompt for other question types
        prompt = `You are a professional UGC campaign strategist helping to fill out a campaign brief form. Generate 4-5 REALISTIC, HIGH-QUALITY, and SPECIFIC suggestions for the following question.

Current Question: ${currentQuestion}
Question Type: ${questionType}

${typeSpecificInstructions}

${
  context
    ? `CRITICAL CONTEXT - Previous answers from the user (MUST use these to create realistic, personalized suggestions):\n${context}\n\nYou MUST use ALL information from previous answers to generate highly personalized, realistic suggestions. For example:
- If they mentioned a specific product/service name, USE IT DIRECTLY in suggestions
- If they chose a platform (e.g., Instagram, TikTok), tailor suggestions SPECIFICALLY for that platform's format and audience
- If they specified demographics (age, location, interests), incorporate those EXACT details
- If they mentioned budgets, timelines, or goals, reference them specifically
- Build on their previous answers to create coherent, context-aware suggestions that feel like a real campaign brief
- Make each suggestion feel personalized and relevant to their SPECIFIC situation with concrete details\n`
    : "This is the first question. Provide realistic, professional suggestions with specific details that demonstrate real-world campaign knowledge.\n"
}

QUALITY REQUIREMENTS (CRITICAL):
- Generate 4-5 DIFFERENT suggestions (not variations of the same idea)
- Each suggestion must be REALISTIC and PROFESSIONAL - sound like real campaign briefs
- Include SPECIFIC details: product names, numbers, demographics, platforms, timelines, etc.
- Make them PRACTICAL and ACTIONABLE - ready to use immediately
- Each suggestion should be UNIQUE and offer a different professional perspective
- AVOID generic, vague, or filler content - every word must add value
- Use REAL-WORLD examples and scenarios, not hypothetical ones
- If previous answers exist, you MUST reference specific details from them
- Return ONLY the suggestions, one per line
- Do not number them or add bullet points
- Each suggestion should be valuable, distinct, and professional

EXAMPLES OF GOOD vs BAD:
BAD (Generic): "A good product description"
GOOD (Realistic): "Introduce our eco-friendly bamboo toothbrush with soft charcoal-infused bristles and biodegradable handle, designed for eco-conscious consumers aged 25-40 who prioritize sustainable lifestyle choices"

BAD (Generic): "Choose Instagram for better reach"
GOOD (Realistic): "Select Instagram Reels - ideal for your target demographic of 18-34 year-olds in urban areas who prefer short-form video content (15-30 seconds) and visual storytelling with trending audio"

Generate diverse, realistic, professional suggestions now:`;
      }

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: isBasicInfoQuestion
              ? "You are a helpful AI that generates very short keyword suggestions (1-2 words) for form fields. You provide concise, contextual, and diverse suggestions based on the question and previous answers."
              : "You are a professional UGC campaign strategist with expertise in creating realistic, high-quality campaign briefs. You generate specific, detailed, and professional suggestions that sound authentic and ready-to-use. You always include concrete details, real-world scenarios, and avoid generic or filler content.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: isBasicInfoQuestion ? 0.9 : 0.8, // Higher temperature for more variety in short suggestions
        max_tokens: isBasicInfoQuestion
          ? 100 // Much shorter for basic info questions (1-2 words each)
          : questionType === "textarea" || questionType === "scene"
          ? 500
          : 400,
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() || "";

      // Split by newlines and filter empty lines
      let suggestions = responseText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 5); // Max 5 suggestions for variety

      // For basic info questions, ensure suggestions are very short (1-2 words)
      if (isBasicInfoQuestion) {
        suggestions = suggestions.map((s) => {
          // Remove any numbering, bullets, or prefixes
          s = s.replace(/^[\d\-\*•\.]\s*/, "").trim();
          // Extract only first 2 words
          const words = s.split(/\s+/).slice(0, 2);
          return words.join(" ");
        }).filter((s) => s.length > 0);
      }

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

  async generateFollowUpQuestions(
    dto: FollowUpQuestionsRequestDto,
  ): Promise<FollowUpQuestionsResponseDto> {
    try {
      const previousAnswers = dto.previousAnswers || [];
      const answeredQuestionIds = dto.answeredQuestionIds || [];

      const answeredText = previousAnswers
        .map(
          (item, index) =>
            `${index + 1}. Question: ${item.question}\nAnswer: ${item.answer}`,
        )
        .join("\n\n");

      const answeredQuestionsList = previousAnswers
        .map((item) => item.question)
        .join(" | ");

      const answeredIdsList = answeredQuestionIds.join(" | ");

      const prompt = `You are a strategic UGC brief assistant. Use the existing Step 1 answers to discover missing details and ask ONLY new follow-up questions that deepen understanding of the product and campaign.

Existing answers (Step 1):
${answeredText || "No answers yet."}

Rules:
- Do NOT repeat or rephrase any question that has already been answered: ${
        answeredQuestionsList || "None"
      }
- Do NOT repeat questions that match these IDs (Step 1 or Step 2): ${
        answeredIdsList || "None"
      }
- Focus on filling information gaps. Consider (pick what's missing only): product purpose/deeper problem, target audience specifics, pricing/monetization, competitors/differentiators, user experience or tone, product features not covered, brand personality/storytelling angle, launch goals not mentioned.
- Every output item MUST be a question (no answers).
- Each question MUST include 3-5 SHORT suggestion ideas (2-6 words) that are relevant to the existing answers and feel like realistic placeholder ideas.
- Suggestions must be simple, varied, and contextual - avoid long phrases or repeating the exact question.
- Questions should feel natural and human, focusing on details the user has not provided yet.
- Keep total follow-up questions between 3 and 6.

Output STRICTLY as JSON with this shape:
{
  "questions": [
    {
      "id": "q_extra_1",
      "label": "What tone or personality should your product communicate?",
      "placeholder": "Describe the tone...",
      "type": "select",
      "suggestions": ["Friendly", "Professional", "Minimal", "Playful"],
      "answer": ""
    }
  ]
}
No extra fields, no explanations, no prose outside JSON.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You generate concise follow-up questions to fill information gaps for a UGC brief. You only output JSON, never prose. Each question includes 3-5 short, contextual suggestion ideas. You never answer the questions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content || "{}";

      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (error) {
        console.error("Failed to parse follow-up question response:", content);
        throw new HttpException(
          "Invalid response format from AI",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const questions = Array.isArray(parsed?.questions)
        ? parsed.questions
        : [];

      const normalized: FollowUpQuestionBlock[] = questions
        .map((item: any, index: number) => {
          const rawQuestion =
            typeof item?.question === "string"
              ? item.question.trim()
              : typeof item?.label === "string"
              ? item.label.trim()
              : undefined;

          const questionId =
            typeof item?.id === "string" && item.id.trim().length > 0
              ? item.id.trim()
              : `q_extra_${index + 1}`;

          const placeholder =
            typeof item?.placeholder === "string" && item.placeholder.trim()
              ? item.placeholder.trim()
              : "Type your answer...";

          const type =
            item?.type === "select" || item?.type === "text"
              ? item.type
              : "text";

          const suggestionList = Array.isArray(item?.suggestions)
            ? item.suggestions
            : [];

          const uniqueSuggestions = Array.from(
            new Set(
              suggestionList
                .map((s) => (typeof s === "string" ? s.trim() : ""))
                .filter((s) => s.length > 0),
            ),
          ).slice(0, 5);

          return {
            id: questionId,
            label: rawQuestion,
            placeholder,
            type,
            suggestions: uniqueSuggestions,
            answer: "",
          };
        })
        .filter(
          (item) =>
            item.label &&
            item.suggestions &&
            item.suggestions.length >= 3,
        )
        .slice(0, 6);

      if (!normalized.length) {
        throw new HttpException(
          "Failed to generate follow-up questions",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { questions: normalized };
    } catch (error) {
      console.error("Error generating follow-up questions:", error);
      throw new HttpException(
        "Failed to generate follow-up questions",
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
You MUST return ONLY the exact option name from the list above that is MOST REALISTIC and APPROPRIATE based on the context.
Choose the option that makes the most sense given the previous answers and real-world campaign scenarios.
Do NOT add any explanation, prefix, or suffix.
Just return the single best option name.`;
      } else if (questionType === "textarea") {
        typeSpecificInstructions = `This is a TEXTAREA question (multi-line text input).
Provide a REALISTIC, PROFESSIONAL answer (3-5 sentences) with SPECIFIC details.
Include concrete information: product/service specifics, target audience details, numbers, timelines, or real-world examples.
Make it detailed, professional, and ready-to-use - sound like a real campaign brief.
Do NOT add any explanation or meta-commentary.
Just return the direct, realistic answer with specific details.`;
      } else if (questionType === "text") {
        typeSpecificInstructions = `This is a TEXT question (single-line input).
Provide a REALISTIC, SPECIFIC answer (1-2 sentences) with concrete details.
Include specific names, numbers, dates, or concrete information when relevant.
Make it professional and ready-to-use - avoid generic placeholders.
Do NOT add any explanation or meta-commentary.
Just return the direct, realistic answer.`;
      } else if (questionType === "scene") {
        typeSpecificInstructions = `This is a SCENE question for video script.
Provide a REALISTIC, DETAILED scene description (3-4 sentences) with specific visual and action details.
Include specific camera angles, actions, visual elements, setting details, and pacing.
Make it professional video production quality - sound like a real video brief.
Do NOT add any explanation or meta-commentary.
Just return the direct, realistic scene description.`;
      }

      const prompt = `You are a professional UGC campaign strategist helping to fill out a campaign brief form. Generate ONE REALISTIC, HIGH-QUALITY, and SPECIFIC answer suggestion for the following question.

Current Question: ${currentQuestion}
Question Type: ${questionType}

${typeSpecificInstructions}

${
  context
    ? `CRITICAL CONTEXT - Previous answers from the user (MUST use these to create a realistic, personalized answer):\n${context}\n\nYou MUST use ALL information from previous answers to generate a highly personalized, realistic answer. For example:
- If they mentioned a specific product/service name, USE IT DIRECTLY in your answer
- If they chose a platform (e.g., Instagram, TikTok), tailor the answer SPECIFICALLY for that platform's format
- If they specified demographics (age, location, interests), incorporate those EXACT details
- If they mentioned budgets, timelines, or goals, reference them specifically with real numbers
- Build on their previous answers to create a coherent, context-aware answer that feels like a real campaign brief
- Make the answer feel personalized and relevant to their SPECIFIC situation with concrete details\n`
    : "This is the first question. Provide a realistic, professional answer with specific details that demonstrate real-world campaign knowledge.\n"
}

${userProfile ? `User Profile Data:\n${JSON.stringify(userProfile, null, 2)}\n` : ""}
${metadata ? `Additional Metadata:\n${JSON.stringify(metadata, null, 2)}\n` : ""}

QUALITY REQUIREMENTS (CRITICAL):
- Return ONLY ONE direct, realistic answer
- NO hints, NO explanations, NO meta-commentary
- NO prefixes like "You could say..." or "Try..." or "Consider..."
- Just the raw, professional answer that the user can directly use
- Make it REALISTIC and SPECIFIC with concrete details
- Include specific names, numbers, dates, demographics, or real-world examples when relevant
- For dropdown questions, return ONLY the exact option name
- Sound like a real campaign brief, not a generic placeholder

EXAMPLES OF GOOD vs BAD:
BAD (Generic): "A good product description"
GOOD (Realistic): "Introduce our eco-friendly bamboo toothbrush with soft charcoal-infused bristles and biodegradable handle, designed for eco-conscious consumers aged 25-40"

BAD (Generic): "Instagram"
GOOD (Realistic): "Instagram Reels" (if that's an option, or just "Instagram" if that's the only option)

BAD (Generic): "A video showcasing the product"
GOOD (Realistic): "A 30-second product showcase featuring the eco-friendly bamboo toothbrush's key benefits (sustainability, soft bristles, biodegradable handle) with upbeat background music, dynamic transitions between close-up shots, and ending with a call-to-action for eco-conscious consumers aged 25-40"

More examples:
- For "What is your travel budget?" → "₹15,000–₹20,000" (realistic range)
- For "Select Platform" → "Instagram Reels" (specific option)
- For "Target Audience Age" → "25-40 years" (specific range)
- For "Video Duration" → "30-45 seconds" (realistic duration)

Generate the direct, realistic, professional answer now (ONLY the answer, nothing else):`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional UGC campaign strategist with expertise in creating realistic, high-quality campaign briefs. You generate specific, detailed, and professional answers that sound authentic and ready-to-use. You always include concrete details, real-world scenarios, and avoid generic or filler content. Return ONLY the answer itself, with no explanations or meta-commentary.",
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
