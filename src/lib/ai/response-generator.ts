import { Intent, RiskLevel } from '@/types/db';
import { PetContext } from '@/lib/pets/pet-context';
import { openai } from './openai';
import { MODELS } from './models';
import { PawPalResponse, PawPalResponseSchema } from './types';

export interface ResponseInput {
  userMessage: string;
  intent: Intent;
  petContext: PetContext | null;
  decisionResult: {
    riskLevel?: RiskLevel;
    followUpQuestions?: string[];
    reasoning?: string;
    action?: string;
    possibleCauses?: string[];
    monitoringSuggestions?: string[];
    vetRecommended?: boolean;
    safe?: boolean;
  };
  language: 'en' | 'id';
}

export class ResponseGenerator {
  async generate(input: ResponseInput): Promise<PawPalResponse> {
    const systemPrompt = this.buildSystemPrompt(input.language, input.petContext);
    const userPrompt = this.buildUserPrompt(input);

    const completion = await openai.chat.completions.create({
      model: MODELS.CHAT,
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
          name: 'pawpal_response',
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The main response message to the user',
              },
              followUpQuestion: {
                type: 'string',
                description: 'Optional follow-up question to ask the user',
              },
              riskLevel: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH'],
                description: 'Risk level assessment',
              },
              vetRecommended: {
                type: 'boolean',
                description: 'Whether veterinary consultation is recommended',
              },
            },
            required: ['message'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return PawPalResponseSchema.parse(parsed);
  }

  private buildSystemPrompt(language: 'en' | 'id', petContext: PetContext | null): string {
    const petName = petContext?.petName || 'your pet';
    const species = petContext?.species || 'pet';
    const breed = petContext?.breed || 'unknown breed';
    const age = petContext?.ageYears ? `${petContext.ageYears} years old` : 'unknown age';
    const weight = petContext?.weightKg ? `${petContext.weightKg} kg` : 'unknown weight';
    
    const petInfo = `Pet Name: ${petName}, Species: ${species}, Breed: ${breed}, Age: ${age}, Weight: ${weight}`;

    if (language === 'id') {
      return `Kamu adalah PawPal, asisten kesehatan hewan yang ramah dan helpful.

Info Pet: ${petInfo}

ATURAN PENTING:
- JANGAN diagnosa penyakit spesifik
- JANGAN kasih obat
- JANGAN gantiin dokter hewan
- Kalau serius, WAJIB suruh ke dokter hewan

CARA NGOBROL:
- Pakai bahasa Indonesia yang santai dan natural (kayak chat sama temen)
- SAMAIN TONE user - kalau dia santai, kamu juga santai. Kalau dia formal, kamu formal
- Kalau user pakai bahasa gaul/slang, kamu juga boleh pakai
- Singkat dan to the point - jangan bertele-tele
- Empati tapi ga lebay
- Pakai nama pet (${petName}) biar personal
- Kasih saran praktis yang bisa langsung dilakukan

CONTOH TONE:
User: "anjing gw muntah cok"
Kamu: "Waduh, ${petName} muntah ya? Udah berapa lama nih? Coba perhatiin..."

User: "Halo, anjing saya muntah"
Kamu: "Halo! ${petName} muntah ya? Sudah berapa lama? Mari kita lihat..."

Return JSON dengan struktur yang ditentukan.`;
    }

    return `You're PawPal, a friendly pet health assistant.

Pet Info: ${petInfo}

IMPORTANT RULES:
- DON'T diagnose specific diseases
- DON'T prescribe medication
- DON'T replace a vet
- If serious, MUST recommend seeing a vet

HOW TO TALK:
- Use natural, conversational English (like chatting with a friend)
- MATCH the user's tone - if they're casual, be casual. If formal, be formal
- Keep it short and to the point - no fluff
- Be empathetic but not overly dramatic
- Use the pet's name (${petName}) to personalize
- Give practical advice they can act on immediately

TONE EXAMPLES:
User: "my dog keeps throwing up"
You: "Oh no! How long has ${petName} been vomiting? Let's figure this out..."

User: "Good morning, my dog is vomiting"
You: "Good morning! I'm sorry ${petName} isn't feeling well. How long has this been happening?"

Return response in the specified JSON format.`;
  }

  private buildUserPrompt(input: ResponseInput): string {
    const { userMessage, intent, decisionResult } = input;

    let prompt = `User message: "${userMessage}"\n\n`;
    prompt += `Intent: ${intent}\n\n`;

    if (decisionResult.riskLevel) {
      prompt += `Risk Level: ${decisionResult.riskLevel}\n`;
    }

    if (decisionResult.reasoning) {
      prompt += `Reasoning: ${decisionResult.reasoning}\n`;
    }

    if (decisionResult.action) {
      prompt += `Recommended Action: ${decisionResult.action}\n`;
    }

    if (decisionResult.possibleCauses && decisionResult.possibleCauses.length > 0) {
      prompt += `Possible Causes: ${decisionResult.possibleCauses.join(', ')}\n`;
    }

    if (decisionResult.monitoringSuggestions && decisionResult.monitoringSuggestions.length > 0) {
      prompt += `Monitoring Suggestions: ${decisionResult.monitoringSuggestions.join(', ')}\n`;
    }

    if (decisionResult.vetRecommended !== undefined) {
      prompt += `Vet Recommended: ${decisionResult.vetRecommended ? 'Yes' : 'No'}\n`;
    }

    if (decisionResult.safe !== undefined) {
      prompt += `Safe: ${decisionResult.safe ? 'Yes' : 'No'}\n`;
    }

    if (decisionResult.followUpQuestions && decisionResult.followUpQuestions.length > 0) {
      prompt += `\nFollow-up questions to ask:\n`;
      decisionResult.followUpQuestions.forEach((q, i) => {
        prompt += `${i + 1}. ${q}\n`;
      });
    }

    prompt += `\nGenerate a helpful, empathetic response that addresses the user's concern. `;
    prompt += `Include the most important follow-up question if applicable. `;
    prompt += `Keep the response concise (2-3 short paragraphs maximum).`;

    return prompt;
  }
}
