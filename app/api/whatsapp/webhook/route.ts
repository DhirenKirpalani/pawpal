import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppCloudClient } from '@/adapters/whatsapp/cloud-api-client';
import { ChatService } from '@/services/chat-service';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

interface WebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: {
          name: string;
        };
        wa_id: string;
      }>;
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        text: {
          body: string;
        };
        type: string;
      }>;
      statuses?: Array<{
        id: string;
        status: string;
        timestamp: string;
        recipient_id: string;
      }>;
    };
    field: string;
  }>;
}

interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook verification attempt:', {
    mode,
    receivedToken: token,
    expectedToken: VERIFY_TOKEN,
    tokenMatch: token === VERIFY_TOKEN,
    challenge,
  });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.log('Webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json();

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        if (!value.messages || value.messages.length === 0) {
          continue;
        }

        for (const message of value.messages) {
          if (message.type !== 'text') {
            continue;
          }

          const from = message.from;
          const messageText = message.text.body;
          const messageId = message.id;

          console.log(`Received message from ${from}: ${messageText}`);

          const whatsappClient = new WhatsAppCloudClient({
            accessToken: ACCESS_TOKEN,
            phoneNumberId: PHONE_NUMBER_ID,
          });

          await whatsappClient.markAsRead(messageId);

          const chatService = new ChatService();
          const response = await chatService.processMessage({
            phone: from,
            message: messageText,
          });

          await whatsappClient.sendMessage({
            to: from,
            message: response.reply,
          });

          console.log(`Sent reply to ${from}`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
