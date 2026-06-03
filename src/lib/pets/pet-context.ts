import { Pet, Conversation, PetEvent } from '@/types/db';
import { PetRepository } from '@/repositories/pet-repository';
import { ConversationRepository } from '@/repositories/conversation-repository';
import { PetEventRepository } from '@/repositories/pet-event-repository';

export interface PetContext {
  petName: string;
  species: 'cat' | 'dog';
  breed: string | null;
  ageYears: number | null;
  weightKg: number | null;
  recentConversations: Conversation[];
  recentEvents: PetEvent[];
}

export class PetContextLoader {
  private petRepository: PetRepository;
  private conversationRepository: ConversationRepository;
  private petEventRepository: PetEventRepository;

  constructor() {
    this.petRepository = new PetRepository();
    this.conversationRepository = new ConversationRepository();
    this.petEventRepository = new PetEventRepository();
  }

  async load(userId: string): Promise<PetContext | null> {
    const pet = await this.petRepository.findByUserId(userId);
    if (!pet) {
      return null;
    }

    const [recentConversations, recentEvents] = await Promise.all([
      this.conversationRepository.getRecentByUserId(userId, 5),
      this.petEventRepository.getRecentByPetId(pet.id, 10),
    ]);

    return {
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageYears: pet.age_years,
      weightKg: pet.weight_kg,
      recentConversations,
      recentEvents,
    };
  }

  async getPet(userId: string): Promise<Pet | null> {
    return this.petRepository.findByUserId(userId);
  }
}
