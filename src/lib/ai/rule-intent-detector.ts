import { Intent } from '@/types/db';

const SYMPTOM_KEYWORDS = [
  'vomit',
  'vomiting',
  'muntah',
  'diarrhea',
  'diare',
  'not eating',
  'loss of appetite',
  'lethargic',
  'lethargy',
  'lemas',
  'batuk',
  'cough',
  'coughing',
  'itching',
  'gatal',
  'scratching',
  'sneezing',
  'bersin',
  'fever',
  'demam',
  'sick',
  'sakit',
  'bleeding',
  'darah',
  'seizure',
  'kejang',
  'limping',
  'pincang',
  'shaking',
  'gemetar',
  'weak',
  'lemah',
  'tired',
  'lelah',
  'pain',
  'nyeri',
];

const FOOD_KEYWORDS = [
  'eat',
  'ate',
  'eating',
  'food',
  'makan',
  'makanan',
  'boleh makan',
  'can eat',
  'safe to eat',
  'chocolate',
  'coklat',
  'onion',
  'bawang',
  'garlic',
  'bawang putih',
  'grapes',
  'anggur',
  'raisins',
  'kismis',
  'tuna',
  'chicken',
  'ayam',
  'rice',
  'nasi',
  'milk',
  'susu',
  'cheese',
  'keju',
  'bread',
  'roti',
  'fish',
  'ikan',
  'meat',
  'daging',
];

const BEHAVIOR_KEYWORDS = [
  'aggressive',
  'agresif',
  'galak',
  'hiding',
  'sembunyi',
  'pendiam',
  'meowing',
  'mengeong',
  'barking',
  'menggonggong',
  'biting',
  'menggigit',
  'scratching furniture',
  'destructive',
  'restless',
  'gelisah',
  'anxious',
  'cemas',
  'scared',
  'takut',
  'shy',
  'pemalu',
  'hyperactive',
  'hiperaktif',
];

export function detectIntentByRules(message: string): Intent | null {
  const normalizedMessage = message.toLowerCase();

  let symptomScore = 0;
  let foodScore = 0;
  let behaviorScore = 0;

  for (const keyword of SYMPTOM_KEYWORDS) {
    if (normalizedMessage.includes(keyword)) {
      symptomScore++;
    }
  }

  for (const keyword of FOOD_KEYWORDS) {
    if (normalizedMessage.includes(keyword)) {
      foodScore++;
    }
  }

  for (const keyword of BEHAVIOR_KEYWORDS) {
    if (normalizedMessage.includes(keyword)) {
      behaviorScore++;
    }
  }

  const maxScore = Math.max(symptomScore, foodScore, behaviorScore);

  if (maxScore === 0) {
    return null;
  }

  if (symptomScore === maxScore && symptomScore > 0) {
    return 'SYMPTOM';
  }

  if (foodScore === maxScore && foodScore > 0) {
    return 'FOOD';
  }

  if (behaviorScore === maxScore && behaviorScore > 0) {
    return 'BEHAVIOR';
  }

  return null;
}
