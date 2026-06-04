import { supabase } from '@/lib/db/supabase';
import { WeightLog, CreateWeightLogInput } from '@/types/db';

export class WeightLogRepository {
  async create(input: CreateWeightLogInput): Promise<WeightLog> {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        pet_id: input.pet_id,
        weight_kg: input.weight_kg,
        notes: input.notes || null,
        measured_at: input.measured_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create weight log: ${error.message}`);
    }

    return data;
  }

  async getByPetId(petId: string, limit: number = 50): Promise<WeightLog[]> {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('pet_id', petId)
      .order('measured_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get weight logs: ${error.message}`);
    }

    return data || [];
  }

  async getLatest(petId: string): Promise<WeightLog | null> {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('pet_id', petId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get latest weight: ${error.message}`);
    }

    return data;
  }

  async getWeightTrend(petId: string, days: number = 30): Promise<WeightLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('pet_id', petId)
      .gte('measured_at', since.toISOString())
      .order('measured_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get weight trend: ${error.message}`);
    }

    return data || [];
  }
}
