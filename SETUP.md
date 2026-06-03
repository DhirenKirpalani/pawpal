# PawPal Setup Guide

Complete setup instructions for local development and testing.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API account
- DigitalOcean account (for production WhatsApp worker)
- WhatsApp account for Baileys

## Step 1: Clone and Install

```bash
cd pawpal
npm install
```

## Step 2: Supabase Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning

### Run Database Migration

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy contents from `supabase/migrations/20240101000000_initial_schema.sql`
4. Paste and run the migration
5. Verify tables were created in **Table Editor**

### Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

## Step 3: OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add credits to your account
4. Copy the API key

## Step 4: Environment Variables

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API URL (for worker)
API_URL=http://localhost:3000/api/chat
```

## Step 5: Test Next.js API

Start the development server:

```bash
npm run dev
```

Visit http://localhost:3000 - you should see "PawPal" homepage.

### Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok"}
```

### Test Onboarding

```bash
curl -X POST http://localhost:3000/api/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "petName": "Luna",
    "species": "cat",
    "breed": "Persian",
    "ageYears": 2,
    "weightKg": 4.5,
    "language": "en"
  }'
```

### Test Chat Endpoint

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "message": "My cat is vomiting"
  }'
```

Expected response includes `intent`, `riskLevel`, and `reply`.

## Step 6: WhatsApp Worker Setup

### Start Worker Locally

In a **separate terminal**:

```bash
npm run worker
```

### First-Time Authentication

1. Worker will display a QR code in terminal
2. Open WhatsApp on your phone
3. Go to **Settings** → **Linked Devices**
4. Tap **Link a Device**
5. Scan the QR code

### Verify Connection

Once connected, you'll see:
```
WhatsApp connection established
```

Authentication is saved in `./sessions` folder and persists across restarts.

### Test WhatsApp Integration

Send a message to your WhatsApp number:

```
My cat is vomiting
```

You should receive an AI-generated response.

## Step 7: Verify Database

Check Supabase dashboard:

1. **Table Editor** → **users**: Should have your phone number
2. **Table Editor** → **pets**: Should have your pet
3. **Table Editor** → **conversations**: Should have your message
4. **Table Editor** → **pet_events**: Should have symptom event

## Common Issues

### TypeScript Errors

Run:
```bash
npm install
```

All TypeScript errors should resolve after installing dependencies.

### Supabase Connection Error

- Verify environment variables are correct
- Check Supabase project is active
- Ensure service role key (not anon key) is used for server operations

### OpenAI API Error

- Verify API key is valid
- Check you have credits
- Ensure no rate limiting

### WhatsApp QR Code Not Showing

- Check terminal output for errors
- Ensure no other WhatsApp Web sessions are active
- Try deleting `./sessions` folder and restarting

### Worker Can't Connect to API

- Verify Next.js dev server is running on port 3000
- Check `API_URL` in `.env` is correct
- Ensure no firewall blocking localhost

## Development Workflow

### Terminal 1: Next.js
```bash
npm run dev
```

### Terminal 2: WhatsApp Worker
```bash
npm run worker
```

### Terminal 3: Testing
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "message": "Can cats eat chocolate?"}'
```

## Next Steps

- Test different intents (symptom, food, behavior)
- Try Indonesian language responses
- Review conversation history in Supabase
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Support

If you encounter issues:
1. Check environment variables
2. Verify all services are running
3. Check Supabase and OpenAI dashboards
4. Review terminal logs for errors
