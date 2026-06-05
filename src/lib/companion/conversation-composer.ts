import { openai } from '../ai/openai';
import { MODELS } from '../ai/models';
import {
  ConversationComposerInput,
  ConversationComposerOutput,
  Emotion,
  FollowUpType,
} from '@/types/companion';
import { z } from 'zod';

const ComposerResponseSchema = z.object({
  acknowledgment: z.string(),
  understanding: z.string(),
  guidance: z.string(),
  followUpQuestion: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  vetRecommended: z.boolean().optional(),
  shouldScheduleFollowUp: z.boolean(),
  followUpType: z.enum(['SYMPTOM_CHECK', 'FOOD_INCIDENT', 'VET_VISIT', 'IMPROVEMENT_CHECK', 'GENERAL']).optional(),
  followUpHoursDelay: z.number().optional(),
});

export class ConversationComposer {
  async compose(input: ConversationComposerInput): Promise<ConversationComposerOutput> {
    const systemPrompt = this.buildSystemPrompt(input);
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
          name: 'conversation_composer',
          schema: {
            type: 'object',
            properties: {
              acknowledgment: {
                type: 'string',
                description: 'Emotional acknowledgment of user state',
              },
              understanding: {
                type: 'string',
                description: 'Show understanding of situation',
              },
              guidance: {
                type: 'string',
                description: 'Practical guidance and advice',
              },
              followUpQuestion: {
                type: 'string',
                description: 'Natural follow-up question (max 1)',
              },
              riskLevel: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH'],
              },
              vetRecommended: {
                type: 'boolean',
              },
              shouldScheduleFollowUp: {
                type: 'boolean',
                description: 'Whether to schedule automated follow-up',
              },
              followUpType: {
                type: 'string',
                enum: ['SYMPTOM_CHECK', 'FOOD_INCIDENT', 'VET_VISIT', 'IMPROVEMENT_CHECK', 'GENERAL'],
              },
              followUpHoursDelay: {
                type: 'number',
                description: 'Hours until follow-up (12-72)',
              },
            },
            required: ['acknowledgment', 'understanding', 'guidance', 'shouldScheduleFollowUp'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.8,
      max_tokens: 600,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from conversation composer');
    }

    const parsed = JSON.parse(content);
    const validated = ComposerResponseSchema.parse(parsed);

    // Compose final message
    const messageParts: string[] = [];
    
    // Step 1: Acknowledge emotion
    messageParts.push(validated.acknowledgment);
    
    // Step 2: Show understanding
    if (validated.understanding) {
      messageParts.push(validated.understanding);
    }
    
    // Step 3: Provide guidance
    messageParts.push(validated.guidance);
    
    // Step 4: Follow-up question (if appropriate)
    if (validated.followUpQuestion) {
      messageParts.push(validated.followUpQuestion);
    }

    const message = messageParts.join('\n\n');

    // Determine response pattern for anti-repetition
    const responsePattern = this.categorizeResponsePattern(validated);

    // Build follow-up schedule if needed
    let followUpSchedule;
    if (validated.shouldScheduleFollowUp && validated.followUpType && validated.followUpHoursDelay) {
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + validated.followUpHoursDelay);

      followUpSchedule = {
        type: validated.followUpType,
        message: this.generateFollowUpMessage(validated.followUpType, input),
        scheduledFor,
      };
    }

    return {
      message,
      emotion: input.emotionalAnalysis.emotion,
      followUpQuestion: validated.followUpQuestion,
      riskLevel: validated.riskLevel,
      vetRecommended: validated.vetRecommended,
      responsePattern,
      shouldScheduleFollowUp: validated.shouldScheduleFollowUp,
      followUpSchedule,
    };
  }

  private buildSystemPrompt(input: ConversationComposerInput): string {
    const { enhancedContext, language, emotionalAnalysis } = input;
    const petName = enhancedContext.petMemory?.personality_traits?.[0] || 'your pet';
    const ownerProfile = enhancedContext.ownerProfile;

    const basePrompt = language === 'id' 
      ? this.buildIndonesianPrompt(petName, emotionalAnalysis.emotion, ownerProfile)
      : this.buildEnglishPrompt(petName, emotionalAnalysis.emotion, ownerProfile);

    return basePrompt;
  }

  private buildEnglishPrompt(petName: string, emotion: Emotion, ownerProfile: any): string {
    return `You are PawPal, a caring pet health companion (NOT just a tool).

CRITICAL: You are having a conversation with a real person who loves their pet.

USER EMOTION: ${emotion}

CONVERSATION FLOW (MANDATORY):
1. ACKNOWLEDGE - Recognize their emotional state first
2. UNDERSTAND - Show you get their situation  
3. GUIDE - Provide practical advice
4. FOLLOW-UP - Ask ONE natural question (if needed)

EMOTIONAL RESPONSES BY STATE:

WORRIED/ANXIOUS:
- Start with reassurance: "I understand you're concerned about ${petName}..."
- Calm tone, avoid alarming language
- Focus on what they CAN do right now

FRUSTRATED:
- Validate their feelings: "I can see this has been really challenging..."
- Acknowledge the difficulty
- Offer fresh perspective or approach

GUILTY:
- Remove blame: "These things happen, you're doing your best..."
- Focus on moving forward
- Reassure them

RELIEVED/PROUD:
- Celebrate with them: "That's wonderful news about ${petName}!"
- Acknowledge their good care
- Encourage continued monitoring

NEUTRAL/CURIOUS:
- Be friendly and informative
- Match their casual tone

PERSONALITY RULES:
- Use ${petName}'s name naturally (not every sentence)
- Write like you're texting a friend
- Short paragraphs (2-3 sentences max)
- ONE follow-up question maximum
- Avoid: "I understand your concern" (overused)
- Avoid: Medical jargon unless necessary
- Avoid: Long lists

ANTI-REPETITION:
- Vary your openings
- Don't always say "I'm sorry to hear that"
- Mix up follow-up styles

FOLLOW-UP SCHEDULING:
- Schedule follow-up for ongoing concerns
- Symptom checks: 12-24 hours
- Food incidents: 4-8 hours  
- Vet visits: 24-48 hours after appointment
- Improvements: 48-72 hours

Return JSON with: acknowledgment, understanding, guidance, followUpQuestion, riskLevel, vetRecommended, shouldScheduleFollowUp, followUpType, followUpHoursDelay`;
  }

  private buildIndonesianPrompt(petName: string, emotion: Emotion, ownerProfile: any): string {
    return `Kamu adalah PawPal, teman peduli kesehatan hewan (BUKAN cuma tool).

PENTING: Kamu lagi ngobrol sama orang yang sayang banget sama hewan peliharaannya.

EMOSI USER: ${emotion}

ALUR PERCAKAPAN (WAJIB):
1. ACKNOWLEDGE - Akui dulu perasaan mereka
2. UNDERSTAND - Tunjukkan kamu ngerti situasinya
3. GUIDE - Kasih saran praktis
4. FOLLOW-UP - Tanya SATU pertanyaan natural (kalau perlu)

RESPONS EMOSIONAL:

WORRIED/ANXIOUS (Khawatir/Cemas):
- Mulai dengan menenangkan: "Aku ngerti kamu khawatir sama ${petName}..."
- Tone kalem, jangan bikin makin panik
- Fokus ke apa yang bisa dilakukan sekarang

FRUSTRATED (Frustasi):
- Validasi perasaan: "Aku paham ini pasti melelahkan..."
- Akui kesulitannya
- Kasih perspektif atau pendekatan baru

GUILTY (Merasa Bersalah):
- Hilangkan rasa bersalah: "Hal kayak gini bisa terjadi, kamu udah berusaha kok..."
- Fokus ke solusi ke depan
- Yakinkan mereka

RELIEVED/PROUD (Lega/Bangga):
- Rayakan bareng: "Wah, kabar bagus tentang ${petName}!"
- Apresiasi perawatan mereka
- Dorong tetap monitor

NEUTRAL/CURIOUS:
- Ramah dan informatif
- Ikutin tone santai mereka

ATURAN KEPRIBADIAN:
- Pakai nama ${petName} secara natural (ga tiap kalimat)
- Nulis kayak lagi chat sama temen
- Paragraf pendek (2-3 kalimat max)
- SATU pertanyaan follow-up maksimal
- Hindari: "Aku paham kekhawatiranmu" (terlalu sering)
- Hindari: Bahasa medis kecuali perlu
- Hindari: List panjang

ANTI-PENGULANGAN:
- Variasi pembukaan
- Jangan selalu bilang "Turut prihatin"
- Mix up gaya follow-up

JADWAL FOLLOW-UP:
- Jadwalkan follow-up untuk masalah berkelanjutan
- Cek gejala: 12-24 jam
- Insiden makanan: 4-8 jam
- Kunjungan vet: 24-48 jam setelah appointment
- Perbaikan: 48-72 jam

Return JSON dengan: acknowledgment, understanding, guidance, followUpQuestion, riskLevel, vetRecommended, shouldScheduleFollowUp, followUpType, followUpHoursDelay`;
  }

  private buildUserPrompt(input: ConversationComposerInput): string {
    const { userMessage, emotionalAnalysis, enhancedContext, intent, decisionResult } = input;

    let prompt = `USER MESSAGE: "${userMessage}"\n\n`;
    prompt += `DETECTED EMOTION: ${emotionalAnalysis.emotion} (${emotionalAnalysis.confidence})\n`;
    prompt += `URGENCY: ${emotionalAnalysis.urgency}\n`;
    prompt += `INTENT: ${intent}\n\n`;

    // Add pet memory context
    if (enhancedContext.petMemory) {
      const memory = enhancedContext.petMemory;
      if (memory.health_patterns.length > 0) {
        prompt += `PET HEALTH PATTERNS: ${memory.health_patterns.join(', ')}\n`;
      }
      if (memory.personality_traits.length > 0) {
        prompt += `PET PERSONALITY: ${memory.personality_traits.join(', ')}\n`;
      }
      if (memory.sensitivities.length > 0) {
        prompt += `KNOWN SENSITIVITIES: ${memory.sensitivities.join(', ')}\n`;
      }
    }

    // Add active concerns
    if (enhancedContext.activeConcerns.length > 0) {
      prompt += `\nACTIVE CONCERNS:\n`;
      enhancedContext.activeConcerns.forEach((concern, i) => {
        const daysSince = Math.floor(
          (Date.now() - new Date(concern.first_reported_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        prompt += `${i + 1}. ${concern.topic} (${concern.status}, ${daysSince} days ago)\n`;
      });
    }

    // Add conversation arc
    if (enhancedContext.conversationArc) {
      const arc = enhancedContext.conversationArc;
      prompt += `\nCONVERSATION JOURNEY: ${arc.progress_status}\n`;
      if (arc.emotional_trajectory.length > 0) {
        prompt += `EMOTIONAL TRAJECTORY: ${arc.emotional_trajectory.join(' → ')}\n`;
      }
    }

    // Add recent response patterns (anti-repetition)
    if (enhancedContext.recentResponses.length > 0) {
      prompt += `\nRECENT RESPONSE PATTERNS (AVOID REPEATING):\n`;
      enhancedContext.recentResponses.slice(0, 3).forEach((resp, i) => {
        if (resp.opening_style) prompt += `- Opening: ${resp.opening_style}\n`;
        if (resp.empathy_phrase) prompt += `- Empathy: ${resp.empathy_phrase}\n`;
      });
    }

    // Add decision result
    if (decisionResult) {
      if (decisionResult.riskLevel) {
        prompt += `\nRISK LEVEL: ${decisionResult.riskLevel}\n`;
      }
      if (decisionResult.reasoning) {
        prompt += `REASONING: ${decisionResult.reasoning}\n`;
      }
      if (decisionResult.action) {
        prompt += `RECOMMENDED ACTION: ${decisionResult.action}\n`;
      }
    }

    prompt += `\nCompose a response following the 4-step flow: Acknowledge → Understand → Guide → Follow-up`;

    return prompt;
  }

  private categorizeResponsePattern(response: any): string {
    const patterns: string[] = [];
    
    if (response.acknowledgment.toLowerCase().includes('sorry')) {
      patterns.push('empathy_sorry');
    } else if (response.acknowledgment.toLowerCase().includes('understand')) {
      patterns.push('empathy_understand');
    } else {
      patterns.push('empathy_direct');
    }

    if (response.followUpQuestion) {
      if (response.followUpQuestion.includes('?')) {
        patterns.push('followup_question');
      } else {
        patterns.push('followup_statement');
      }
    }

    return patterns.join('_');
  }

  private generateFollowUpMessage(type: FollowUpType, input: ConversationComposerInput): string {
    const petName = input.enhancedContext.petMemory?.personality_traits?.[0] || 'your pet';
    const lang = input.language;

    const messages = {
      SYMPTOM_CHECK: {
        en: `Hi! Just checking in — how is ${petName} doing today? Any changes in the symptoms?`,
        id: `Hai! Mau cek kabar — gimana ${petName} hari ini? Ada perubahan gejala?`,
      },
      FOOD_INCIDENT: {
        en: `Hey! Following up on ${petName} — any symptoms after eating that food?`,
        id: `Hai! Mau follow up ${petName} — ada gejala setelah makan itu?`,
      },
      VET_VISIT: {
        en: `Hi! How did the vet visit go for ${petName}? What did they say?`,
        id: `Hai! Gimana hasil ke dokter hewan untuk ${petName}? Kata dokternya apa?`,
      },
      IMPROVEMENT_CHECK: {
        en: `Hey! Wanted to check if ${petName} is still improving? 😊`,
        id: `Hai! Mau cek apakah ${petName} masih membaik? 😊`,
      },
      GENERAL: {
        en: `Hi! Just checking in on ${petName}. How are things going?`,
        id: `Hai! Mau cek kabar ${petName}. Gimana kabarnya?`,
      },
    };

    return messages[type][lang];
  }
}
