import { supabase } from '@/lib/db/supabase';
import { FeedingSchedule, FeedingLog, CreateFeedingScheduleInput, CreateFeedingLogInput } from '@/types/db';

export class FeedingRepository {
  // Feeding Schedules
  async createSchedule(input: CreateFeedingScheduleInput): Promise<FeedingSchedule> {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .insert({
        pet_id: input.pet_id,
        meal_time: input.meal_time,
        meal_name: input.meal_name,
        food_type: input.food_type || null,
        portion_size: input.portion_size || null,
        supplements: input.supplements || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feeding schedule: ${error.message}`);
    }

    return data;
  }

  async getActiveSchedules(petId: string): Promise<FeedingSchedule[]> {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .select('*')
      .eq('pet_id', petId)
      .eq('active', true)
      .order('meal_time', { ascending: true });

    if (error) {
      throw new Error(`Failed to get feeding schedules: ${error.message}`);
    }

    return data || [];
  }

  async updateSchedule(scheduleId: string, updates: Partial<CreateFeedingScheduleInput>): Promise<FeedingSchedule> {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .update(updates)
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update schedule: ${error.message}`);
    }

    return data;
  }

  async deactivateSchedule(scheduleId: string): Promise<void> {
    const { error } = await supabase
      .from('feeding_schedules')
      .update({ active: false })
      .eq('id', scheduleId);

    if (error) {
      throw new Error(`Failed to deactivate schedule: ${error.message}`);
    }
  }

  // Feeding Logs
  async createLog(input: CreateFeedingLogInput): Promise<FeedingLog> {
    const { data, error } = await supabase
      .from('feeding_logs')
      .insert({
        pet_id: input.pet_id,
        schedule_id: input.schedule_id || null,
        food_type: input.food_type,
        portion_size: input.portion_size || null,
        supplements: input.supplements || null,
        notes: input.notes || null,
        fed_at: input.fed_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create feeding log: ${error.message}`);
    }

    return data;
  }

  async getRecentLogs(petId: string, limit: number = 30): Promise<FeedingLog[]> {
    const { data, error } = await supabase
      .from('feeding_logs')
      .select('*')
      .eq('pet_id', petId)
      .order('fed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get feeding logs: ${error.message}`);
    }

    return data || [];
  }

  async getTodayLogs(petId: string): Promise<FeedingLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('feeding_logs')
      .select('*')
      .eq('pet_id', petId)
      .gte('fed_at', today.toISOString())
      .order('fed_at', { ascending: false});

    if (error) {
      throw new Error(`Failed to get today's feeding logs: ${error.message}`);
    }

    return data || [];
  }
}
