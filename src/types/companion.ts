// Companion System Types
// Transforms PawPal from AI tool to AI companion

export type Emotion =
  | 'WORRIED'
  | 'ANXIOUS'
  | 'FRUSTRATED'
  | 'GUILTY'
  | 'OVERWHELMED'
  | 'CONFUSED'
  | 'SAD'
  | 'RELIEVED'
  | 'PROUD'
  | 'EXCITED'
  | 'CURIOUS'
  | 'NEUTRAL';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export type ConcernStatus = 'OPEN' | 'MONITORING' | 'IMPROVING' | 'RESOLVED' | 'ESCALATED';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ExperienceLevel = 'NEW' | 'INTERMEDIATE' | 'EXPERIENCED';

export type CommunicationStyle = 'SHORT' | 'CONVERSATIONAL';

export type AnxietyProfile = 'LOW' | 'MEDIUM' | 'HIGH';

export type EngagementStyle = 'FACTUAL' | 'EMOTIONAL' | 'BALANCED';

export type FollowUpType = 'SYMPTOM_CHECK' | 'FOOD_INCIDENT' | 'VET_VISIT' | 'IMPROVEMENT_CHECK' | 'GENERAL';

export type ProgressStatus = 'STARTED' | 'INVESTIGATING' | 'MONITORING' | 'IMPROVING' | 'RESOLVED';

export type DelightMomentType = 'BIRTHDAY' | 'RECOVERY' | 'MILESTONE' | 'PROGRESS' | 'CELEBRATION';

// Pet Memory Profile
export interface PetMemoryProfile {
  id: string;
  pet_id: string;
  personality_traits: string[];
  health_patterns: string[];
  favorite_activities: string[];
  sensitivities: string[];
  recovery_milestones: string[];
  behavioral_notes: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePetMemoryProfileInput {
  pet_id: string;
  personality_traits?: string[];
  health_patterns?: string[];
  favorite_activities?: string[];
  sensitivities?: string[];
}

// Owner Profile
export interface OwnerProfile {
  id: string;
  user_id: string;
  experience_level: ExperienceLevel;
  communication_style: CommunicationStyle;
  anxiety_profile: AnxietyProfile;
  engagement_style: EngagementStyle;
  created_at: string;
  updated_at: string;
}

export interface CreateOwnerProfileInput {
  user_id: string;
  experience_level?: ExperienceLevel;
  communication_style?: CommunicationStyle;
  anxiety_profile?: AnxietyProfile;
  engagement_style?: EngagementStyle;
}

// Concern
export interface Concern {
  id: string;
  pet_id: string;
  topic: string;
  description: string | null;
  status: ConcernStatus;
  severity: Severity;
  first_reported_at: string;
  last_mentioned_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateConcernInput {
  pet_id: string;
  topic: string;
  description?: string;
  severity?: Severity;
}

// Conversation State
export interface ConversationState {
  id: string;
  user_id: string;
  pet_id: string | null;
  current_emotion: Emotion | null;
  urgency_level: UrgencyLevel | null;
  current_topic: string | null;
  previous_topic: string | null;
  unresolved_concerns: string[];
  engagement_level: number;
  conversation_depth: number;
  last_interaction_at: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateConversationStateInput {
  current_emotion?: Emotion;
  urgency_level?: UrgencyLevel;
  current_topic?: string;
  previous_topic?: string;
  unresolved_concerns?: string[];
  engagement_level?: number;
  conversation_depth?: number;
}

// Response History
export interface ResponseHistory {
  id: string;
  user_id: string;
  opening_style: string | null;
  empathy_phrase: string | null;
  follow_up_style: string | null;
  response_pattern: string | null;
  used_at: string;
}

export interface CreateResponseHistoryInput {
  user_id: string;
  opening_style?: string;
  empathy_phrase?: string;
  follow_up_style?: string;
  response_pattern?: string;
}

// Follow-Up Queue
export interface FollowUpQueue {
  id: string;
  user_id: string;
  pet_id: string;
  concern_id: string | null;
  follow_up_type: FollowUpType;
  message: string;
  scheduled_for: string;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface CreateFollowUpInput {
  user_id: string;
  pet_id: string;
  concern_id?: string;
  follow_up_type: FollowUpType;
  message: string;
  scheduled_for: string;
}

// Conversation Arc
export interface ConversationArc {
  id: string;
  user_id: string;
  concern_id: string | null;
  emotional_trajectory: string[];
  progress_status: ProgressStatus;
  milestone_reached: string[];
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationArcInput {
  user_id: string;
  concern_id?: string;
  progress_status?: ProgressStatus;
}

// Delight Moment
export interface DelightMoment {
  id: string;
  user_id: string;
  pet_id: string;
  moment_type: DelightMomentType;
  message: string;
  triggered_at: string;
  created_at: string;
}

export interface CreateDelightMomentInput {
  user_id: string;
  pet_id: string;
  moment_type: DelightMomentType;
  message: string;
}

// Enhanced Context for Response Generation
export interface EnhancedContext {
  petMemory: PetMemoryProfile | null;
  ownerProfile: OwnerProfile | null;
  conversationState: ConversationState | null;
  activeConcerns: Concern[];
  recentResponses: ResponseHistory[];
  conversationArc: ConversationArc | null;
}

// Emotional Analysis Result
export interface EmotionalAnalysis {
  emotion: Emotion;
  confidence: number;
  indicators: string[];
  urgency: UrgencyLevel;
}

// Conversation Composer Input
export interface ConversationComposerInput {
  userMessage: string;
  emotionalAnalysis: EmotionalAnalysis;
  enhancedContext: EnhancedContext;
  intent: string;
  decisionResult: any;
  language: 'en' | 'id';
}

// Conversation Composer Output
export interface ConversationComposerOutput {
  message: string;
  emotion: Emotion;
  followUpQuestion?: string;
  riskLevel?: string;
  vetRecommended?: boolean;
  concernId?: string;
  responsePattern: string;
  shouldScheduleFollowUp: boolean;
  followUpSchedule?: {
    type: FollowUpType;
    message: string;
    scheduledFor: Date;
  };
}
