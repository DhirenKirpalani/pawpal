import { UserRepository } from '@/repositories/user-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { ConversationRepository } from '@/repositories/conversation-repository';
import { IntentExtractor } from '@/lib/ai/intent-extractor';
import { ResponseGenerator } from '@/lib/ai/response-generator';
import { SymptomEngine } from '@/lib/decision-engine/symptom-engine';
import { FoodEngine } from '@/lib/decision-engine/food-engine';
import { BehaviorEngine } from '@/lib/decision-engine/behavior-engine';
import { PetContextLoader } from '@/lib/pets/pet-context';
import { EventLogger } from '@/lib/events/event-logger';
import { Intent, RiskLevel } from '@/types/db';
import { detectLanguage } from '@/lib/ai/language-detector';
import { PawPalResponse } from '@/lib/ai/types';
import { FeatureService } from './feature-service';

export interface ChatRequest {
  phone: string;
  message: string;
}

export interface ChatResponse {
  intent: Intent;
  riskLevel: RiskLevel | null;
  reply: string;
  followUpQuestion?: string;
  vetRecommended?: boolean;
  needsOnboarding: boolean;
}

export class ChatService {
  private userRepository: UserRepository;
  private petRepository: PetRepository;
  private conversationRepository: ConversationRepository;
  private intentExtractor: IntentExtractor;
  private responseGenerator: ResponseGenerator;
  private symptomEngine: SymptomEngine;
  private foodEngine: FoodEngine;
  private behaviorEngine: BehaviorEngine;
  private petContextLoader: PetContextLoader;
  private eventLogger: EventLogger;
  private featureService: FeatureService;

  constructor() {
    this.userRepository = new UserRepository();
    this.petRepository = new PetRepository();
    this.conversationRepository = new ConversationRepository();
    this.intentExtractor = new IntentExtractor();
    this.responseGenerator = new ResponseGenerator();
    this.symptomEngine = new SymptomEngine();
    this.foodEngine = new FoodEngine();
    this.behaviorEngine = new BehaviorEngine();
    this.petContextLoader = new PetContextLoader();
    this.eventLogger = new EventLogger();
    this.featureService = new FeatureService();
  }

  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    const detectedLanguage = detectLanguage(request.message);
    const user = await this.userRepository.findOrCreate(request.phone, detectedLanguage);

    const pet = await this.petRepository.findByUserId(user.id);
    const petContext = pet ? await this.petContextLoader.load(user.id) : null;

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
          riskLevel: null,
          reply: featureResponse.message,
          needsOnboarding: false,
        };
      }
    }

    const intentExtraction = await this.intentExtractor.extract(
      request.message,
      pet?.species || 'dog'
    );

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

    const response: PawPalResponse = await this.responseGenerator.generate({
      userMessage: request.message,
      intent: intentExtraction.intent,
      petContext,
      decisionResult,
      language: user.preferred_language,
    });

    await this.conversationRepository.create({
      user_id: user.id,
      message: request.message,
      intent: intentExtraction.intent,
    });

    return {
      intent: intentExtraction.intent,
      riskLevel: response.riskLevel ? (response.riskLevel as RiskLevel) : riskLevel,
      reply: response.message,
      followUpQuestion: response.followUpQuestion,
      vetRecommended: response.vetRecommended,
      needsOnboarding: false,
    };
  }

  private getOnboardingMessage(language: 'en' | 'id'): string {
    if (language === 'id') {
      return `Halo! Saya PawPal, asisten kesehatan hewan peliharaan Anda. 🐾

Untuk memberikan panduan yang lebih baik, saya perlu tahu tentang hewan peliharaan Anda.

Silakan berikan informasi berikut:
1. Nama hewan peliharaan
2. Jenis (kucing/anjing)
3. Ras (opsional)
4. Umur (tahun)
5. Berat (kg)

Contoh: "Nama: Luna, Jenis: kucing, Ras: Persia, Umur: 2 tahun, Berat: 4 kg"`;
    }

    return `Hello! I'm PawPal, your AI pet health assistant. 🐾

To provide better guidance, I need to know about your pet.

Please provide the following information:
1. Pet name
2. Species (cat/dog)
3. Breed (optional)
4. Age (years)
5. Weight (kg)

Example: "Name: Luna, Species: cat, Breed: Persian, Age: 2 years, Weight: 4 kg"`;
  }
}
