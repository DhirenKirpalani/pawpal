import { supabase } from '@/lib/db/supabase';
import { Pet, CreatePetInput } from '@/types/db';

export class PetRepository {
  async findByUserId(userId: string): Promise<Pet | null> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find pet: ${error.message}`);
    }

    return data;
  }

  async create(input: CreatePetInput): Promise<Pet> {
    const { data, error } = await supabase
      .from('pets')
      .insert({
        user_id: input.user_id,
        name: input.name,
        species: input.species,
        breed: input.breed || null,
        age_years: input.age_years || null,
        weight_kg: input.weight_kg || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pet: ${error.message}`);
    }

    return data;
  }

  async findById(petId: string): Promise<Pet | null> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find pet: ${error.message}`);
    }

    return data;
  }

  async getAll(): Promise<Pet[]> {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get all pets: ${error.message}`);
    }

    return data || [];
  }
}
