import { UserRepository } from '@/repositories/user-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { ConversationRepository } from '@/repositories/conversation-repository';
import { CompanionRepository } from '@/repositories/companion-repository';
import { IntentExtractor } from '@/lib/ai/intent-extractor';
import { SymptomEngine } from '@/lib/decision-engine/symptom-engine';
import { FoodEngine } from '@/lib/decision-engine/food-engine';
import { BehaviorEngine } from '@/lib/decision-engine/behavior-engine';
import { EventLogger } from '@/lib/events/event-logger';
import { EmotionDetector } from '@/lib/companion/emotion-detector';
import { ConversationComposer } from '@/lib/companion/conversation-composer';
import { EnhancedContextLoader } from '@/lib/companion/context-loader';
import { MemoryUpdater } from '@/lib/companion/memory-updater';
import { ConcernTracker } from '@/lib/companion/concern-tracker';
import { Intent, RiskLevel } from '@/types/db';
import { detectLanguage } from '@/lib/ai/language-detector';
import { FeatureService } from './feature-service';

export interface CompanionChatRequest {
  phone: string;
  message: string;
}

export interface CompanionChatResponse {
  intent: Intent;
  emotion: string;
  riskLevel: RiskLevel | null;
  reply: string;
  followUpQuestion?: string;
  vetRecommended?: boolean;
  needsOnboarding: boolean;
}

export class CompanionChatService {
  private userRepository: UserRepository;
  private petRepository: PetRepository;
  private conversationRepository: ConversationRepository;
  private companionRepository: CompanionRepository;
  private intentExtractor: IntentExtractor;
  private symptomEngine: SymptomEngine;
  private foodEngine: FoodEngine;
  private behaviorEngine: BehaviorEngine;
  private eventLogger: EventLogger;
  private featureService: FeatureService;
  
  // Companion components
  private emotionDetector: EmotionDetector;
  private conversationComposer: ConversationComposer;
  private contextLoader: EnhancedContextLoader;
  private memoryUpdater: MemoryUpdater;
  private concernTracker: ConcernTracker;

  constructor() {
    this.userRepository = new UserRepository();
    this.petRepository = new PetRepository();
    this.conversationRepository = new ConversationRepository();
    this.companionRepository = new CompanionRepository();
    this.intentExtractor = new IntentExtractor();
    this.symptomEngine = new SymptomEngine();
    this.foodEngine = new FoodEngine();
    this.behaviorEngine = new BehaviorEngine();
    this.eventLogger = new EventLogger();
    this.featureService = new FeatureService();
    
    this.emotionDetector = new EmotionDetector();
    this.conversationComposer = new ConversationComposer();
    this.contextLoader = new EnhancedContextLoader();
    this.memoryUpdater = new MemoryUpdater();
    this.concernTracker = new ConcernTracker();
  }

  async processMessage(request: CompanionChatRequest): Promise<CompanionChatResponse> {
    const detectedLanguage = detectLanguage(request.message);
    const user = await this.userRepository.findOrCreate(request.phone, detectedLanguage);
    const pet = await this.petRepository.findByUserId(user.id);

    // Ensure companion profiles exist
    await this.contextLoader.ensureProfiles(user.id, pet?.id);

    // Handle feature commands first
    if (pet) {
      const featureResponse = await this.featureService.processFeatureCommand({
        petId: pet.id,
        message: request.message,
        language: user.preferred_language
      });

      if (featureResponse.handled) {
        await this.conversationRepository.create({
          user_id: user.id,
          message: request.message,
          intent: 'GENERAL',
        });

        return {
          intent: 'GENERAL',
          emotion: 'NEUTRAL',
          riskLevel: null,
          reply: featureResponse.message,
          needsOnboarding: false,
        };
      }
    }

    // Get conversation history for context
    const recentConversations = await this.conversationRepository.getRecentByUserId(user.id, 5);
    const conversationHistory = recentConversations.map((c) => c.message);

    // STEP 1: Detect emotion (before intent)
    const emotionalAnalysis = await this.emotionDetector.detect(
      request.message,
      conversationHistory
    );

    // STEP 2: Extract intent
    const intentExtraction = await this.intentExtractor.extract(
      request.message,
      pet?.species || 'dog'
    );

    // STEP 3: Run decision engines
    let decisionResult: any = {};
    let riskLevel: RiskLevel | null = null;

    switch (intentExtraction.intent) {
      case 'SYMPTOM':
        if (intentExtraction.symptoms && intentExtraction.symptoms.length > 0) {
          const analysis = this.symptomEngine.analyze(
            intentExtraction.symptoms,
            pet?.species || 'dog'
          );
          decisionResult = analysis;
          riskLevel = analysis.riskLevel;

          if (pet) {
            await this.eventLogger.logSymptomEvent(
              pet.id,
              intentExtraction.symptoms,
              intentExtraction.urgency || 'UNKNOWN'
            );
          }
        }
        break;

      case 'FOOD':
        if (intentExtraction.foods && intentExtraction.foods.length > 0) {
          const analysis = this.foodEngine.analyze(intentExtraction.foods, pet?.species || 'dog');
          decisionResult = analysis;
          riskLevel = analysis.riskLevel;

          if (pet) {
            await this.eventLogger.logFoodEvent(
              pet.id,
              intentExtraction.foods,
              analysis.safe,
              analysis.riskLevel
            );
          }
        }
        break;

      case 'BEHAVIOR':
        if (intentExtraction.behaviors && intentExtraction.behaviors.length > 0) {
          const analysis = this.behaviorEngine.analyze(
            intentExtraction.behaviors,
            pet?.species || 'dog'
          );
          decisionResult = analysis;
          riskLevel = analysis.riskLevel;

          if (pet) {
            await this.eventLogger.logBehaviorEvent(
              pet.id,
              intentExtraction.behaviors,
              analysis.riskLevel
            );
          }
        }
        break;

      case 'GENERAL':
        decisionResult = {
          reasoning: 'General pet care question',
        };
        break;
    }

    // STEP 4: Load enhanced context
    const enhancedContext = await this.contextLoader.load(user.id, pet?.id);

    // STEP 5: Track concerns
    let concernId: string | undefined;
    if (pet) {
      const concernData = await this.concernTracker.detectConcernFromMessage(
        request.message,
        intentExtraction.intent
      );

      if (concernData) {
        const concern = await this.concernTracker.trackConcern(
          pet.id,
          concernData.topic,
          request.message,
          concernData.severity
        );
        concernId = concern.id;
      }
    }

    // STEP 6: Compose response using companion system
    const composerOutput = await this.conversationComposer.compose({
      userMessage: request.message,
      emotionalAnalysis,
      enhancedContext,
      intent: intentExtraction.intent,
      decisionResult,
      language: user.preferred_language,
    });

    // STEP 7: Update conversation state
    await this.companionRepository.updateConversationState(user.id, {
      current_emotion: emotionalAnalysis.emotion,
      urgency_level: emotionalAnalysis.urgency,
      current_topic: intentExtraction.intent,
      conversation_depth: (enhancedContext.conversationState?.conversation_depth || 0) + 1,
    });

    // STEP 8: Save response pattern (anti-repetition)
    await this.companionRepository.createResponseHistory({
      user_id: user.id,
      response_pattern: composerOutput.responsePattern,
    });

    // STEP 9: Schedule follow-up if needed
    if (composerOutput.shouldScheduleFollowUp && composerOutput.followUpSchedule && pet) {
      await this.companionRepository.createFollowUp({
        user_id: user.id,
        pet_id: pet.id,
        concern_id: concernId,
        follow_up_type: composerOutput.followUpSchedule.type,
        message: composerOutput.followUpSchedule.message,
        scheduled_for: composerOutput.followUpSchedule.scheduledFor.toISOString(),
      });
    }

    // STEP 10: Update memories
    if (pet) {
      await this.memoryUpdater.extractAndUpdateMemories(
        pet.id,
        request.message,
        conversationHistory
      );

      await this.memoryUpdater.updateOwnerProfile(
        user.id,
        request.message.length,
        emotionalAnalysis.confidence
      );
    }

    // STEP 11: Save conversation
    await this.conversationRepository.create({
      user_id: user.id,
      message: request.message,
      intent: intentExtraction.intent,
    });

    return {
      intent: intentExtraction.intent,
      emotion: emotionalAnalysis.emotion,
      riskLevel: composerOutput.riskLevel ? (composerOutput.riskLevel as RiskLevel) : riskLevel,
      reply: composerOutput.message,
      followUpQuestion: composerOutput.followUpQuestion,
      vetRecommended: composerOutput.vetRecommended,
      needsOnboarding: false,
    };
  }
}
