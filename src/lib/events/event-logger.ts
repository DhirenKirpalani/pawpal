import { PetEventRepository } from '@/repositories/pet-event-repository';
import { Intent } from '@/types/db';

export class EventLogger {
  private petEventRepository: PetEventRepository;

  constructor() {
    this.petEventRepository = new PetEventRepository();
  }

  async logSymptomEvent(
    petId: string,
    symptoms: string[],
    urgency: string
  ): Promise<void> {
    await this.petEventRepository.create({
      pet_id: petId,
      event_type: 'symptom',
      details: {
        symptoms,
        urgency,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logFoodEvent(
    petId: string,
    foods: string[],
    safe: boolean,
    riskLevel: string
  ): Promise<void> {
    await this.petEventRepository.create({
      pet_id: petId,
      event_type: 'food',
      details: {
        foods,
        safe,
        riskLevel,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logBehaviorEvent(
    petId: string,
    behaviors: string[],
    riskLevel: string
  ): Promise<void> {
    await this.petEventRepository.create({
      pet_id: petId,
      event_type: 'behavior',
      details: {
        behaviors,
        riskLevel,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async logEventFromIntent(
    petId: string,
    intent: Intent,
    extractedData: {
      symptoms?: string[];
      foods?: string[];
      behaviors?: string[];
      urgency?: string;
      safe?: boolean;
      riskLevel?: string;
    }
  ): Promise<void> {
    switch (intent) {
      case 'SYMPTOM':
        if (extractedData.symptoms && extractedData.symptoms.length > 0) {
          await this.logSymptomEvent(
            petId,
            extractedData.symptoms,
            extractedData.urgency || 'UNKNOWN'
          );
        }
        break;

      case 'FOOD':
        if (extractedData.foods && extractedData.foods.length > 0) {
          await this.logFoodEvent(
            petId,
            extractedData.foods,
            extractedData.safe ?? true,
            extractedData.riskLevel || 'UNKNOWN'
          );
        }
        break;

      case 'BEHAVIOR':
        if (extractedData.behaviors && extractedData.behaviors.length > 0) {
          await this.logBehaviorEvent(
            petId,
            extractedData.behaviors,
            extractedData.riskLevel || 'UNKNOWN'
          );
        }
        break;

      default:
        break;
    }
  }
}
