# NugVerse Backend (NestJS)

Backend API for UGC Brief Generation platform with OpenAI integration.

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run start:dev
```

Server will run on `http://localhost:3001`

## 📁 Project Structure

```
src/
├── ai/                      # AI Module
│   ├── ai.controller.ts    # REST endpoints
│   ├── ai.service.ts       # Business logic & OpenAI integration
│   ├── ai.module.ts        # Module definition
│   └── dto/                # Data Transfer Objects
│       ├── suggestions.dto.ts
│       └── summary.dto.ts
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

## 🔌 API Endpoints

### 1. Generate Suggestions

**Endpoint:** `POST /ai/suggestions`

**Description:** Generate AI-powered suggestions for a form question based on context from previous answers.

**Request Body:**
```json
{
  "currentQuestion": "Tell the creator about the product or service",
  "previousAnswers": [
    {
      "question": "Select Platform",
      "answer": "Instagram"
    }
  ]
}
```

**Response:**
```json
{
  "suggestions": [
    "Introduce our new eco-friendly skincare line that hydrates and protects",
    "Share details about our premium coffee subscription service",
    "Explain our innovative fitness app with personalized workouts"
  ]
}
```

**Features:**
- Uses GPT-4o-mini for fast, cost-effective suggestions
- Provides 3-5 contextual suggestions
- Considers all previous answers for relevance
- Temperature: 0.8 for creative variety

### 2. Generate Summary

**Endpoint:** `POST /ai/generate-summary`

**Description:** Generate a professionally formatted UGC creative brief from all form answers.

**Request Body:**
```json
{
  "allAnswers": [
    {
      "question": "Tell the creator about the product or service",
      "answer": "Our new eco-friendly water bottle..."
    },
    {
      "question": "Product selling points, key messages",
      "answer": "100% recyclable, keeps drinks cold for 24 hours..."
    }
  ]
}
```

**Response:**
```json
{
  "summary": "### Product / Service Education\n\n- **Product description:** Our new eco-friendly water bottle...\n\n### Video Information\n\n- **Platform:** Instagram..."
}
```

**Features:**
- Uses GPT-4o for high-quality output
- Structured markdown formatting
- Organized by form sections
- Professional brief layout
- Temperature: 0.7 for balanced creativity

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3001 |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:3000 |

### OpenAI Configuration

The service uses two OpenAI models:

1. **Suggestions** - `gpt-4o-mini`
   - Fast and cost-effective
   - Max tokens: 300
   - Temperature: 0.8

2. **Summary** - `gpt-4o`
   - High-quality output
   - Max tokens: 2000
   - Temperature: 0.7

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod

# Run linter
npm run lint

# Format code
npm run format
```

### Module Architecture

The backend follows NestJS modular architecture:

1. **App Module** - Root module that imports all feature modules
2. **AI Module** - Handles all AI-related functionality
3. **Config Module** - Global configuration management

### Adding New Features

1. Create a new module:
```bash
nest g module feature-name
```

2. Generate controller and service:
```bash
nest g controller feature-name
nest g service feature-name
```

3. Import the module in `app.module.ts`

## 📊 Error Handling

The service includes comprehensive error handling:

- Invalid requests return appropriate HTTP status codes
- OpenAI errors are caught and logged
- User-friendly error messages returned to frontend

## 🔒 CORS Configuration

CORS is enabled for the frontend URL specified in environment variables:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

## 📝 DTO Validation

All endpoints use DTOs (Data Transfer Objects) for type safety:

- `SuggestionsRequestDto` / `SuggestionsResponseDto`
- `SummaryRequestDto` / `SummaryResponseDto`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start:prod
```

### Environment Setup

Ensure these environment variables are set in production:
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (optional)
- `FRONTEND_URL` - Production frontend URL

## 📈 Performance

- Suggestions endpoint: ~1-2 seconds
- Summary endpoint: ~3-5 seconds (depending on content length)
- Includes proper error handling and timeouts

## 🐛 Troubleshooting

### OpenAI API Errors

```
Error: OPENAI_API_KEY is not defined
```
**Solution:** Add your OpenAI API key to `.env` file

### CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update `FRONTEND_URL` in `.env` to match your frontend URL

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Change the `PORT` in `.env` or kill the process using port 3001

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

