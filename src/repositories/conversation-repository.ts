import { supabase } from '@/lib/db/supabase';
import { Conversation, CreateConversationInput } from '@/types/db';

export class ConversationRepository {
  async create(input: CreateConversationInput): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: input.user_id,
        message: input.message,
        intent: input.intent || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return data;
  }

  async getRecentByUserId(userId: string, limit: number = 10): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get conversations: ${error.message}`);
    }

    return data || [];
  }
}
