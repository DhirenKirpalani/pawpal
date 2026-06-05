-- Companion System Migration
-- Transforms PawPal from AI tool to AI companion with emotional intelligence and memory

-- Pet Memory Profile
CREATE TABLE pet_memory_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL UNIQUE REFERENCES pets(id) ON DELETE CASCADE,
  personality_traits TEXT[] DEFAULT '{}',
  health_patterns TEXT[] DEFAULT '{}',
  favorite_activities TEXT[] DEFAULT '{}',
  sensitivities TEXT[] DEFAULT '{}',
  recovery_milestones TEXT[] DEFAULT '{}',
  behavioral_notes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pet_memory_profiles_pet_id ON pet_memory_profiles(pet_id);

-- Owner Profile (Communication & Anxiety Patterns)
CREATE TABLE owner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  experience_level TEXT DEFAULT 'NEW' CHECK (experience_level IN ('NEW', 'INTERMEDIATE', 'EXPERIENCED')),
  communication_style TEXT DEFAULT 'CONVERSATIONAL' CHECK (communication_style IN ('SHORT', 'CONVERSATIONAL')),
  anxiety_profile TEXT DEFAULT 'MEDIUM' CHECK (anxiety_profile IN ('LOW', 'MEDIUM', 'HIGH')),
  engagement_style TEXT DEFAULT 'BALANCED' CHECK (engagement_style IN ('FACTUAL', 'EMOTIONAL', 'BALANCED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_owner_profiles_user_id ON owner_profiles(user_id);

-- Concern Lifecycle Tracking
CREATE TABLE concerns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MONITORING', 'IMPROVING', 'RESOLVED', 'ESCALATED')),
  severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  first_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_concerns_pet_id ON concerns(pet_id);
CREATE INDEX idx_concerns_status ON concerns(status);
CREATE INDEX idx_concerns_last_mentioned ON concerns(last_mentioned_at DESC);

-- Conversation State (Enhanced with Emotion)
CREATE TABLE conversation_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  current_emotion TEXT CHECK (current_emotion IN ('WORRIED', 'ANXIOUS', 'FRUSTRATED', 'GUILTY', 'OVERWHELMED', 'CONFUSED', 'SAD', 'RELIEVED', 'PROUD', 'EXCITED', 'CURIOUS', 'NEUTRAL')),
  urgency_level TEXT CHECK (urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY')),
  current_topic TEXT,
  previous_topic TEXT,
  unresolved_concerns TEXT[] DEFAULT '{}',
  engagement_level INTEGER DEFAULT 5 CHECK (engagement_level >= 1 AND engagement_level <= 10),
  conversation_depth INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_states_user_id ON conversation_states(user_id);
CREATE INDEX idx_conversation_states_last_interaction ON conversation_states(last_interaction_at DESC);

-- Response History (Anti-Repetition)
CREATE TABLE response_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opening_style TEXT,
  empathy_phrase TEXT,
  follow_up_style TEXT,
  response_pattern TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_response_history_user_id ON response_history(user_id);
CREATE INDEX idx_response_history_used_at ON response_history(used_at DESC);

-- Follow-Up Queue
CREATE TABLE follow_up_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  concern_id UUID REFERENCES concerns(id) ON DELETE CASCADE,
  follow_up_type TEXT NOT NULL CHECK (follow_up_type IN ('SYMPTOM_CHECK', 'FOOD_INCIDENT', 'VET_VISIT', 'IMPROVEMENT_CHECK', 'GENERAL')),
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_follow_up_queue_user_id ON follow_up_queue(user_id);
CREATE INDEX idx_follow_up_queue_scheduled ON follow_up_queue(scheduled_for);
CREATE INDEX idx_follow_up_queue_sent ON follow_up_queue(sent);

-- Conversation Arcs (Journey Tracking)
CREATE TABLE conversation_arcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concern_id UUID REFERENCES concerns(id) ON DELETE CASCADE,
  emotional_trajectory TEXT[] DEFAULT '{}',
  progress_status TEXT NOT NULL DEFAULT 'STARTED' CHECK (progress_status IN ('STARTED', 'INVESTIGATING', 'MONITORING', 'IMPROVING', 'RESOLVED')),
  milestone_reached TEXT[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_arcs_user_id ON conversation_arcs(user_id);
CREATE INDEX idx_conversation_arcs_concern_id ON conversation_arcs(concern_id);

-- Delight Moments (Positive Interactions)
CREATE TABLE delight_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  moment_type TEXT NOT NULL CHECK (moment_type IN ('BIRTHDAY', 'RECOVERY', 'MILESTONE', 'PROGRESS', 'CELEBRATION')),
  message TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_delight_moments_user_id ON delight_moments(user_id);
CREATE INDEX idx_delight_moments_triggered_at ON delight_moments(triggered_at DESC);

-- Enhanced Conversations Table (Add emotion and context)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS emotion TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS urgency TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS concern_id UUID REFERENCES concerns(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS response_pattern TEXT;

CREATE INDEX IF NOT EXISTS idx_conversations_emotion ON conversations(emotion);
CREATE INDEX IF NOT EXISTS idx_conversations_concern_id ON conversations(concern_id);

-- Update triggers
CREATE TRIGGER update_pet_memory_profiles_updated_at BEFORE UPDATE ON pet_memory_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owner_profiles_updated_at BEFORE UPDATE ON owner_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concerns_updated_at BEFORE UPDATE ON concerns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_states_updated_at BEFORE UPDATE ON conversation_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_arcs_updated_at BEFORE UPDATE ON conversation_arcs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
