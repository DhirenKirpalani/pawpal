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

// Enhanced Features Types

export interface PetReminder {
  id: string;
  pet_id: string;
  reminder_type: 'vaccine' | 'deworming' | 'vet_appointment' | 'checkup' | 'medication';
  title: string;
  description: string | null;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  recurring: boolean;
  recurring_interval_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePetReminderInput {
  pet_id: string;
  reminder_type: 'vaccine' | 'deworming' | 'vet_appointment' | 'checkup' | 'medication';
  title: string;
  description?: string;
  due_date: string;
  recurring?: boolean;
  recurring_interval_days?: number;
}

export interface PetNote {
  id: string;
  pet_id: string;
  note_type: 'health' | 'behavior' | 'food' | 'general' | 'incident';
  title: string;
  content: string;
  severity: 'normal' | 'concern' | 'urgent' | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePetNoteInput {
  pet_id: string;
  note_type: 'health' | 'behavior' | 'food' | 'general' | 'incident';
  title: string;
  content: string;
  severity?: 'normal' | 'concern' | 'urgent';
  tags?: string[];
  created_by?: string;
}

export interface PottyTrainingLog {
  id: string;
  pet_id: string;
  event_type: 'poop' | 'pee';
  location: 'correct_spot' | 'wrong_spot' | 'accident';
  consistency: 'normal' | 'soft' | 'diarrhea' | 'hard' | null;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface CreatePottyTrainingLogInput {
  pet_id: string;
  event_type: 'poop' | 'pee';
  location: 'correct_spot' | 'wrong_spot' | 'accident';
  consistency?: 'normal' | 'soft' | 'diarrhea' | 'hard';
  notes?: string;
  logged_at?: string;
}

export interface FeedingSchedule {
  id: string;
  pet_id: string;
  meal_time: string;
  meal_name: string;
  food_type: string | null;
  portion_size: string | null;
  supplements: Record<string, unknown> | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedingScheduleInput {
  pet_id: string;
  meal_time: string;
  meal_name: string;
  food_type?: string;
  portion_size?: string;
  supplements?: Record<string, unknown>;
}

export interface FeedingLog {
  id: string;
  pet_id: string;
  schedule_id: string | null;
  food_type: string;
  portion_size: string | null;
  supplements: Record<string, unknown> | null;
  notes: string | null;
  fed_at: string;
  created_at: string;
}

export interface CreateFeedingLogInput {
  pet_id: string;
  schedule_id?: string;
  food_type: string;
  portion_size?: string;
  supplements?: Record<string, unknown>;
  notes?: string;
  fed_at?: string;
}

export interface WeightLog {
  id: string;
  pet_id: string;
  weight_kg: number;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

export interface CreateWeightLogInput {
  pet_id: string;
  weight_kg: number;
  notes?: string;
  measured_at?: string;
}

export interface LostPetAlert {
  id: string;
  pet_id: string;
  status: 'active' | 'found' | 'cancelled';
  last_seen_location: string | null;
  last_seen_at: string | null;
  description: string | null;
  contact_info: string | null;
  found_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLostPetAlertInput {
  pet_id: string;
  last_seen_location?: string;
  last_seen_at?: string;
  description?: string;
  contact_info?: string;
}
