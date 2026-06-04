import { supabase } from '@/lib/db/supabase';
import { LostPetAlert, CreateLostPetAlertInput } from '@/types/db';

export class LostPetRepository {
  async create(input: CreateLostPetAlertInput): Promise<LostPetAlert> {
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .insert({
        pet_id: input.pet_id,
        last_seen_location: input.last_seen_location || null,
        last_seen_at: input.last_seen_at || null,
        description: input.description || null,
        contact_info: input.contact_info || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lost pet alert: ${error.message}`);
    }

    return data;
  }

  async getActiveAlert(petId: string): Promise<LostPetAlert | null> {
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .select('*')
      .eq('pet_id', petId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get active alert: ${error.message}`);
    }

    return data;
  }

  async markFound(alertId: string): Promise<LostPetAlert> {
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .update({
        status: 'found',
        found_at: new Date().toISOString(),
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark pet as found: ${error.message}`);
    }

    return data;
  }

  async cancel(alertId: string): Promise<LostPetAlert> {
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .update({ status: 'cancelled' })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel alert: ${error.message}`);
    }

    return data;
  }

  async getHistory(petId: string): Promise<LostPetAlert[]> {
    const { data, error } = await supabase
      .from('lost_pet_alerts')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get alert history: ${error.message}`);
    }

    return data || [];
  }
}
