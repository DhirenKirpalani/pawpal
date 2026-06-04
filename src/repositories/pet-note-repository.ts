import { supabase } from '@/lib/db/supabase';
import { PetNote, CreatePetNoteInput } from '@/types/db';

export class PetNoteRepository {
  async create(input: CreatePetNoteInput): Promise<PetNote> {
    const { data, error} = await supabase
      .from('pet_notes')
      .insert({
        pet_id: input.pet_id,
        note_type: input.note_type,
        title: input.title,
        content: input.content,
        severity: input.severity || null,
        tags: input.tags || null,
        created_by: input.created_by || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create note: ${error.message}`);
    }

    return data;
  }

  async getByPetId(petId: string, limit: number = 50): Promise<PetNote[]> {
    const { data, error } = await supabase
      .from('pet_notes')
      .select('*')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get notes: ${error.message}`);
    }

    return data || [];
  }

  async getByType(petId: string, noteType: string, limit: number = 20): Promise<PetNote[]> {
    const { data, error } = await supabase
      .from('pet_notes')
      .select('*')
      .eq('pet_id', petId)
      .eq('note_type', noteType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get notes by type: ${error.message}`);
    }

    return data || [];
  }

  async update(noteId: string, updates: Partial<CreatePetNoteInput>): Promise<PetNote> {
    const { data, error } = await supabase
      .from('pet_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update note: ${error.message}`);
    }

    return data;
  }

  async delete(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('pet_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  }
}
