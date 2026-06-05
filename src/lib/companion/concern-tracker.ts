import { CompanionRepository } from '@/repositories/companion-repository';
import { Concern, ConcernStatus, Severity } from '@/types/companion';

export class ConcernTracker {
  private companionRepo: CompanionRepository;

  constructor() {
    this.companionRepo = new CompanionRepository();
  }

  async trackConcern(
    petId: string,
    topic: string,
    description: string,
    severity: Severity
  ): Promise<Concern> {
    // Check if similar concern already exists
    const activeConcerns = await this.companionRepo.getActiveConcerns(petId);
    const existingConcern = activeConcerns.find((c) =>
      this.isSimilarTopic(c.topic, topic)
    );

    if (existingConcern) {
      // Update existing concern
      return await this.companionRepo.updateConcern(existingConcern.id, {
        description: `${existingConcern.description}\n\nUpdate: ${description}`,
        severity,
        last_mentioned_at: new Date().toISOString(),
      });
    }

    // Create new concern
    return await this.companionRepo.createConcern({
      pet_id: petId,
      topic,
      description,
      severity,
    });
  }

  async updateConcernStatus(
    concernId: string,
    status: ConcernStatus,
    note?: string
  ): Promise<Concern> {
    const updates: Partial<Concern> = {
      status,
      last_mentioned_at: new Date().toISOString(),
    };

    if (status === 'RESOLVED') {
      updates.resolved_at = new Date().toISOString();
    }

    if (note) {
      const concern = await this.companionRepo.getActiveConcerns(''); // Get by ID
      updates.description = `${concern[0]?.description}\n\nUpdate: ${note}`;
    }

    return await this.companionRepo.updateConcern(concernId, updates);
  }

  async detectConcernFromMessage(
    message: string,
    intent: string
  ): Promise<{ topic: string; severity: Severity } | null> {
    const lower = message.toLowerCase();

    // Symptom-based concerns
    if (intent === 'SYMPTOM') {
      if (
        lower.includes('vomit') ||
        lower.includes('diarrhea') ||
        lower.includes('bleeding')
      ) {
        return {
          topic: this.extractSymptomTopic(message),
          severity: 'HIGH',
        };
      }
      if (
        lower.includes('not eating') ||
        lower.includes('lethargic') ||
        lower.includes('cough')
      ) {
        return {
          topic: this.extractSymptomTopic(message),
          severity: 'MEDIUM',
        };
      }
      if (lower.includes('scratch') || lower.includes('sneeze')) {
        return {
          topic: this.extractSymptomTopic(message),
          severity: 'LOW',
        };
      }
    }

    // Food-based concerns
    if (intent === 'FOOD') {
      if (
        lower.includes('chocolate') ||
        lower.includes('grapes') ||
        lower.includes('onion')
      ) {
        return {
          topic: 'Toxic food ingestion',
          severity: 'HIGH',
        };
      }
      return {
        topic: 'Food safety question',
        severity: 'LOW',
      };
    }

    // Behavior-based concerns
    if (intent === 'BEHAVIOR') {
      if (lower.includes('aggressive') || lower.includes('biting')) {
        return {
          topic: 'Aggressive behavior',
          severity: 'MEDIUM',
        };
      }
      return {
        topic: 'Behavioral issue',
        severity: 'LOW',
      };
    }

    return null;
  }

  async checkForImprovements(petId: string): Promise<Concern[]> {
    const concerns = await this.companionRepo.getActiveConcerns(petId);
    const improving: Concern[] = [];

    for (const concern of concerns) {
      const daysSinceReport = Math.floor(
        (Date.now() - new Date(concern.first_reported_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // If concern hasn't been mentioned in 3+ days and was being monitored
      const daysSinceLastMention = Math.floor(
        (Date.now() - new Date(concern.last_mentioned_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (
        concern.status === 'MONITORING' &&
        daysSinceLastMention >= 3 &&
        daysSinceReport >= 3
      ) {
        // Likely improving
        await this.companionRepo.updateConcern(concern.id, {
          status: 'IMPROVING',
        });
        improving.push(concern);
      }
    }

    return improving;
  }

  private isSimilarTopic(topic1: string, topic2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().trim();
    const t1 = normalize(topic1);
    const t2 = normalize(topic2);

    // Exact match
    if (t1 === t2) return true;

    // Contains match
    if (t1.includes(t2) || t2.includes(t1)) return true;

    // Keyword overlap
    const keywords1 = t1.split(' ');
    const keywords2 = t2.split(' ');
    const overlap = keywords1.filter((k) => keywords2.includes(k));

    return overlap.length >= 2;
  }

  private extractSymptomTopic(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes('vomit')) return 'Vomiting';
    if (lower.includes('diarrhea')) return 'Diarrhea';
    if (lower.includes('not eating')) return 'Loss of appetite';
    if (lower.includes('lethargic')) return 'Lethargy';
    if (lower.includes('cough')) return 'Coughing';
    if (lower.includes('scratch')) return 'Scratching/Itching';
    if (lower.includes('sneeze')) return 'Sneezing';
    if (lower.includes('limp')) return 'Limping';
    if (lower.includes('bleeding')) return 'Bleeding';

    return 'Health concern';
  }
}
