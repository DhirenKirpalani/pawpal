import { supabase } from '@/lib/db/supabase';
import { User, CreateUserInput } from '@/types/db';

export class UserRepository {
  async findByPhone(phone: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  async create(input: CreateUserInput): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        phone: input.phone,
        preferred_language: input.preferred_language || 'en',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async findOrCreate(phone: string, preferredLanguage?: 'en' | 'id'): Promise<User> {
    const existing = await this.findByPhone(phone);
    if (existing) {
      return existing;
    }

    return this.create({
      phone,
      preferred_language: preferredLanguage,
    });
  }

  async findById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }

    return data;
  }
}
