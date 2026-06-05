import { CompanionRepository } from '@/repositories/companion-repository';
import { openai } from '../ai/openai';
import { MODELS } from '../ai/models';
import { z } from 'zod';

const MemoryExtractionSchema = z.object({
  personalityTraits: z.array(z.string()),
  healthPatterns: z.array(z.string()),
  favoriteActivities: z.array(z.string()),
  sensitivities: z.array(z.string()),
  behavioralNotes: z.array(z.string()),
});

export class MemoryUpdater {
  private companionRepo: CompanionRepository;

  constructor() {
    this.companionRepo = new CompanionRepository();
  }

  async extractAndUpdateMemories(
    petId: string,
    userMessage: string,
    conversationHistory: string[]
  ): Promise<void> {
    const extraction = await this.extractMemories(userMessage, conversationHistory);

    const currentMemory = await this.companionRepo.getPetMemoryProfile(petId);
    if (!currentMemory) return;

    // Merge new memories with existing ones (avoid duplicates)
    const updatedMemory = {
      personality_traits: this.mergeUnique(
        currentMemory.personality_traits,
        extraction.personalityTraits
      ),
      health_patterns: this.mergeUnique(currentMemory.health_patterns, extraction.healthPatterns),
      favorite_activities: this.mergeUnique(
        currentMemory.favorite_activities,
        extraction.favoriteActivities
      ),
      sensitivities: this.mergeUnique(currentMemory.sensitivities, extraction.sensitivities),
      behavioral_notes: this.mergeUnique(
        currentMemory.behavioral_notes,
        extraction.behavioralNotes
      ),
    };

    await this.companionRepo.updatePetMemoryProfile(petId, updatedMemory);
  }

  private async extractMemories(
    userMessage: string,
    conversationHistory: string[]
  ): Promise<z.infer<typeof MemoryExtractionSchema>> {
    const systemPrompt = `You are a memory extraction system for PawPal.

Extract memorable facts about the pet from the conversation.

WHAT TO EXTRACT:

PERSONALITY TRAITS:
- "Rocky is very energetic"
- "Luna is shy around strangers"
- "Max loves attention"
- "Mochi is curious and playful"

HEALTH PATTERNS:
- "Rocky has a sensitive stomach"
- "Luna tends to get car sick"
- "Max gets anxious during thunderstorms"
- "Mochi has seasonal allergies"

FAVORITE ACTIVITIES:
- "Rocky loves chasing balls"
- "Luna enjoys laser pointer games"
- "Max likes swimming"
- "Mochi loves climbing"

SENSITIVITIES:
- "Rocky can't eat chicken"
- "Luna is sensitive to dairy"
- "Max is allergic to pollen"
- "Mochi reacts badly to certain treats"

BEHAVIORAL NOTES:
- "Rocky barks at delivery people"
- "Luna hides when visitors come"
- "Max gets excited when seeing other dogs"
- "Mochi scratches furniture when bored"

RULES:
- Extract only FACTS mentioned by the user
- Keep statements concise (under 10 words)
- Focus on recurring patterns, not one-time events
- Avoid medical diagnoses
- Return empty arrays if nothing to extract

Return JSON with arrays of extracted memories.`;

    const userPrompt = `Current message: "${userMessage}"\n\nRecent conversation:\n${conversationHistory.join('\n')}`;

    const completion = await openai.chat.completions.create({
      model: MODELS.CLASSIFIER,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'memory_extraction',
          schema: {
            type: 'object',
            properties: {
              personalityTraits: {
                type: 'array',
                items: { type: 'string' },
              },
              healthPatterns: {
                type: 'array',
                items: { type: 'string' },
              },
              favoriteActivities: {
                type: 'array',
                items: { type: 'string' },
              },
              sensitivities: {
                type: 'array',
                items: { type: 'string' },
              },
              behavioralNotes: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: [
              'personalityTraits',
              'healthPatterns',
              'favoriteActivities',
              'sensitivities',
              'behavioralNotes',
            ],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return {
        personalityTraits: [],
        healthPatterns: [],
        favoriteActivities: [],
        sensitivities: [],
        behavioralNotes: [],
      };
    }

    const parsed = JSON.parse(content);
    return MemoryExtractionSchema.parse(parsed);
  }

  private mergeUnique(existing: string[], newItems: string[]): string[] {
    const combined = [...existing, ...newItems];
    const unique = Array.from(new Set(combined.map((item) => item.toLowerCase())));
    
    // Return original casing from combined array
    return unique.map((lower) => {
      return combined.find((item) => item.toLowerCase() === lower) || lower;
    }).slice(0, 20); // Limit to 20 items per category
  }

  async updateOwnerProfile(
    userId: string,
    messageLength: number,
    emotionalIntensity: number
  ): Promise<void> {
    const profile = await this.companionRepo.getOwnerProfile(userId);
    if (!profile) return;

    // Infer communication style from message length
    const avgLength = messageLength;
    let communicationStyle = profile.communication_style;
    if (avgLength < 50) {
      communicationStyle = 'SHORT';
    } else if (avgLength > 100) {
      communicationStyle = 'CONVERSATIONAL';
    }

    // Infer anxiety from emotional intensity
    let anxietyProfile = profile.anxiety_profile;
    if (emotionalIntensity > 0.7) {
      anxietyProfile = 'HIGH';
    } else if (emotionalIntensity < 0.3) {
      anxietyProfile = 'LOW';
    } else {
      anxietyProfile = 'MEDIUM';
    }

    await this.companionRepo.updateOwnerProfile(userId, {
      communication_style: communicationStyle,
      anxiety_profile: anxietyProfile,
    });
  }
}
