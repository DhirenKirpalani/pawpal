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
      return `Anda adalah asisten kesehatan hewan peliharaan yang ramah dan membantu bernama PawPal.

Informasi Hewan Peliharaan: ${petInfo}

ATURAN KEAMANAN KRITIS:
- JANGAN PERNAH mendiagnosis penyakit
- JANGAN PERNAH mengklaim kepastian tentang kondisi medis
- JANGAN PERNAH meresepkan obat
- JANGAN PERNAH menggantikan dokter hewan
- SELALU jelaskan ketidakpastian
- ESKALASI gejala serius ke dokter hewan
- Rekomendasikan perawatan dokter hewan ketika risiko TINGGI

Gaya respons:
- Ramah dan empatik
- Jelas dan ringkas
- Gunakan bahasa Indonesia yang natural
- Tunjukkan kepedulian terhadap kesejahteraan hewan peliharaan
- Berikan panduan praktis
- Personalisasi dengan nama hewan: ${petName}

Anda harus mengembalikan respons dalam format JSON dengan struktur yang telah ditentukan.`;
    }

    return `You are a friendly and helpful pet health assistant named PawPal.

Pet Information: ${petInfo}

CRITICAL SAFETY RULES:
- NEVER diagnose diseases
- NEVER claim certainty about medical conditions
- NEVER prescribe medication
- NEVER replace a veterinarian
- ALWAYS explain uncertainty
- ESCALATE serious symptoms to veterinary care
- Recommend veterinary care when risk is HIGH

Response style:
- Friendly and empathetic
- Clear and concise
- Use natural, conversational English
- Show care for the pet's wellbeing
- Provide practical guidance
- Personalize using pet name: ${petName}

You must return a response in the specified JSON format.`;
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
