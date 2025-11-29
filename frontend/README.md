# NugVerse Frontend (Next.js)

Modern Next.js frontend for the UGC Brief Generation platform with AI-powered suggestions.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. The `.env.local` file is pre-configured for local development

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── FormWizard.tsx    # Main form orchestrator
│   ├── QuestionBlock.tsx # Individual question component
│   ├── SceneBlock.tsx    # Dynamic scene component
│   └── SummaryPage.tsx   # Final summary display
├── config/               # Configuration files
│   └── questions.ts      # Form questions definition
├── services/             # API services
│   └── api.ts           # Backend API calls
└── store/               # State management
    └── formStore.ts     # Zustand store
```

## 🎨 Key Components

### FormWizard
Main component that orchestrates the entire form flow.

**Features:**
- Renders questions one-by-one
- Manages question progression
- Handles scene sections
- Shows progress indicator

### QuestionBlock
Individual question component with AI suggestions.

**Props:**
- `question` - Question configuration
- `isActive` - Whether this question is currently active
- `onNext` - Callback for next button
- `isLastQuestion` - Flag for last question

**Features:**
- Text input, textarea, or dropdown based on type
- AI suggestions as clickable chips
- Editable even after answering
- Visual feedback for active/inactive state

### SceneBlock
Dynamic scene component for video script sections.

**Props:**
- `sceneId` - Unique scene identifier
- `sceneNumber` - Display number
- `isActive` - Whether editing is enabled
- `canDelete` - Whether delete button is shown

**Features:**
- Add unlimited scenes
- Remove scenes (min 2 required)
- AI suggestions for each scene
- Auto-saves to form state

### SummaryPage
Final summary display with AI-generated brief.

**Features:**
- AI-generated professional brief
- Markdown rendering
- Print/PDF export
- Start over functionality
- Clean, readable formatting

## 🔄 State Management (Zustand)

### Store Structure

```typescript
interface FormState {
  answers: Answer[];              // All form answers
  currentQuestionIndex: number;   // Current question position
  scenes: Scene[];                // Dynamic scenes list
  isComplete: boolean;            // Form completion status
  
  // Actions
  setAnswer: (id, title, value) => void;
  updateAnswer: (id, value) => void;
  nextQuestion: () => void;
  addScene: () => void;
  removeScene: (id) => void;
  updateScene: (id, content) => void;
  completeForm: () => void;
  resetForm: () => void;
  getAnswerById: (id) => Answer | undefined;
}
```

### Usage Example

```typescript
import { useFormStore } from '@/store/formStore';

function MyComponent() {
  const { answers, setAnswer, nextQuestion } = useFormStore();
  
  const handleSubmit = () => {
    setAnswer('question_id', 'Question Title', 'User answer');
    nextQuestion();
  };
}
```

## 🎯 Form Configuration

Questions are defined in `/src/config/questions.ts`:

```typescript
export interface Question {
  id: string;              // Unique identifier
  title: string;           // Question text
  section: string;         // Section name
  type: 'text' | 'textarea' | 'dropdown' | 'scene';
  options?: string[];      // Dropdown options
  placeholder?: string;    // Input placeholder
}
```

## 🌐 API Integration

### API Service (`/src/services/api.ts`)

```typescript
// Get AI suggestions
const suggestions = await getSuggestions({
  currentQuestion: "Question text",
  previousAnswers: [
    { question: "Q1", answer: "A1" }
  ]
});

// Generate summary
const summary = await generateSummary({
  allAnswers: [
    { question: "Q1", answer: "A1" }
  ]
});
```

### Configuration

Backend URL is configured in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎨 Styling (TailwindCSS)

### Custom Animations

Defined in `tailwind.config.js`:

```javascript
animation: {
  'slide-in': 'slideIn 0.4s ease-out',
  'fade-in': 'fadeIn 0.3s ease-out',
}
```

### Theme

- Primary color: Blue (#2563eb)
- Secondary color: Purple (#9333ea)
- Clean, modern design
- Smooth transitions
- Responsive layouts

### Key Classes

```css
.animate-slide-in    // Question slide-in animation
.animate-fade-in     // Fade-in for suggestions
```

## 📱 Responsive Design

The UI is fully responsive:

- Desktop: Optimal layout with max-width containers
- Tablet: Adjusted spacing and font sizes
- Mobile: Single-column layout, touch-friendly buttons

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Hot Reload

Next.js supports hot module replacement out of the box. Changes to components will reflect immediately.

## 🎭 Form Flow

1. User sees first question
2. AI suggestions load automatically
3. User selects suggestion or types answer
4. Clicks "Next" - answer is saved
5. Next question appears BELOW (vertical feed)
6. Previous questions remain visible and editable
7. When editing previous answer, state updates immediately
8. Continue until all sections complete
9. Final summary generated by AI

## 🎬 Dynamic Scenes Feature

Scenes section appears after Question 9 (Opener/Hook):

1. Shows Scene 1 and Scene 2 by default
2. Each scene has its own AI suggestions
3. "Add Another Scene" button appears
4. Click to add Scene 3, Scene 4, etc.
5. Each scene (except first 2) has delete button
6. Minimum 2 scenes always required
7. All scenes saved to form state

## 📄 Summary Generation

When user completes all questions:

1. Form transitions to `SummaryPage`
2. Loading animation shows while generating
3. Backend called with all answers
4. AI formats into professional brief
5. Markdown rendered with proper styling
6. Print/Export functionality available

## 🎨 UI/UX Features

### Visual Feedback
- Active questions have full opacity
- Inactive questions are slightly dimmed
- Edit indicator shows on completed questions
- Progress bar shows completion percentage

### Animations
- Smooth slide-in for new questions
- Fade-in for AI suggestions
- Transition effects on buttons
- Loading states for async operations

### Interactive Elements
- Clickable suggestion chips
- Hover effects on buttons
- Focus states on inputs
- Disabled states with visual feedback

## 🐛 Troubleshooting

### API Connection Issues

```
Error: Network Error
```
**Solution:** Ensure backend is running on port 3001

### Build Errors

```
Error: Cannot find module '@/...'
```
**Solution:** Check `tsconfig.json` paths configuration

### Styling Not Applied

```
Tailwind classes not working
```
**Solution:** 
1. Check `tailwind.config.js` content paths
2. Ensure PostCSS is configured
3. Restart dev server

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Performance Optimization

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Lazy loading for heavy components
- Efficient re-renders with Zustand
- Memoized components where needed

## 🔒 Best Practices

1. **State Management**
   - Use Zustand for global state
   - Keep component state local when possible

2. **Component Design**
   - Keep components small and focused
   - Use TypeScript for type safety
   - Props validation

3. **Styling**
   - Use Tailwind utility classes
   - Custom animations in config
   - Consistent color scheme

4. **API Calls**
   - Centralized in `/services/api.ts`
   - Error handling
   - Loading states

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [React Markdown](https://github.com/remarkjs/react-markdown)

