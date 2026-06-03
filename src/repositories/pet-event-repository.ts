import { supabase } from '@/lib/db/supabase';
import { PetEvent, CreatePetEventInput } from '@/types/db';

export class PetEventRepository {
  async create(input: CreatePetEventInput): Promise<PetEvent> {
    const { data, error } = await supabase
      .from('pet_events')
      .insert({
        pet_id: input.pet_id,
        event_type: input.event_type,
        details: input.details,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pet event: ${error.message}`);
    }

    return data;
  }

  async getRecentByPetId(petId: string, limit: number = 10): Promise<PetEvent[]> {
    const { data, error } = await supabase
      .from('pet_events')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get pet events: ${error.message}`);
    }

    return data || [];
  }

  async getRecentByType(
    petId: string,
    eventType: 'symptom' | 'food' | 'behavior',
    limit: number = 5
  ): Promise<PetEvent[]> {
    const { data, error } = await supabase
      .from('pet_events')
      .select('*')
      .eq('pet_id', petId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get pet events by type: ${error.message}`);
    }

    return data || [];
  }
}
