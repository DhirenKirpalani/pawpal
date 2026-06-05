import { openai } from '../ai/openai';
import { MODELS } from '../ai/models';
import { Emotion, UrgencyLevel, EmotionalAnalysis } from '@/types/companion';
import { z } from 'zod';

const EmotionDetectionSchema = z.object({
  emotion: z.enum([
    'WORRIED',
    'ANXIOUS',
    'FRUSTRATED',
    'GUILTY',
    'OVERWHELMED',
    'CONFUSED',
    'SAD',
    'RELIEVED',
    'PROUD',
    'EXCITED',
    'CURIOUS',
    'NEUTRAL',
  ]),
  confidence: z.number().min(0).max(1),
  indicators: z.array(z.string()),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']),
});

export class EmotionDetector {
  async detect(message: string, conversationHistory?: string[]): Promise<EmotionalAnalysis> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(message, conversationHistory);

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
          name: 'emotion_detection',
          schema: {
            type: 'object',
            properties: {
              emotion: {
                type: 'string',
                enum: [
                  'WORRIED',
                  'ANXIOUS',
                  'FRUSTRATED',
                  'GUILTY',
                  'OVERWHELMED',
                  'CONFUSED',
                  'SAD',
                  'RELIEVED',
                  'PROUD',
                  'EXCITED',
                  'CURIOUS',
                  'NEUTRAL',
                ],
              },
              confidence: {
                type: 'number',
                minimum: 0,
                maximum: 1,
              },
              indicators: {
                type: 'array',
                items: { type: 'string' },
              },
              urgency: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'],
              },
            },
            required: ['emotion', 'confidence', 'indicators', 'urgency'],
            additionalProperties: false,
          },
        },
      },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from emotion detector');
    }

    const parsed = JSON.parse(content);
    return EmotionDetectionSchema.parse(parsed);
  }

  private buildSystemPrompt(): string {
    return `You are an emotional intelligence system for PawPal, a pet health companion.

Your job is to detect the emotional state of pet owners based on their messages.

EMOTIONS TO DETECT:

WORRIED - Concern about pet's health, seeking reassurance
Indicators: "I'm worried", "concerned", "not sure if this is normal", "should I be worried?"

ANXIOUS - High stress, fear of worst-case scenarios
Indicators: "I'm scared", "what if", "really worried", "panicking", "terrified"

FRUSTRATED - Repeated issues, feeling helpless
Indicators: "this keeps happening", "again", "still", "nothing works", "tried everything"

GUILTY - Feeling responsible for pet's condition
Indicators: "I accidentally", "my fault", "I shouldn't have", "I feel terrible"

OVERWHELMED - Too much information, don't know what to do
Indicators: "I don't know what to do", "so much information", "confused", "lost"

CONFUSED - Unclear about symptoms or advice
Indicators: "I don't understand", "what does that mean", "confused", "not sure"

SAD - Emotional about pet's suffering
Indicators: "breaks my heart", "so sad", "crying", "can't stand seeing"

RELIEVED - Positive update, improvement
Indicators: "better now", "thank god", "finally", "glad", "relieved"

PROUD - Celebrating pet's progress
Indicators: "so proud", "doing great", "amazing progress", "good boy/girl"

EXCITED - Sharing positive news
Indicators: "guess what", "great news", "so happy", "excited"

CURIOUS - Learning, asking questions
Indicators: "I'm curious", "wondering", "how does", "why do"

NEUTRAL - Factual, calm inquiry
Indicators: straightforward questions without emotional language

URGENCY LEVELS:

EMERGENCY - Life-threatening, immediate danger
- Severe bleeding, seizures, unconsciousness, difficulty breathing, poisoning

HIGH - Serious concern, needs vet soon
- Multiple symptoms, persistent vomiting, severe pain, sudden behavior change

MEDIUM - Concerning but not immediate
- Single mild symptom, behavioral questions, food safety

LOW - General questions, routine care
- Curiosity, learning, preventive care

Return JSON with emotion, confidence (0-1), indicators found, and urgency level.`;
  }

  private buildUserPrompt(message: string, conversationHistory?: string[]): string {
    let prompt = `Analyze the emotional state of this pet owner:\n\n`;
    prompt += `Current message: "${message}"\n\n`;

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `Recent conversation history:\n`;
      conversationHistory.forEach((msg, i) => {
        prompt += `${i + 1}. ${msg}\n`;
      });
      prompt += `\n`;
    }

    prompt += `Detect the primary emotion, confidence level, specific indicators, and urgency.`;

    return prompt;
  }

  // Rule-based quick detection for common patterns
  detectQuickEmotion(message: string): Emotion | null {
    const lower = message.toLowerCase();

    // Anxious patterns
    if (
      lower.includes("i'm scared") ||
      lower.includes("terrified") ||
      lower.includes("panicking") ||
      lower.includes("what if")
    ) {
      return 'ANXIOUS';
    }

    // Guilty patterns
    if (
      lower.includes("accidentally") ||
      lower.includes("my fault") ||
      lower.includes("i shouldn't have") ||
      lower.includes("i feel terrible")
    ) {
      return 'GUILTY';
    }

    // Frustrated patterns
    if (
      (lower.includes("keeps") && lower.includes("happening")) ||
      lower.includes("still") ||
      lower.includes("again") ||
      lower.includes("nothing works")
    ) {
      return 'FRUSTRATED';
    }

    // Relieved patterns
    if (
      lower.includes("better now") ||
      lower.includes("thank god") ||
      lower.includes("relieved") ||
      lower.includes("finally")
    ) {
      return 'RELIEVED';
    }

    return null;
  }
}
