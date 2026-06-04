import { supabase } from '@/lib/db/supabase';
import { PetReminder, CreatePetReminderInput } from '@/types/db';

export class PetReminderRepository {
  async create(input: CreatePetReminderInput): Promise<PetReminder> {
    const { data, error } = await supabase
      .from('pet_reminders')
      .insert({
        pet_id: input.pet_id,
        reminder_type: input.reminder_type,
        title: input.title,
        description: input.description || null,
        due_date: input.due_date,
        recurring: input.recurring || false,
        recurring_interval_days: input.recurring_interval_days || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reminder: ${error.message}`);
    }

    return data;
  }

  async getUpcomingByPetId(petId: string, limit: number = 10): Promise<PetReminder[]> {
    const { data, error } = await supabase
      .from('pet_reminders')
      .select('*')
      .eq('pet_id', petId)
      .eq('completed', false)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get upcoming reminders: ${error.message}`);
    }

    return data || [];
  }

  async getOverdueByPetId(petId: string): Promise<PetReminder[]> {
    const { data, error } = await supabase
      .from('pet_reminders')
      .select('*')
      .eq('pet_id', petId)
      .eq('completed', false)
      .lt('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get overdue reminders: ${error.message}`);
    }

    return data || [];
  }

  async markComplete(reminderId: string): Promise<PetReminder> {
    const { data, error } = await supabase
      .from('pet_reminders')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', reminderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark reminder complete: ${error.message}`);
    }

    return data;
  }

  async delete(reminderId: string): Promise<void> {
    const { error } = await supabase
      .from('pet_reminders')
      .delete()
      .eq('id', reminderId);

    if (error) {
      throw new Error(`Failed to delete reminder: ${error.message}`);
    }
  }
}
