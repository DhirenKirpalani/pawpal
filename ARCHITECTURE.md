# PawPal Architecture Documentation

## System Overview

PawPal is a WhatsApp-first AI pet health assistant built with clean architecture principles. The system is designed for easy maintenance, testing, and future migration to WhatsApp Cloud API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
│                     (WhatsApp Users)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Transport Layer                           │
│              (Baileys - DigitalOcean Droplet)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  baileys-client.ts  │  message-handler.ts           │   │
│  │  - WhatsApp socket  │  - API communication          │   │
│  │  - QR auth          │  - Error handling             │   │
│  │  - Reconnection     │                               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP POST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│                  (Next.js - Vercel)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/chat    │  /api/onboard  │  /api/health      │   │
│  │  - Validation │  - Pet setup   │  - Health check   │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│                   (chat-service.ts)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Orchestrates:                                        │   │
│  │  1. User/Pet loading                                 │   │
│  │  2. Intent extraction                                │   │
│  │  3. Decision engine execution                        │   │
│  │  4. Response generation                              │   │
│  │  5. Event logging                                    │   │
│  │  6. Conversation storage                             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬──────────────────┬────────────────┬────────────┘
             │                  │                │
             ▼                  ▼                ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   AI Layer       │  │ Decision     │  │  Data Layer      │
│   (OpenAI)       │  │ Engines      │  │  (Repositories)  │
│                  │  │              │  │                  │
│ - Intent         │  │ - Symptom    │  │ - User           │
│   Extractor      │  │ - Food       │  │ - Pet            │
│ - Response       │  │ - Behavior   │  │ - Conversation   │
│   Generator      │  │              │  │ - Pet Events     │
└──────────────────┘  └──────────────┘  └────────┬─────────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │    Supabase      │
                                        │   PostgreSQL     │
                                        └──────────────────┘
```

## Layer Responsibilities

### 1. Transport Layer (Baileys Worker)

**Location**: `src/adapters/whatsapp/`

**Responsibilities**:
- Maintain WhatsApp connection
- Handle authentication (QR code)
- Receive incoming messages
- Forward messages to API
- Send responses back to users
- Manage reconnection logic
- Persist session data

**Key Files**:
- `baileys-client.ts`: WhatsApp socket management
- `message-handler.ts`: API communication
- `worker.ts`: Entry point and process management

**Design Decision**: Completely isolated from business logic. Can be replaced with WhatsApp Cloud API by only changing this layer.

### 2. API Layer (Next.js Routes)

**Location**: `src/app/api/`

**Responsibilities**:
- HTTP request handling
- Input validation (Zod)
- Error handling
- Response formatting
- Rate limiting (future)

**Endpoints**:
- `POST /api/chat`: Main message processing
- `POST /api/onboard`: Pet registration
- `GET /api/health`: System health check

**Design Decision**: Thin layer that delegates to service layer. No business logic here.

### 3. Service Layer

**Location**: `src/services/`

**Responsibilities**:
- Orchestrate business logic
- Coordinate between layers
- Transaction management
- Error handling and recovery

**Key File**: `chat-service.ts`

**Flow**:
1. Load/create user
2. Check for pet (onboarding if needed)
3. Load pet context
4. Extract intent (AI)
5. Run decision engine
6. Generate response (AI)
7. Save conversation
8. Log events
9. Return response

**Design Decision**: Single responsibility - orchestration only. Delegates specific tasks to specialized components.

### 4. AI Layer

**Location**: `src/lib/ai/`

**Responsibilities**:
- Intent classification
- Response generation
- Structured output parsing

**Components**:

**IntentExtractor** (`intent-extractor.ts`):
- Uses OpenAI structured output
- Classifies into: SYMPTOM, FOOD, BEHAVIOR, GENERAL
- Extracts entities (symptoms, foods, behaviors)
- Assesses urgency

**ResponseGenerator** (`response-generator.ts`):
- Generates natural language responses
- Personalizes with pet name
- Supports English/Indonesian
- Never diagnoses diseases
- Recommends vet care when appropriate

**Design Decision**: Isolated AI logic. Easy to swap models or providers.

### 5. Decision Engine Layer

**Location**: `src/lib/decision-engine/`

**Responsibilities**:
- Rule-based analysis
- Risk assessment
- Follow-up question generation

**Engines**:

**SymptomEngine** (`symptom-engine.ts`):
- Analyzes symptom combinations
- Classifies risk (LOW/MEDIUM/HIGH)
- Generates follow-up questions
- Recommends vet when needed

**FoodEngine** (`food-engine.ts`):
- Checks food safety database
- Species-specific rules (cat/dog)
- Toxicity assessment
- Action recommendations

**BehaviorEngine** (`behavior-engine.ts`):
- Behavior pattern analysis
- Possible causes identification
- Monitoring suggestions
- Risk assessment

**Design Decision**: Deterministic rules complement AI. Fast, predictable, and testable.

### 6. Data Layer

**Location**: `src/repositories/`

**Responsibilities**:
- Database operations
- Data access abstraction
- Query optimization

**Repositories**:
- `user-repository.ts`: User CRUD
- `pet-repository.ts`: Pet CRUD
- `conversation-repository.ts`: Message history
- `pet-event-repository.ts`: Event tracking

**Design Decision**: Repository pattern isolates database logic. Easy to test and swap databases.

### 7. Supporting Layers

**Pet Context** (`src/lib/pets/pet-context.ts`):
- Loads pet profile
- Retrieves recent conversations
- Fetches recent events
- Provides context for AI

**Event Logger** (`src/lib/events/event-logger.ts`):
- Logs symptoms
- Logs food incidents
- Logs behavior events
- Automatic event creation

**Messaging Abstraction** (`src/lib/messaging/`):
- Interface for messaging providers
- Decouples business logic from WhatsApp
- Enables future migration

## Data Flow

### Incoming Message Flow

```
1. User sends WhatsApp message
   ↓
2. Baileys receives message
   ↓
3. Worker forwards to /api/chat
   ↓
4. API validates request
   ↓
5. ChatService orchestrates:
   a. Load user (create if new)
   b. Load pet (onboarding if needed)
   c. Load pet context
   d. Extract intent (OpenAI)
   e. Run decision engine
   f. Generate response (OpenAI)
   g. Save conversation
   h. Log events
   ↓
6. API returns response
   ↓
7. Worker sends via Baileys
   ↓
8. User receives WhatsApp message
```

### Database Interaction Flow

```
ChatService
    ↓
Repositories
    ↓
Supabase Client
    ↓
PostgreSQL
```

## Key Design Patterns

### 1. Repository Pattern
Abstracts data access. All database queries go through repositories.

### 2. Dependency Injection
Services receive dependencies via constructor. Easy to test and swap.

### 3. Strategy Pattern
Decision engines implement different analysis strategies.

### 4. Adapter Pattern
Messaging provider abstracts WhatsApp implementation.

### 5. Service Layer Pattern
Business logic centralized in services, not scattered.

## Technology Choices

### Why Next.js?
- Serverless API routes (Vercel)
- TypeScript support
- Easy deployment
- Auto-scaling

### Why Supabase?
- PostgreSQL (reliable, powerful)
- Real-time capabilities (future)
- Built-in auth (future)
- Generous free tier

### Why OpenAI?
- Best-in-class language understanding
- Structured output support
- Reliable API
- Good documentation

### Why Baileys?
- Free WhatsApp integration
- No official API approval needed
- Active community
- Session persistence

### Why DigitalOcean for Worker?
- Baileys needs persistent connection
- Vercel serverless not suitable
- Affordable ($6/month)
- Easy setup

## Scalability Considerations

### Current Limits
- Single Baileys instance: ~1000 messages/hour
- Vercel: Auto-scales
- Supabase free tier: 500MB database, 2GB bandwidth
- OpenAI: Rate limits depend on tier

### Scaling Strategy

**Phase 1** (0-1000 users):
- Current architecture sufficient
- Monitor costs

**Phase 2** (1000-10,000 users):
- Upgrade Supabase to Pro
- Larger DigitalOcean droplet
- OpenAI tier upgrade

**Phase 3** (10,000+ users):
- Multiple Baileys workers with load balancer
- Database read replicas
- Caching layer (Redis)
- Consider WhatsApp Cloud API migration

## Security

### Current Implementation
- Environment variables for secrets
- Supabase service role key (server-side only)
- Input validation (Zod)
- Error boundaries
- No hardcoded credentials

### Future Enhancements
- Rate limiting per user
- Request authentication
- Row-level security (Supabase)
- Audit logging
- Data encryption at rest

## Testing Strategy

### Unit Tests (Future)
- Decision engines (pure functions)
- Repositories (mock database)
- Intent extraction (mock OpenAI)

### Integration Tests (Future)
- API endpoints
- Database operations
- End-to-end flows

### Manual Testing
- WhatsApp message scenarios
- Different intents
- Edge cases
- Error conditions

## Migration Path to WhatsApp Cloud API

When ready to migrate:

1. **No changes needed**:
   - Service layer
   - AI layer
   - Decision engines
   - Repositories
   - API routes

2. **Changes needed**:
   - `src/adapters/whatsapp/` only
   - Implement new `MessagingProvider`
   - Update worker to use Cloud API
   - Update deployment (no DigitalOcean needed)

**Estimated effort**: 1-2 days

This is the power of clean architecture.

## Monitoring and Observability

### Current
- Vercel logs (API requests)
- PM2 logs (worker)
- Supabase dashboard (database)
- OpenAI dashboard (usage)

### Future
- Structured logging
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Cost tracking

## Maintenance

### Regular Tasks
- Monitor OpenAI costs
- Check Supabase storage
- Review error logs
- Update dependencies
- Backup WhatsApp sessions

### Updates
- Vercel: Auto-deploy on git push
- Worker: Manual deploy (git pull + restart)
- Database: Migrations via Supabase

## Conclusion

PawPal's architecture prioritizes:
- **Maintainability**: Clean separation of concerns
- **Testability**: Isolated components
- **Scalability**: Layer-based scaling
- **Flexibility**: Easy to swap implementations
- **Production-readiness**: Error handling, logging, monitoring

The architecture supports the current MVP while enabling future growth and feature additions.
