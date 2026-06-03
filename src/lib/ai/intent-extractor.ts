import { z } from 'zod';
import { Intent, RiskLevel } from '@/types/db';
import { openai } from './openai';
import { MODELS } from './models';
import { detectIntentByRules } from './rule-intent-detector';

const IntentExtractionSchema = z.object({
  intent: z.enum(['SYMPTOM', 'FOOD', 'BEHAVIOR', 'GENERAL']),
  symptoms: z.array(z.string()).optional(),
  foods: z.array(z.string()).optional(),
  behaviors: z.array(z.string()).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export type IntentExtraction = z.infer<typeof IntentExtractionSchema>;

export class IntentExtractor {
  async extract(message: string, petSpecies: string): Promise<IntentExtraction> {
    const ruleBasedIntent = detectIntentByRules(message);
    
    if (ruleBasedIntent) {
      return {
        intent: ruleBasedIntent,
        symptoms: ruleBasedIntent === 'SYMPTOM' ? [message] : undefined,
        foods: ruleBasedIntent === 'FOOD' ? [message] : undefined,
        behaviors: ruleBasedIntent === 'BEHAVIOR' ? [message] : undefined,
        urgency: 'MEDIUM',
      };
    }

    const completion = await openai.chat.completions.create({
      model: MODELS.CLASSIFIER,
      messages: [
        {
          role: 'system',
          content: `You are an intent classifier for a pet health assistant. The pet is a ${petSpecies}.
          
Classify the user's message into one of these intents:
- SYMPTOM: User describes health symptoms (vomiting, diarrhea, lethargy, coughing, sneezing, itching, loss of appetite, etc.)
- FOOD: User asks if a food is safe for their pet
- BEHAVIOR: User describes behavioral issues (aggression, hiding, excessive meowing/barking, restlessness, etc.)
- GENERAL: General pet care questions

For SYMPTOM intent:
- Extract all symptoms mentioned
- Assess urgency (LOW, MEDIUM, HIGH) based on severity and combination of symptoms
- Multiple symptoms or severe symptoms = HIGH urgency
- Single mild symptom = LOW urgency

For FOOD intent:
- Extract all foods mentioned
- Assess urgency based on toxicity risk

For BEHAVIOR intent:
- Extract behaviors mentioned
- Assess urgency based on severity

Return a JSON object with the classification.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'intent_extraction',
          schema: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                enum: ['SYMPTOM', 'FOOD', 'BEHAVIOR', 'GENERAL'],
              },
              symptoms: {
                type: 'array',
                items: { type: 'string' },
              },
              foods: {
                type: 'array',
                items: { type: 'string' },
              },
              behaviors: {
                type: 'array',
                items: { type: 'string' },
              },
              urgency: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH'],
              },
            },
            required: ['intent'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return IntentExtractionSchema.parse(parsed);
  }
}
