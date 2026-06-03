import { RiskLevel } from '@/types/db';

export interface FoodAnalysis {
  safe: boolean;
  riskLevel: RiskLevel;
  reasoning: string;
  action: string;
}

interface FoodRule {
  food: string;
  safe: boolean;
  riskLevel: RiskLevel;
  cat?: boolean;
  dog?: boolean;
  reasoning: string;
  action: string;
}

export class FoodEngine {
  private foodRules: FoodRule[] = [
    {
      food: 'chocolate',
      safe: false,
      riskLevel: 'HIGH',
      cat: true,
      dog: true,
      reasoning: 'Chocolate contains theobromine which is toxic to pets',
      action: 'Contact your veterinarian immediately if your pet has consumed chocolate',
    },
    {
      food: 'onion',
      safe: false,
      riskLevel: 'HIGH',
      cat: true,
      dog: true,
      reasoning: 'Onions contain compounds that can damage red blood cells',
      action: 'Avoid feeding onions in any form. If consumed, monitor for weakness and contact vet',
    },
    {
      food: 'garlic',
      safe: false,
      riskLevel: 'HIGH',
      cat: true,
      dog: true,
      reasoning: 'Garlic is toxic to pets and can cause anemia',
      action: 'Avoid feeding garlic. If consumed in large amounts, contact your vet',
    },
    {
      food: 'grapes',
      safe: false,
      riskLevel: 'HIGH',
      dog: true,
      reasoning: 'Grapes and raisins can cause kidney failure in dogs',
      action: 'Never feed grapes or raisins. If consumed, contact your veterinarian immediately',
    },
    {
      food: 'raisins',
      safe: false,
      riskLevel: 'HIGH',
      dog: true,
      reasoning: 'Raisins can cause kidney failure in dogs',
      action: 'Never feed raisins. If consumed, contact your veterinarian immediately',
    },
    {
      food: 'xylitol',
      safe: false,
      riskLevel: 'HIGH',
      cat: true,
      dog: true,
      reasoning: 'Xylitol can cause liver failure and hypoglycemia',
      action: 'This is an emergency - contact your veterinarian immediately',
    },
    {
      food: 'avocado',
      safe: false,
      riskLevel: 'MEDIUM',
      cat: true,
      dog: true,
      reasoning: 'Avocado contains persin which can be harmful to pets',
      action: 'Avoid feeding avocado. Small amounts may not be harmful but best to avoid',
    },
    {
      food: 'milk',
      safe: false,
      riskLevel: 'LOW',
      cat: true,
      dog: true,
      reasoning: 'Most adult pets are lactose intolerant',
      action: 'May cause digestive upset. Small amounts occasionally are usually fine',
    },
    {
      food: 'tuna',
      safe: true,
      riskLevel: 'LOW',
      cat: true,
      dog: true,
      reasoning: 'Tuna is safe in moderation but should not be the primary diet',
      action: 'Safe as an occasional treat. Too much can lead to mercury exposure',
    },
    {
      food: 'chicken',
      safe: true,
      riskLevel: 'LOW',
      cat: true,
      dog: true,
      reasoning: 'Cooked chicken is safe and healthy for pets',
      action: 'Safe to feed. Ensure it is cooked and boneless',
    },
    {
      food: 'rice',
      safe: true,
      riskLevel: 'LOW',
      cat: true,
      dog: true,
      reasoning: 'Plain cooked rice is safe and can help with digestive issues',
      action: 'Safe to feed in moderation',
    },
    {
      food: 'carrot',
      safe: true,
      riskLevel: 'LOW',
      cat: true,
      dog: true,
      reasoning: 'Carrots are safe and healthy for pets',
      action: 'Safe to feed raw or cooked. Good for dental health',
    },
    {
      food: 'apple',
      safe: true,
      riskLevel: 'LOW',
      cat: true,
      dog: true,
      reasoning: 'Apples are safe but remove seeds and core',
      action: 'Safe to feed in moderation. Remove seeds as they contain cyanide',
    },
    {
      food: 'peanut butter',
      safe: true,
      riskLevel: 'LOW',
      dog: true,
      reasoning: 'Peanut butter is safe if it does not contain xylitol',
      action: 'Safe in moderation. Always check ingredients for xylitol',
    },
    {
      food: 'salmon',
      safe: true,
      riskLevel: 'LOW',
      cat: true,
      dog: true,
      reasoning: 'Cooked salmon is safe and nutritious',
      action: 'Safe to feed. Ensure it is cooked and boneless',
    },
  ];

  analyze(foods: string[], petSpecies: 'cat' | 'dog'): FoodAnalysis {
    const normalizedFoods = foods.map(f => f.toLowerCase().trim());

    let highestRisk: FoodAnalysis = {
      safe: true,
      riskLevel: 'LOW',
      reasoning: 'This food appears to be safe for your pet',
      action: 'You can feed this in moderation',
    };

    for (const food of normalizedFoods) {
      for (const rule of this.foodRules) {
        if (food.includes(rule.food)) {
          if (petSpecies === 'cat' && rule.cat === false) continue;
          if (petSpecies === 'dog' && rule.dog === false) continue;

          if (
            this.getRiskValue(rule.riskLevel) > this.getRiskValue(highestRisk.riskLevel)
          ) {
            highestRisk = {
              safe: rule.safe,
              riskLevel: rule.riskLevel,
              reasoning: rule.reasoning,
              action: rule.action,
            };
          }
        }
      }
    }

    if (highestRisk.safe && normalizedFoods.length > 0) {
      const matchedFood = normalizedFoods.find(food =>
        this.foodRules.some(rule => food.includes(rule.food))
      );

      if (!matchedFood) {
        return {
          safe: true,
          riskLevel: 'LOW',
          reasoning: 'I don\'t have specific information about this food',
          action: 'When in doubt, stick to foods you know are safe or consult your veterinarian',
        };
      }
    }

    return highestRisk;
  }

  private getRiskValue(risk: RiskLevel): number {
    switch (risk) {
      case 'HIGH':
        return 3;
      case 'MEDIUM':
        return 2;
      case 'LOW':
        return 1;
      default:
        return 0;
    }
  }
}
