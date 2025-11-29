# NugVerse ChatAI - UGC Brief Generation Platform

An AI-powered platform for creating professional UGC (User Generated Content) campaign briefs with intelligent suggestions and guided form experience.

## 🚀 Features

- **Step-by-step guided form** where questions appear one-by-one
- **All previous answers remain visible and editable** in a vertical feed
- **AI-powered suggestions** for every question using OpenAI GPT
- **Dynamic scene management** - add/remove unlimited video scenes
- **Professional summary generation** with AI-formatted creative brief
- **Modern, responsive UI** with smooth animations
- **Real-time state management** with Zustand
- **Full-stack TypeScript** implementation

## 📋 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **OpenAI API** - GPT-4 for suggestions and summary generation
- **TypeScript** - Type-safe development

### Frontend
- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering

## 🏗️ Project Structure

```
NugVerse-ChatAI/
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── ai/           # AI module
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── ai.module.ts
│   │   │   └── dto/      # Data transfer objects
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app directory
│   │   ├── components/  # React components
│   │   ├── config/      # Configuration files
│   │   ├── services/    # API services
│   │   └── store/       # Zustand store
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to `.env`:
```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
```

5. Start the backend:
```bash
npm run start:dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env.local` file is already configured for local development

4. Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📝 Form Questions Flow

The form follows this exact structure:

### Section 1: Product / Service Education
1. Tell the creator about the product or service
2. Product selling points, key messages
3. Link to product or service page

### Section 2: Video Information
4. Select Platform
5. Select Aspect Ratio
6. Shipping product?
7. Creator stipend needed?

### Section 3: Video Script
8. Video Overview
9. Opener / Hook
10. Scene 1
11. Scene 2
12. (Dynamic) Add more scenes
13. Ending / CTA
14. Link to references

### Section 4: Creator Preferences
15. Account type, Gender, Age range, Country, State, City, Ethnicity, Creator categories

### Section 5: Production Rules
16. Ad-lib rules
17. Wardrobe direction
18. Do's & Don'ts / Creative Direction
19. Legal Disclaimers

## 🎯 Key Features Explained

### Vertical Wizard Form
- Questions appear one-by-one below previous ones
- All answered questions remain visible and editable
- Smooth animations when new questions appear
- Progress bar shows completion status

### AI Suggestions
- Each question gets 3-5 AI-generated suggestions
- Suggestions are contextual based on previous answers
- Click any suggestion to auto-fill the answer
- Suggestions appear as interactive chips

### Dynamic Scenes
- Start with Scene 1 and Scene 2
- Add unlimited additional scenes
- Delete scenes (minimum 2 required)
- Each scene gets its own AI suggestions

### Final Summary
- AI generates a professionally formatted brief
- Uses all answers to create comprehensive summary
- Organized by sections matching the form
- Printable and exportable

## 🔌 API Endpoints

### POST `/ai/suggestions`
Generate AI suggestions for a question

**Request:**
```json
{
  "currentQuestion": "Tell the creator about the product or service",
  "previousAnswers": [
    {
      "question": "Previous question",
      "answer": "Previous answer"
    }
  ]
}
```

**Response:**
```json
{
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3"
  ]
}
```

### POST `/ai/generate-summary`
Generate final campaign brief summary

**Request:**
```json
{
  "allAnswers": [
    {
      "question": "Question text",
      "answer": "Answer text"
    }
  ]
}
```

**Response:**
```json
{
  "summary": "# Formatted markdown summary..."
}
```

## 🎨 UI Components

- **QuestionBlock** - Individual question with AI suggestions
- **SceneBlock** - Dynamic scene component with add/remove
- **FormWizard** - Main form orchestrator
- **SummaryPage** - Final brief display with markdown rendering

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev  # Hot reload enabled
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### Build for Production

Backend:
```bash
cd backend
npm run build
npm run start:prod
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## 📦 Dependencies

### Backend Key Dependencies
- `@nestjs/common`, `@nestjs/core` - NestJS framework
- `openai` - OpenAI API client
- `@nestjs/config` - Configuration management

### Frontend Key Dependencies
- `next` - Next.js framework
- `react`, `react-dom` - React library
- `zustand` - State management
- `axios` - HTTP client
- `tailwindcss` - CSS framework
- `react-markdown` - Markdown rendering

## 🐛 Troubleshooting

### Backend Issues
- Ensure OpenAI API key is valid and has credits
- Check if port 3001 is available
- Verify all dependencies are installed

### Frontend Issues
- Ensure backend is running on port 3001
- Check if port 3000 is available
- Clear `.next` cache: `rm -rf .next`

### CORS Issues
- Backend CORS is configured for `http://localhost:3000`
- Update `FRONTEND_URL` in backend `.env` if needed

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🙏 Acknowledgments

- OpenAI for GPT API
- NestJS team for the excellent framework
- Next.js team for the React framework
- Vercel for hosting and deployment tools

