# WhatsApp Cloud API Setup Guide

## Overview

This guide will help you set up WhatsApp Cloud API for PawPal in ~30 minutes. This replaces the Baileys integration with the official Meta WhatsApp Business API.

## Prerequisites

- Meta Business Account
- Facebook Developer Account
- Phone number for WhatsApp Business (can use test number initially)

## Step 1: Create Meta App (5 min)

1. Go to https://developers.facebook.com/apps
2. Click **Create App**
3. Select **Business** as app type
4. Fill in app details:
   - **App Name**: PawPal
   - **Contact Email**: your@email.com
5. Click **Create App**

## Step 2: Add WhatsApp Product (2 min)

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Select your **Business Portfolio** (or create one if you don't have)

## Step 3: Get Temporary Access Token (1 min)

1. Navigate to **WhatsApp > Getting Started**
2. You'll see a test phone number and temporary access token
3. Copy the following:
   - **Temporary Access Token**
   - **Phone Number ID**
   - **Test Number** (for initial testing)

**Add to your `.env` file:**
```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=pawpal_verify_random_string_123
```

> **Note**: The verify token can be any random string you create. You'll use it in Step 5.

## Step 4: Test Sending Messages (2 min)

Before setting up webhooks, test that you can send messages:

1. In **WhatsApp > Getting Started**
2. Add your personal phone number to the **To** field
3. Click **Send Message**
4. You should receive a "Hello World" message on WhatsApp

✅ If you received the message, your access token is working!

## Step 5: Deploy to Vercel (5 min)

Before setting up webhooks, you need to deploy your app:

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click **New Project**
4. Import your GitHub repository
5. Add environment variables:
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_CHAT_MODEL=gpt-4o-mini
   OPENAI_CLASSIFIER_MODEL=gpt-4o-mini
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   WHATSAPP_VERIFY_TOKEN=pawpal_verify_random_string_123
   ```
6. Click **Deploy**
7. Copy your deployment URL (e.g., `https://pawpal.vercel.app`)

## Step 6: Set Up Webhook (5 min)

Now configure Meta to send incoming messages to your app:

1. In **WhatsApp > Configuration**
2. Click **Edit** next to Webhook
3. Enter:
   - **Callback URL**: `https://your-app.vercel.app/api/whatsapp/webhook`
   - **Verify Token**: The same token you set in `.env` (e.g., `pawpal_verify_random_string_123`)
4. Click **Verify and Save**

✅ You should see "Webhook verified successfully"

5. Subscribe to webhook fields:
   - Check **messages** (required for receiving messages)
6. Click **Save**

## Step 7: Test End-to-End (2 min)

Now test the complete flow:

1. Send a WhatsApp message to the test number
2. Message: `My dog is vomiting`
3. Check Vercel logs (Vercel Dashboard > Your Project > Logs)
4. You should see:
   - Webhook received
   - Message processed
   - Reply sent
5. You should receive an AI-powered response on WhatsApp!

✅ If you got a response, everything is working!

## Step 8: Add Your Own Phone Number (10 min)

The test number is limited to 5 recipients. To use your own number:

### Option A: Use Your Own Number

1. In **WhatsApp > API Setup**
2. Click **Add Phone Number**
3. Enter your business phone number
4. Verify with SMS code
5. Copy the new **Phone Number ID**
6. Update `.env`:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=your_new_phone_number_id
   ```
7. Redeploy to Vercel

### Option B: Continue with Test Number

- Good for initial testing
- Limited to 5 test recipients
- Add recipients in **WhatsApp > Getting Started > To** field

## Step 9: Create Permanent Access Token (5 min)

Temporary tokens expire in 24 hours. Create a permanent one:

1. Go to **Meta Business Suite** > **Business Settings**
2. Navigate to **Users > System Users**
3. Click **Add** to create a system user
4. Name it **PawPal API**
5. Assign **Admin** role
6. Click on the system user you just created
7. Click **Generate New Token**
8. Select your app from the dropdown
9. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
10. Click **Generate Token**
11. Copy the token (save it securely!)
12. Update `.env`:
    ```env
    WHATSAPP_ACCESS_TOKEN=your_permanent_token
    ```
13. Redeploy to Vercel

## Step 10: Business Verification (Optional - for Production)

For higher message limits and production use:

1. Go to **Meta Business Suite** > **Business Settings**
2. Navigate to **Security Center > Business Verification**
3. Click **Start Verification**
4. Upload required documents:
   - Business registration document
   - Tax ID
   - Proof of address
5. Wait for Meta review (1-3 business days)

## Troubleshooting

### Webhook Not Receiving Messages

**Problem**: Messages sent to WhatsApp number don't trigger webhook

**Solutions**:
- Check Vercel logs for errors
- Verify webhook URL is correct: `https://your-app.vercel.app/api/whatsapp/webhook`
- Ensure `messages` field is subscribed in webhook configuration
- Verify that verify token matches between Meta and `.env`
- Test webhook verification: `GET https://your-app.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test`

### Messages Not Sending

**Problem**: Webhook receives messages but doesn't send replies

**Solutions**:
- Verify access token is valid and not expired
- Check phone number ID is correct
- Ensure recipient is added to test recipients (for test numbers)
- Check Vercel logs for API errors
- Test API directly:
  ```bash
  curl -X POST https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "messaging_product": "whatsapp",
      "to": "RECIPIENT_PHONE",
      "type": "text",
      "text": { "body": "Test message" }
    }'
  ```

### 403 Forbidden on Webhook Verification

**Problem**: Webhook verification fails

**Solutions**:
- Verify token in `.env` must match exactly with Meta configuration
- Check for typos or extra spaces
- Redeploy to Vercel after updating `.env`
- Test GET endpoint manually

### OpenAI Quota Exceeded

**Problem**: Messages received but no AI response

**Solutions**:
- Add credits to OpenAI account
- Check OpenAI API key is valid
- Review OpenAI usage dashboard

## Production Checklist

Before going live:

- [ ] Business verification completed
- [ ] Permanent access token created
- [ ] Own phone number added (not test number)
- [ ] Webhook configured and tested
- [ ] Environment variables set in Vercel
- [ ] OpenAI credits added
- [ ] Supabase database configured
- [ ] Message templates created (optional, for notifications)
- [ ] Rate limits understood
- [ ] Payment method added to Meta (for scaling beyond free tier)

## Costs

### WhatsApp Cloud API

**Free Tier:**
- 1,000 conversations/month (free forever)
- Conversation = 24-hour window with a user

**Paid Tier:**
- $0.005 - $0.09 per conversation (varies by country)
- Much cheaper than SMS
- Only charged for business-initiated conversations after 24 hours

### OpenAI

**With Hybrid AI (Rule-Based + AI Fallback):**
- ~$0.70/month for 10,000 messages
- 70% cost savings vs pure AI

### Total Estimated Cost

**10,000 messages/month:**
- WhatsApp: Free (within 1,000 conversations)
- OpenAI: ~$0.70
- **Total: ~$0.70/month**

**100,000 messages/month:**
- WhatsApp: ~$50 (assuming 5,000 conversations)
- OpenAI: ~$7
- **Total: ~$57/month**

## Architecture

### Before (Baileys)

```
WhatsApp User
    ↓
Baileys Worker (DigitalOcean) ❌ Connection issues
    ↓
Vercel API
    ↓
Response
```

### After (Cloud API)

```
WhatsApp User
    ↓
WhatsApp Cloud API (Meta) ✅ Reliable
    ↓
Webhook (Vercel)
    ↓
AI Processing
    ↓
Response via Cloud API
```

## Benefits of Cloud API

✅ **Official Meta support**
✅ **No connection issues**
✅ **No separate worker server needed**
✅ **Webhooks (real-time)**
✅ **Better reliability**
✅ **Free tier: 1,000 conversations/month**
✅ **Production-ready**
✅ **Scalable**

## Next Steps

1. **Complete this setup** following steps 1-9
2. **Test with your WhatsApp** by sending messages
3. **Monitor in Vercel logs** to see webhook activity
4. **Add OpenAI credits** if you haven't already
5. **Complete business verification** for production limits
6. **Create message templates** for proactive notifications (optional)

## Support Resources

- **Meta Developer Docs**: https://developers.facebook.com/docs/whatsapp
- **WhatsApp Business API**: https://business.whatsapp.com/
- **Vercel Docs**: https://vercel.com/docs
- **PawPal Issues**: Create an issue in your GitHub repo

## Testing Commands

### Test Webhook Verification (GET)

```bash
curl "https://your-app.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test_challenge"
```

Expected response: `test_challenge`

### Test Sending Message (Direct API)

```bash
curl -X POST https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "1234567890",
    "type": "text",
    "text": {
      "body": "Hello from PawPal!"
    }
  }'
```

## Summary

You've successfully migrated from Baileys to WhatsApp Cloud API! Your PawPal bot is now:

- ✅ Using official Meta API
- ✅ More reliable and scalable
- ✅ Production-ready
- ✅ Cost-effective

Send a message to your WhatsApp number and watch the magic happen! 🐾
