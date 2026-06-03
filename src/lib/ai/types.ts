import { z } from 'zod';

export const PawPalResponseSchema = z.object({
  message: z.string(),
  followUpQuestion: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  vetRecommended: z.boolean().optional(),
});

export type PawPalResponse = z.infer<typeof PawPalResponseSchema>;
