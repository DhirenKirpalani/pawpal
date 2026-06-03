import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ChatService } from '@/services/chat-service';

const ChatRequestSchema = z.object({
  phone: z.string().min(1),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = ChatRequestSchema.parse(body);

    const chatService = new ChatService();
    const response = await chatService.processMessage(validatedData);

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chat API error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
