import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UserRepository } from '@/repositories/user-repository';
import { PetRepository } from '@/repositories/pet-repository';

const OnboardRequestSchema = z.object({
  phone: z.string().min(1),
  petName: z.string().min(1),
  species: z.enum(['cat', 'dog']),
  breed: z.string().optional(),
  ageYears: z.number().int().min(0).optional(),
  weightKg: z.number().positive().optional(),
  language: z.enum(['en', 'id']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = OnboardRequestSchema.parse(body);

    const userRepository = new UserRepository();
    const petRepository = new PetRepository();

    const user = await userRepository.findOrCreate(
      validatedData.phone,
      validatedData.language
    );

    const existingPet = await petRepository.findByUserId(user.id);
    if (existingPet) {
      return NextResponse.json(
        { error: 'Pet already registered for this user' },
        { status: 400 }
      );
    }

    const pet = await petRepository.create({
      user_id: user.id,
      name: validatedData.petName,
      species: validatedData.species,
      breed: validatedData.breed,
      age_years: validatedData.ageYears,
      weight_kg: validatedData.weightKg,
    });

    return NextResponse.json({
      success: true,
      pet: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Onboard API error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
