export interface User {
  id: string;
  phone: string;
  preferred_language: 'en' | 'id';
  created_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'cat' | 'dog';
  breed: string | null;
  age_years: number | null;
  weight_kg: number | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  message: string;
  intent: Intent | null;
  created_at: string;
}

export interface PetEvent {
  id: string;
  pet_id: string;
  event_type: 'symptom' | 'food' | 'behavior';
  details: Record<string, unknown>;
  created_at: string;
}

export type Intent = 'SYMPTOM' | 'FOOD' | 'BEHAVIOR' | 'GENERAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CreateUserInput {
  phone: string;
  preferred_language?: 'en' | 'id';
}

export interface CreatePetInput {
  user_id: string;
  name: string;
  species: 'cat' | 'dog';
  breed?: string;
  age_years?: number;
  weight_kg?: number;
}

export interface CreateConversationInput {
  user_id: string;
  message: string;
  intent?: Intent;
}

export interface CreatePetEventInput {
  pet_id: string;
  event_type: 'symptom' | 'food' | 'behavior';
  details: Record<string, unknown>;
}
