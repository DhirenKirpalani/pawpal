import { RiskLevel } from '@/types/db';

export interface SymptomAnalysis {
  riskLevel: RiskLevel;
  followUpQuestions: string[];
  vetRecommended: boolean;
  reasoning: string;
}

interface SymptomRule {
  symptoms: string[];
  riskLevel: RiskLevel;
  followUpQuestions: string[];
  vetRecommended: boolean;
  reasoning: string;
}

export class SymptomEngine {
  private highRiskSymptoms = [
    'seizure',
    'collapse',
    'difficulty breathing',
    'bleeding',
    'unconscious',
    'bloated',
    'pale gums',
    'severe pain',
    'unable to urinate',
    'unable to defecate',
    'blood in stool',
    'blood in urine',
    'blood in vomit',
  ];

  private mediumRiskSymptoms = [
    'vomiting',
    'diarrhea',
    'loss of appetite',
    'lethargy',
    'fever',
    'shaking',
    'limping',
    'excessive drinking',
    'excessive urination',
  ];

  private symptomCombinations: SymptomRule[] = [
    {
      symptoms: ['vomiting', 'loss of appetite'],
      riskLevel: 'HIGH',
      followUpQuestions: [
        'How many times has your pet vomited in the last 24 hours?',
        'Is there any blood in the vomit?',
        'When was the last time your pet ate?',
      ],
      vetRecommended: true,
      reasoning: 'Vomiting combined with loss of appetite can indicate serious conditions',
    },
    {
      symptoms: ['vomiting', 'diarrhea'],
      riskLevel: 'HIGH',
      followUpQuestions: [
        'How long has this been happening?',
        'Is your pet drinking water?',
        'Is there any blood in the vomit or stool?',
      ],
      vetRecommended: true,
      reasoning: 'Combined vomiting and diarrhea can lead to dangerous dehydration',
    },
    {
      symptoms: ['diarrhea', 'lethargy'],
      riskLevel: 'MEDIUM',
      followUpQuestions: [
        'How many times has your pet had diarrhea today?',
        'Is there any blood in the stool?',
        'Is your pet drinking water normally?',
      ],
      vetRecommended: false,
      reasoning: 'Monitor closely - may resolve on its own but watch for worsening',
    },
    {
      symptoms: ['loss of appetite', 'lethargy'],
      riskLevel: 'MEDIUM',
      followUpQuestions: [
        'How many days has your pet not been eating?',
        'Is your pet drinking water?',
        'Any other symptoms you\'ve noticed?',
      ],
      vetRecommended: false,
      reasoning: 'Could indicate various conditions - monitor for 24-48 hours',
    },
  ];

  analyze(symptoms: string[], petSpecies: 'cat' | 'dog'): SymptomAnalysis {
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

    const hasHighRisk = normalizedSymptoms.some(s =>
      this.highRiskSymptoms.some(hrs => s.includes(hrs))
    );

    if (hasHighRisk) {
      return {
        riskLevel: 'HIGH',
        followUpQuestions: [
          'Is this an emergency situation right now?',
          'How long has this been happening?',
        ],
        vetRecommended: true,
        reasoning: 'This symptom requires immediate veterinary attention',
      };
    }

    for (const rule of this.symptomCombinations) {
      const matchCount = rule.symptoms.filter(rs =>
        normalizedSymptoms.some(ns => ns.includes(rs))
      ).length;

      if (matchCount >= 2) {
        return rule;
      }
    }

    const hasMediumRisk = normalizedSymptoms.some(s =>
      this.mediumRiskSymptoms.some(mrs => s.includes(mrs))
    );

    if (hasMediumRisk) {
      if (normalizedSymptoms.length > 1) {
        return {
          riskLevel: 'MEDIUM',
          followUpQuestions: [
            'How long have these symptoms been present?',
            'Is your pet eating and drinking normally?',
            'Have you noticed any other changes in behavior?',
          ],
          vetRecommended: false,
          reasoning: 'Multiple symptoms warrant close monitoring',
        };
      }

      return this.getSingleSymptomAnalysis(normalizedSymptoms[0], petSpecies);
    }

    return {
      riskLevel: 'LOW',
      followUpQuestions: [
        'How long has this been happening?',
        'Has anything changed in your pet\'s environment recently?',
      ],
      vetRecommended: false,
      reasoning: 'This appears to be a minor concern - monitor for changes',
    };
  }

  private getSingleSymptomAnalysis(symptom: string, petSpecies: 'cat' | 'dog'): SymptomAnalysis {
    if (symptom.includes('vomiting')) {
      return {
        riskLevel: 'LOW',
        followUpQuestions: [
          'How many times has your pet vomited?',
          'What did the vomit look like?',
          'Is your pet still eating and drinking?',
        ],
        vetRecommended: false,
        reasoning: 'Single episode of vomiting is usually not serious - monitor for repetition',
      };
    }

    if (symptom.includes('diarrhea')) {
      return {
        riskLevel: 'LOW',
        followUpQuestions: [
          'How many times has this happened today?',
          'Is there any blood in the stool?',
          'Did your pet eat something unusual?',
        ],
        vetRecommended: false,
        reasoning: 'Single episode of diarrhea may resolve on its own',
      };
    }

    if (symptom.includes('loss of appetite') || symptom.includes('not eating')) {
      const speciesSpecific = petSpecies === 'cat'
        ? 'Cats should not go more than 24 hours without eating'
        : 'Dogs can safely skip a meal or two';

      return {
        riskLevel: 'LOW',
        followUpQuestions: [
          'How long has it been since your pet last ate?',
          'Is your pet drinking water normally?',
          'Any other symptoms or behavior changes?',
        ],
        vetRecommended: false,
        reasoning: speciesSpecific,
      };
    }

    if (symptom.includes('coughing')) {
      return {
        riskLevel: 'LOW',
        followUpQuestions: [
          'How often is your pet coughing?',
          'Does the cough sound dry or wet?',
          'Any discharge from the nose?',
        ],
        vetRecommended: false,
        reasoning: 'Occasional coughing is usually not serious',
      };
    }

    if (symptom.includes('sneezing')) {
      return {
        riskLevel: 'LOW',
        followUpQuestions: [
          'How often is your pet sneezing?',
          'Any discharge from the nose or eyes?',
          'Is your pet eating normally?',
        ],
        vetRecommended: false,
        reasoning: 'Sneezing alone is usually minor',
      };
    }

    if (symptom.includes('itching') || symptom.includes('scratching')) {
      return {
        riskLevel: 'LOW',
        followUpQuestions: [
          'Where is your pet scratching?',
          'Do you see any redness or hair loss?',
          'Have you changed food or detergent recently?',
        ],
        vetRecommended: false,
        reasoning: 'Itching can have many causes - monitor for skin changes',
      };
    }

    return {
      riskLevel: 'LOW',
      followUpQuestions: [
        'Can you describe the symptom in more detail?',
        'When did you first notice this?',
      ],
      vetRecommended: false,
      reasoning: 'Monitor your pet and note any changes',
    };
  }
}
