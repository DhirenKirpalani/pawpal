import { supabase } from '@/lib/db/supabase';
import { PottyTrainingLog, CreatePottyTrainingLogInput } from '@/types/db';

export class PottyTrainingRepository {
  async create(input: CreatePottyTrainingLogInput): Promise<PottyTrainingLog> {
    const { data, error } = await supabase
      .from('potty_training_logs')
      .insert({
        pet_id: input.pet_id,
        event_type: input.event_type,
        location: input.location,
        consistency: input.consistency || null,
        notes: input.notes || null,
        logged_at: input.logged_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create potty log: ${error.message}`);
    }

    return data;
  }

  async getRecentByPetId(petId: string, limit: number = 30): Promise<PottyTrainingLog[]> {
    const { data, error } = await supabase
      .from('potty_training_logs')
      .select('*')
      .eq('pet_id', petId)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get potty logs: ${error.message}`);
    }

    return data || [];
  }

  async getSuccessRate(petId: string, days: number = 7): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('potty_training_logs')
      .select('location')
      .eq('pet_id', petId)
      .gte('logged_at', since.toISOString());

    if (error) {
      throw new Error(`Failed to calculate success rate: ${error.message}`);
    }

    if (!data || data.length === 0) return 0;

    const successful = data.filter(log => log.location === 'correct_spot').length;
    return (successful / data.length) * 100;
  }

  async getTodayLogs(petId: string): Promise<PottyTrainingLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('potty_training_logs')
      .select('*')
      .eq('pet_id', petId)
      .gte('logged_at', today.toISOString())
      .order('logged_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get today's logs: ${error.message}`);
    }

    return data || [];
  }
}
