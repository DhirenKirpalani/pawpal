export const MODELS = {
  CHAT: process.env.OPENAI_CHAT_MODEL || 'gpt-4o',
  CLASSIFIER: process.env.OPENAI_CLASSIFIER_MODEL || 'gpt-4o-mini',
} as const;
