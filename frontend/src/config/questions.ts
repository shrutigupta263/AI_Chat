export interface Question {
  id: string;
  title: string;
  section: string;
  type: 'text' | 'textarea' | 'dropdown' | 'scene';
  options?: string[];
  placeholder?: string;
}

// Questions that don't need AI suggestions (simple dropdowns, yes/no questions)
export const QUESTIONS_WITHOUT_AI_SUGGESTIONS = [
  'platform',
  'aspect_ratio',
  'shipping_product',
  'creator_stipend',
  'account_type',
  'gender',
  'age_range',
  'country',
  'state',
  'city',
  'ethnicity',
  'adlib_rules',
];

export const FORM_QUESTIONS: Question[] = [
  // SECTION 1 — Product / Service Education
  {
    id: 'product_description',
    title: 'Tell the creator about the product or service',
    section: 'Product / Service Education',
    type: 'textarea',
    placeholder: 'Describe your product or service in detail...',
  },
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

  // SECTION 4 — Creator Preferences
  {
    id: 'account_type',
    title: 'Account type',
    section: 'Creator Preferences',
    type: 'dropdown',
    options: ['Personal', 'Business', 'Creator', 'Any'],
  },
  {
    id: 'gender',
    title: 'Gender',
    section: 'Creator Preferences',
    type: 'dropdown',
    options: ['Male', 'Female', 'Non-binary', 'Any'],
  },
  {
    id: 'age_range',
    title: 'Age range',
    section: 'Creator Preferences',
    type: 'dropdown',
    options: ['18-24', '25-34', '35-44', '45-54', '55+', 'Any'],
  },
  {
    id: 'country',
    title: 'Country',
    section: 'Creator Preferences',
    type: 'dropdown',
    options: ['United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Any'],
  },
  {
    id: 'state',
    title: 'State',
    section: 'Creator Preferences',
    type: 'dropdown',
    options: [], // Dynamic options based on country selection
  },
  {
    id: 'city',
    title: 'City',
    section: 'Creator Preferences',
    type: 'dropdown',
    options: [], // Dynamic options based on state selection
  },
  {
    id: 'ethnicity',
    title: 'Ethnicity',
    section: 'Creator Preferences',
    type: 'dropdown',
    options: ['Asian', 'Black', 'Hispanic/Latino', 'White', 'Mixed', 'Any'],
  },
  {
    id: 'creator_categories',
    title: 'Creator categories',
    section: 'Creator Preferences',
    type: 'text',
    placeholder: 'e.g., Beauty, Fashion, Tech, Fitness, Lifestyle...',
  },

  // SECTION 5 — Production Rules
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

