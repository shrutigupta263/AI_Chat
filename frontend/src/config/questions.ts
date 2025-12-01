export interface Question {
  id: string;
  title: string;
  section: string;
  type: 'text' | 'textarea' | 'dropdown' | 'scene';
  options?: string[];
  placeholder?: string;
}

// Questions that don't need AI suggestions (context-building questions and personal choice dropdowns)
export const QUESTIONS_WITHOUT_AI_SUGGESTIONS: string[] = [
  // Context-building questions
  'product_description',
  'product_name',
  'target_audience',
  'main_problem',
  'user_access',
  'differentiator',
  'current_stage',
  'product_vibe',
  'primary_goal',
  // Personal choice questions (dropdowns and simple inputs)
  'product_link',
  'platform',
  'aspect_ratio',
  'shipping_product',
  'creator_stipend',
  'references',
  'adlib_rules',
];

export const FORM_QUESTIONS: Question[] = [
  // SECTION 0 — Context Building (No AI Suggestions)
  {
    id: 'product_description',
    title: 'Tell the creator about the product or service.',
    section: 'Context Building',
    type: 'text',
    placeholder: 'Enter a brief description...',
  },
  {
    id: 'product_name',
    title: 'What is the name of your product or service?',
    section: 'Context Building',
    type: 'text',
    placeholder: 'Enter the name...',
  },
  {
    id: 'target_audience',
    title: 'Who is your target audience or ideal user?',
    section: 'Context Building',
    type: 'text',
    placeholder: 'Describe your target audience...',
  },
  {
    id: 'main_problem',
    title: 'What main problem does your product or service solve?',
    section: 'Context Building',
    type: 'text',
    placeholder: 'Describe the main problem...',
  },
  {
    id: 'user_access',
    title: 'Where or how will users access your product or service? (Website, app, offline)',
    section: 'Context Building',
    type: 'text',
    placeholder: 'e.g., Website, mobile app, offline store...',
  },
  {
    id: 'differentiator',
    title: 'What makes your product or service different from competitors?',
    section: 'Context Building',
    type: 'text',
    placeholder: 'Describe what makes you unique...',
  },
  {
    id: 'current_stage',
    title: 'What stage are you currently in? (Idea, prototype, early users, ready to launch)',
    section: 'Context Building',
    type: 'text',
    placeholder: 'e.g., Idea, prototype, early users, ready to launch...',
  },
  {
    id: 'product_vibe',
    title: 'How would you describe the vibe or style of your product? (Professional, youthful, premium, minimalist)',
    section: 'Context Building',
    type: 'text',
    placeholder: 'e.g., Professional, youthful, premium, minimalist...',
  },
  {
    id: 'primary_goal',
    title: 'What is your primary goal right now? (Growth, awareness, sales, validation, funding)',
    section: 'Context Building',
    type: 'text',
    placeholder: 'e.g., Growth, awareness, sales, validation, funding...',
  },

  // SECTION 1 — Product / Service Education
  {
    id: 'product_selling_points',
    title: 'Product selling points, key messages',
    section: 'Product / Service Education',
    type: 'textarea',
    placeholder: 'What makes your product unique? Key messages to highlight...',
  },
  {
    id: 'product_link',
    title: 'Link to product or service page',
    section: 'Product / Service Education',
    type: 'text',
    placeholder: 'https://...',
  },

  // SECTION 2 — Video Information
  {
    id: 'platform',
    title: 'Select Platform',
    section: 'Video Information',
    type: 'dropdown',
    options: ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn', 'Twitter/X'],
  },
  {
    id: 'aspect_ratio',
    title: 'Select Aspect Ratio',
    section: 'Video Information',
    type: 'dropdown',
    options: ['4:5 (Instagram Feed)', '9:16 (Stories/Reels)', '1:1 (Square)', '16:9 (Landscape)'],
  },
  {
    id: 'shipping_product',
    title: 'Shipping product?',
    section: 'Video Information',
    type: 'dropdown',
    options: ['Yes', 'No'],
  },
  {
    id: 'creator_stipend',
    title: 'Creator stipend needed?',
    section: 'Video Information',
    type: 'dropdown',
    options: ['Yes', 'No'],
  },

  // SECTION 3 — Video Script
  {
    id: 'video_overview',
    title: 'Video Overview',
    section: 'Video Script',
    type: 'textarea',
    placeholder: 'Describe the overall concept and flow of the video...',
  },
  {
    id: 'video_opener',
    title: 'Opener / Hook',
    section: 'Video Script',
    type: 'textarea',
    placeholder: 'How should the video start? What hook will grab attention?',
  },
  {
    id: 'scene_1',
    title: 'Scene 1',
    section: 'Video Script',
    type: 'scene',
    placeholder: 'Describe what happens in this scene...',
  },
  {
    id: 'scene_2',
    title: 'Scene 2',
    section: 'Video Script',
    type: 'scene',
    placeholder: 'Describe what happens in this scene...',
  },
  {
    id: 'video_ending',
    title: 'Ending / CTA',
    section: 'Video Script',
    type: 'textarea',
    placeholder: 'How should the video end? What call-to-action?',
  },
  {
    id: 'references',
    title: 'Link to references (optional)',
    section: 'Video Script',
    type: 'text',
    placeholder: 'Links to reference videos, inspiration, etc...',
  },

  // SECTION 4 — Production Rules
  {
    id: 'adlib_rules',
    title: 'Can the creator ad-lib or must they read the script verbatim?',
    section: 'Production Rules',
    type: 'dropdown',
    options: ['Can ad-lib', 'Must follow script verbatim', 'Can ad-lib with key points'],
  },
  {
    id: 'wardrobe',
    title: 'Wardrobe direction',
    section: 'Production Rules',
    type: 'textarea',
    placeholder: 'What should the creator wear? Any style guidelines?',
  },
  {
    id: 'creative_direction',
    title: "Do's & Don'ts / Creative Direction",
    section: 'Production Rules',
    type: 'textarea',
    placeholder: 'Any specific do\'s and don\'ts for the creator...',
  },
  {
    id: 'legal_disclaimers',
    title: 'Legal Disclaimers',
    section: 'Production Rules',
    type: 'textarea',
    placeholder: 'Any legal disclaimers or compliance requirements...',
  },
];

