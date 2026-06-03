import { RiskLevel } from '@/types/db';

export interface BehaviorAnalysis {
  riskLevel: RiskLevel;
  possibleCauses: string[];
  monitoringSuggestions: string[];
  vetRecommended: boolean;
  reasoning: string;
}

interface BehaviorRule {
  behavior: string;
  riskLevel: RiskLevel;
  possibleCauses: string[];
  monitoringSuggestions: string[];
  vetRecommended: boolean;
  reasoning: string;
}

export class BehaviorEngine {
  private behaviorRules: BehaviorRule[] = [
    {
      behavior: 'aggression',
      riskLevel: 'HIGH',
      possibleCauses: [
        'Pain or discomfort',
        'Fear or anxiety',
        'Territorial behavior',
        'Medical condition',
      ],
      monitoringSuggestions: [
        'Note when the aggression occurs',
        'Identify triggers',
        'Keep a safe distance',
        'Avoid punishment',
      ],
      vetRecommended: true,
      reasoning: 'Sudden aggression can indicate pain or medical issues',
    },
    {
      behavior: 'hiding',
      riskLevel: 'MEDIUM',
      possibleCauses: [
        'Stress or anxiety',
        'Illness or pain',
        'Changes in environment',
        'Fear',
      ],
      monitoringSuggestions: [
        'Check if eating and drinking normally',
        'Look for other symptoms',
        'Provide quiet space',
        'Note any environmental changes',
      ],
      vetRecommended: false,
      reasoning: 'Hiding can be normal but may indicate stress or illness',
    },
    {
      behavior: 'excessive meowing',
      riskLevel: 'MEDIUM',
      possibleCauses: [
        'Attention seeking',
        'Hunger',
        'Stress or anxiety',
        'Medical condition (hyperthyroidism, pain)',
      ],
      monitoringSuggestions: [
        'Note when meowing occurs',
        'Check if needs are met (food, water, litter)',
        'Look for other symptoms',
        'Monitor eating and drinking',
      ],
      vetRecommended: false,
      reasoning: 'Excessive vocalization can indicate various needs or medical issues',
    },
    {
      behavior: 'excessive barking',
      riskLevel: 'MEDIUM',
      possibleCauses: [
        'Boredom or lack of exercise',
        'Anxiety or fear',
        'Territorial behavior',
        'Attention seeking',
      ],
      monitoringSuggestions: [
        'Ensure adequate exercise',
        'Identify triggers',
        'Check for environmental stressors',
        'Monitor for other symptoms',
      ],
      vetRecommended: false,
      reasoning: 'Excessive barking usually indicates behavioral needs',
    },
    {
      behavior: 'restlessness',
      riskLevel: 'MEDIUM',
      possibleCauses: [
        'Pain or discomfort',
        'Anxiety',
        'Need for exercise',
        'Medical condition',
      ],
      monitoringSuggestions: [
        'Check for signs of pain',
        'Ensure adequate exercise',
        'Look for other symptoms',
        'Note when restlessness occurs',
      ],
      vetRecommended: false,
      reasoning: 'Restlessness can indicate discomfort or unmet needs',
    },
    {
      behavior: 'licking',
      riskLevel: 'LOW',
      possibleCauses: [
        'Allergies',
        'Skin irritation',
        'Anxiety or boredom',
        'Pain in the area',
      ],
      monitoringSuggestions: [
        'Check the area being licked',
        'Look for redness or irritation',
        'Note frequency and duration',
        'Consider recent changes',
      ],
      vetRecommended: false,
      reasoning: 'Excessive licking may indicate skin issues or anxiety',
    },
    {
      behavior: 'pacing',
      riskLevel: 'MEDIUM',
      possibleCauses: [
        'Anxiety or stress',
        'Pain or discomfort',
        'Cognitive dysfunction (in older pets)',
        'Need for exercise',
      ],
      monitoringSuggestions: [
        'Note when pacing occurs',
        'Check for other symptoms',
        'Ensure adequate exercise',
        'Consider age-related changes',
      ],
      vetRecommended: false,
      reasoning: 'Pacing can indicate anxiety or discomfort',
    },
    {
      behavior: 'loss of house training',
      riskLevel: 'MEDIUM',
      possibleCauses: [
        'Urinary tract infection',
        'Anxiety or stress',
        'Cognitive dysfunction',
        'Medical condition',
      ],
      monitoringSuggestions: [
        'Note frequency and location',
        'Check for signs of pain during elimination',
        'Look for other symptoms',
        'Consider recent changes',
      ],
      vetRecommended: true,
      reasoning: 'Sudden loss of house training often indicates medical issues',
    },
  ];

  analyze(behaviors: string[], petSpecies: 'cat' | 'dog'): BehaviorAnalysis {
    const normalizedBehaviors = behaviors.map(b => b.toLowerCase().trim());

    for (const behavior of normalizedBehaviors) {
      for (const rule of this.behaviorRules) {
        if (behavior.includes(rule.behavior)) {
          return rule;
        }
      }
    }

    return {
      riskLevel: 'LOW',
      possibleCauses: [
        'Normal behavior variation',
        'Environmental changes',
        'Attention seeking',
      ],
      monitoringSuggestions: [
        'Observe when the behavior occurs',
        'Note any patterns or triggers',
        'Ensure basic needs are met',
        'Monitor for other changes',
      ],
      vetRecommended: false,
      reasoning: 'This behavior may be normal - monitor for changes or escalation',
    };
  }
}
