import { supabase } from '@/lib/db/supabase';
import {
  PetMemoryProfile,
  CreatePetMemoryProfileInput,
  OwnerProfile,
  CreateOwnerProfileInput,
  Concern,
  CreateConcernInput,
  ConversationState,
  UpdateConversationStateInput,
  ResponseHistory,
  CreateResponseHistoryInput,
  FollowUpQueue,
  CreateFollowUpInput,
  ConversationArc,
  CreateConversationArcInput,
  DelightMoment,
  CreateDelightMomentInput,
} from '@/types/companion';

export class CompanionRepository {
  // Pet Memory Profile
  async getPetMemoryProfile(petId: string): Promise<PetMemoryProfile | null> {
    const { data, error } = await supabase
      .from('pet_memory_profiles')
      .select('*')
      .eq('pet_id', petId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get pet memory profile: ${error.message}`);
    }

    return data;
  }

  async createPetMemoryProfile(input: CreatePetMemoryProfileInput): Promise<PetMemoryProfile> {
    const { data, error } = await supabase
      .from('pet_memory_profiles')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pet memory profile: ${error.message}`);
    }

    return data;
  }

  async updatePetMemoryProfile(
    petId: string,
    updates: Partial<CreatePetMemoryProfileInput>
  ): Promise<PetMemoryProfile> {
    const { data, error } = await supabase
      .from('pet_memory_profiles')
      .update(updates)
      .eq('pet_id', petId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update pet memory profile: ${error.message}`);
    }

    return data;
  }

  // Owner Profile
  async getOwnerProfile(userId: string): Promise<OwnerProfile | null> {
    const { data, error } = await supabase
      .from('owner_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get owner profile: ${error.message}`);
    }

    return data;
  }

  async createOwnerProfile(input: CreateOwnerProfileInput): Promise<OwnerProfile> {
    const { data, error } = await supabase
      .from('owner_profiles')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create owner profile: ${error.message}`);
    }

    return data;
  }

  async updateOwnerProfile(
    userId: string,
    updates: Partial<CreateOwnerProfileInput>
  ): Promise<OwnerProfile> {
    const { data, error } = await supabase
      .from('owner_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update owner profile: ${error.message}`);
    }

    return data;
  }

  // Concerns
  async createConcern(input: CreateConcernInput): Promise<Concern> {
    const { data, error } = await supabase
      .from('concerns')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create concern: ${error.message}`);
    }

    return data;
  }

  async getActiveConcerns(petId: string): Promise<Concern[]> {
    const { data, error } = await supabase
      .from('concerns')
      .select('*')
      .eq('pet_id', petId)
      .in('status', ['OPEN', 'MONITORING', 'IMPROVING'])
      .order('last_mentioned_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get active concerns: ${error.message}`);
    }

    return data || [];
  }

  async updateConcern(concernId: string, updates: Partial<Concern>): Promise<Concern> {
    const { data, error } = await supabase
      .from('concerns')
      .update({ ...updates, last_mentioned_at: new Date().toISOString() })
      .eq('id', concernId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update concern: ${error.message}`);
    }

    return data;
  }

  // Conversation State
  async getConversationState(userId: string): Promise<ConversationState | null> {
    const { data, error } = await supabase
      .from('conversation_states')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get conversation state: ${error.message}`);
    }

    return data;
  }

  async createConversationState(userId: string, petId?: string): Promise<ConversationState> {
    const { data, error } = await supabase
      .from('conversation_states')
      .insert({
        user_id: userId,
        pet_id: petId || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation state: ${error.message}`);
    }

    return data;
  }

  async updateConversationState(
    userId: string,
    updates: UpdateConversationStateInput
  ): Promise<ConversationState> {
    const { data, error } = await supabase
      .from('conversation_states')
      .update({ ...updates, last_interaction_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation state: ${error.message}`);
    }

    return data;
  }

  // Response History
  async createResponseHistory(input: CreateResponseHistoryInput): Promise<ResponseHistory> {
    const { data, error } = await supabase
      .from('response_history')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create response history: ${error.message}`);
    }

    return data;
  }

  async getRecentResponseHistory(userId: string, limit: number = 10): Promise<ResponseHistory[]> {
    const { data, error } = await supabase
      .from('response_history')
      .select('*')
      .eq('user_id', userId)
      .order('used_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get response history: ${error.message}`);
    }

    return data || [];
  }

  // Follow-Up Queue
  async createFollowUp(input: CreateFollowUpInput): Promise<FollowUpQueue> {
    const { data, error } = await supabase
      .from('follow_up_queue')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create follow-up: ${error.message}`);
    }

    return data;
  }

  async getPendingFollowUps(userId: string): Promise<FollowUpQueue[]> {
    const { data, error } = await supabase
      .from('follow_up_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('sent', false)
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (error) {
      throw new Error(`Failed to get pending follow-ups: ${error.message}`);
    }

    return data || [];
  }

  async markFollowUpSent(followUpId: string): Promise<void> {
    const { error } = await supabase
      .from('follow_up_queue')
      .update({
        sent: true,
        sent_at: new Date().toISOString(),
      })
      .eq('id', followUpId);

    if (error) {
      throw new Error(`Failed to mark follow-up as sent: ${error.message}`);
    }
  }

  // Conversation Arc
  async createConversationArc(input: CreateConversationArcInput): Promise<ConversationArc> {
    const { data, error } = await supabase
      .from('conversation_arcs')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation arc: ${error.message}`);
    }

    return data;
  }

  async getActiveConversationArc(userId: string): Promise<ConversationArc | null> {
    const { data, error } = await supabase
      .from('conversation_arcs')
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get active conversation arc: ${error.message}`);
    }

    return data;
  }

  async updateConversationArc(
    arcId: string,
    updates: Partial<ConversationArc>
  ): Promise<ConversationArc> {
    const { data, error } = await supabase
      .from('conversation_arcs')
      .update(updates)
      .eq('id', arcId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation arc: ${error.message}`);
    }

    return data;
  }

  // Delight Moments
  async createDelightMoment(input: CreateDelightMomentInput): Promise<DelightMoment> {
    const { data, error } = await supabase
      .from('delight_moments')
      .insert(input)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create delight moment: ${error.message}`);
    }

    return data;
  }

  async getRecentDelightMoments(userId: string, limit: number = 5): Promise<DelightMoment[]> {
    const { data, error } = await supabase
      .from('delight_moments')
      .select('*')
      .eq('user_id', userId)
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get delight moments: ${error.message}`);
    }

    return data || [];
  }
}
