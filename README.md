# 🐾 PawPal

**WhatsApp-First AI Pet Health Assistant**

PawPal is a production-ready MVP that provides personalized pet health guidance through WhatsApp. It helps pet owners understand symptoms, check food safety, assess behavior issues, and get AI-powered recommendations.

## Features

- **Symptom Analysis**: Assess pet symptoms with risk-level classification
- **Food Safety**: Check if foods are safe for cats and dogs
- **Behavior Guidance**: Understand behavioral issues and get monitoring suggestions
- **Pet Memory**: Track pet history, symptoms, and events
- **Multilingual**: Supports English and Indonesian with automatic language detection
- **Hybrid AI**: Rule-based detection first, AI fallback for accuracy + cost optimization
- **Structured Responses**: Follow-up questions, risk levels, vet recommendations
- **Conversational AI**: Natural, empathetic responses powered by OpenAI
- **WhatsApp Integration**: Seamless messaging through Baileys

## Architecture

```
WhatsApp User
    ↓
WhatsApp Cloud API (Meta)
    ↓
Webhook (Vercel)
    ↓
Language Detection (Rule-Based)
    ↓
Intent Detection (Rule-Based → AI Fallback)
    ↓
Decision Engine (Symptom/Food/Behavior)
    ↓
Response Generation (OpenAI Structured Output)
    ↓
Supabase (Storage)
    ↓
Response via Cloud API
```

**Key Design Principles:**
- Clean architecture with repository pattern
- Hybrid AI: Rule-based first, AI fallback (70% cost savings)
- Official WhatsApp Cloud API (reliable, production-ready)
- Business logic isolated from transport layer
- TypeScript strict mode
- Production-ready error handling
- Configurable AI models via environment variables
- Webhook-based (real-time, no polling)

## Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4o-mini (hybrid with rule-based)
- **WhatsApp**: WhatsApp Cloud API (official Meta API)
- **Deployment**: Vercel (all-in-one, no separate servers)
- **Language**: TypeScript (strict mode)

## Project Structure

```
src/
├── adapters/
│   └── whatsapp/
│       ├── cloud-api-client.ts    # WhatsApp Cloud API client
│       ├── baileys-client.ts      # Legacy Baileys (deprecated)
│       ├── message-handler.ts     # Legacy handler
│       └── worker.ts               # Legacy worker
├── app/
│   └── api/
│       ├── chat/route.ts          # Main chat endpoint
│       ├── health/route.ts        # Health check
│       ├── onboard/route.ts       # Pet onboarding
│       └── whatsapp/
│           └── webhook/route.ts   # WhatsApp webhook handler
├── lib/
│   ├── ai/
│   │   ├── openai.ts              # OpenAI client singleton
│   │   ├── models.ts              # Model configuration
│   │   ├── types.ts               # AI response types
│   │   ├── language-detector.ts   # Rule-based language detection
│   │   ├── rule-intent-detector.ts # Rule-based intent detection
│   │   ├── intent-extractor.ts    # AI intent classification (fallback)
│   │   └── response-generator.ts  # AI response generation
│   ├── decision-engine/
│   │   ├── symptom-engine.ts      # Symptom risk analysis
│   │   ├── food-engine.ts         # Food safety checker
│   │   └── behavior-engine.ts     # Behavior analysis
│   ├── pets/
│   │   └── pet-context.ts         # Pet context loader
│   ├── events/
│   │   └── event-logger.ts        # Event tracking
│   ├── messaging/
│   │   └── messaging-provider.ts  # Messaging abstraction
│   └── db/
│       └── supabase.ts            # Database client
├── repositories/
│   ├── user-repository.ts
│   ├── pet-repository.ts
│   ├── conversation-repository.ts
│   └── pet-event-repository.ts
├── services/
│   └── chat-service.ts            # Main orchestrator
└── types/
    └── db.ts                       # TypeScript types

supabase/
└── migrations/
    └── 20240101000000_initial_schema.sql
```

## Quick Start

### Local Development

See [SETUP.md](./SETUP.md) for detailed local setup instructions.

### WhatsApp Integration

See [WHATSAPP_CLOUD_SETUP.md](./WHATSAPP_CLOUD_SETUP.md) for WhatsApp Cloud API setup (~30 minutes).

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run migrations on Supabase
# (Upload migration file via Supabase dashboard)

# Start Next.js development server
npm run dev

# Start WhatsApp worker (separate terminal)
npm run worker
```

## API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /api/chat`
Process incoming chat messages.

**Request:**
```json
{
  "phone": "+62812345678",
  "message": "My cat is vomiting"
}
```

**Response:**
```json
{
  "intent": "SYMPTOM",
  "riskLevel": "MEDIUM",
  "reply": "I'm sorry to hear Luna isn't feeling well...",
  "needsOnboarding": false
}
```

### `POST /api/onboard`
Register a new pet.

**Request:**
```json
{
  "phone": "+62812345678",
  "petName": "Luna",
  "species": "cat",
  "breed": "Persian",
  "ageYears": 2,
  "weightKg": 4.5,
  "language": "en"
}
```

## Supported Intents

- **SYMPTOM**: Vomiting, diarrhea, lethargy, coughing, sneezing, itching, loss of appetite
- **FOOD**: Chocolate, onion, garlic, grapes, milk, tuna, chicken, etc.
- **BEHAVIOR**: Aggression, hiding, excessive meowing/barking, restlessness
- **GENERAL**: General pet care questions

## Risk Levels

- **HIGH**: Immediate veterinary attention recommended
- **MEDIUM**: Monitor closely, may need vet visit
- **LOW**: Generally safe, observe for changes

## Database Schema

- **users**: User profiles with phone and language preference
- **pets**: Pet information (name, species, breed, age, weight)
- **conversations**: Message history with intent classification
- **pet_events**: Symptom, food, and behavior event tracking

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Environment Variables

**Vercel (All Environment Variables):**
```
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini          # Optional, defaults to gpt-4o-mini
OPENAI_CLASSIFIER_MODEL=gpt-4o-mini    # Optional, defaults to gpt-4o-mini

# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN=your_access_token_from_meta
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_random_verify_token
WHATSAPP_API_VERSION=v21.0
```

### Model Switching

You can switch OpenAI models by setting environment variables:

```bash
# Use GPT-4o for better accuracy (more expensive)
OPENAI_CHAT_MODEL=gpt-4o
OPENAI_CLASSIFIER_MODEL=gpt-4o

# Use GPT-3.5-turbo for lower cost (less accurate)
OPENAI_CHAT_MODEL=gpt-3.5-turbo
OPENAI_CLASSIFIER_MODEL=gpt-3.5-turbo
```

See [AI_ARCHITECTURE.md](./AI_ARCHITECTURE.md) for detailed AI documentation.

## Important Notes

- **Never diagnoses diseases** - provides guidance only
- **Recommends veterinary care** when appropriate
- **Stores pet history** for personalized responses
- **Multilingual support** (English/Indonesian)
- **Clean separation** between WhatsApp and business logic

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
