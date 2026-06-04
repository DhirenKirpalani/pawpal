-- Enhanced Features Migration
-- Adds: reminders, health tracking, notes, potty training, feeding schedules

-- Pet Health Reminders
CREATE TABLE pet_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('vaccine', 'deworming', 'vet_appointment', 'checkup', 'medication')),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_interval_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pet_reminders_pet_id ON pet_reminders(pet_id);
CREATE INDEX idx_pet_reminders_due_date ON pet_reminders(due_date);
CREATE INDEX idx_pet_reminders_completed ON pet_reminders(completed);

-- Pet Notes (Manual entries by owner/caretaker)
CREATE TABLE pet_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('health', 'behavior', 'food', 'general', 'incident')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('normal', 'concern', 'urgent')),
  tags TEXT[],
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pet_notes_pet_id ON pet_notes(pet_id);
CREATE INDEX idx_pet_notes_created_at ON pet_notes(created_at DESC);
CREATE INDEX idx_pet_notes_note_type ON pet_notes(note_type);

-- Potty Training Tracker
CREATE TABLE potty_training_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('poop', 'pee')),
  location TEXT NOT NULL CHECK (location IN ('correct_spot', 'wrong_spot', 'accident')),
  consistency TEXT CHECK (consistency IN ('normal', 'soft', 'diarrhea', 'hard')),
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_potty_training_pet_id ON potty_training_logs(pet_id);
CREATE INDEX idx_potty_training_logged_at ON potty_training_logs(logged_at DESC);

-- Feeding Schedule & Tracking
CREATE TABLE feeding_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  meal_time TIME NOT NULL,
  meal_name TEXT NOT NULL,
  food_type TEXT,
  portion_size TEXT,
  supplements JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feeding_schedules_pet_id ON feeding_schedules(pet_id);
CREATE INDEX idx_feeding_schedules_active ON feeding_schedules(active);

-- Feeding Logs (Actual feeding records)
CREATE TABLE feeding_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES feeding_schedules(id) ON DELETE SET NULL,
  food_type TEXT NOT NULL,
  portion_size TEXT,
  supplements JSONB,
  notes TEXT,
  fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feeding_logs_pet_id ON feeding_logs(pet_id);
CREATE INDEX idx_feeding_logs_fed_at ON feeding_logs(fed_at DESC);

-- Weight Tracking
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
  notes TEXT,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_weight_logs_pet_id ON weight_logs(pet_id);
CREATE INDEX idx_weight_logs_measured_at ON weight_logs(measured_at DESC);

-- Lost Pet Alerts
CREATE TABLE lost_pet_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'found', 'cancelled')),
  last_seen_location TEXT,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  contact_info TEXT,
  found_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lost_pet_alerts_pet_id ON lost_pet_alerts(pet_id);
CREATE INDEX idx_lost_pet_alerts_status ON lost_pet_alerts(status);

-- Update function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_pet_reminders_updated_at BEFORE UPDATE ON pet_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_notes_updated_at BEFORE UPDATE ON pet_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feeding_schedules_updated_at BEFORE UPDATE ON feeding_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lost_pet_alerts_updated_at BEFORE UPDATE ON lost_pet_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
