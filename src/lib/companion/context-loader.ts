import { CompanionRepository } from '@/repositories/companion-repository';
import { EnhancedContext } from '@/types/companion';

export class EnhancedContextLoader {
  private companionRepo: CompanionRepository;

  constructor() {
    this.companionRepo = new CompanionRepository();
  }

  async load(userId: string, petId?: string): Promise<EnhancedContext> {
    const [
      petMemory,
      ownerProfile,
      conversationState,
      activeConcerns,
      recentResponses,
      conversationArc,
    ] = await Promise.all([
      petId ? this.companionRepo.getPetMemoryProfile(petId) : Promise.resolve(null),
      this.companionRepo.getOwnerProfile(userId),
      this.companionRepo.getConversationState(userId),
      petId ? this.companionRepo.getActiveConcerns(petId) : Promise.resolve([]),
      this.companionRepo.getRecentResponseHistory(userId, 5),
      this.companionRepo.getActiveConversationArc(userId),
    ]);

    return {
      petMemory,
      ownerProfile,
      conversationState,
      activeConcerns,
      recentResponses,
      conversationArc,
    };
  }

  async ensureProfiles(userId: string, petId?: string): Promise<void> {
    // Ensure owner profile exists
    const ownerProfile = await this.companionRepo.getOwnerProfile(userId);
    if (!ownerProfile) {
      await this.companionRepo.createOwnerProfile({
        user_id: userId,
        experience_level: 'NEW',
        communication_style: 'CONVERSATIONAL',
        anxiety_profile: 'MEDIUM',
        engagement_style: 'BALANCED',
      });
    }

    // Ensure conversation state exists
    const conversationState = await this.companionRepo.getConversationState(userId);
    if (!conversationState) {
      await this.companionRepo.createConversationState(userId, petId);
    }

    // Ensure pet memory profile exists
    if (petId) {
      const petMemory = await this.companionRepo.getPetMemoryProfile(petId);
      if (!petMemory) {
        await this.companionRepo.createPetMemoryProfile({
          pet_id: petId,
          personality_traits: [],
          health_patterns: [],
          favorite_activities: [],
          sensitivities: [],
        });
      }
    }
  }
}
