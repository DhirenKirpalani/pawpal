import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PottyTrainingRepository } from '@/repositories/potty-training-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { UserRepository } from '@/repositories/user-repository';

const CreatePottyLogSchema = z.object({
  phone: z.string().min(1),
  event_type: z.enum(['poop', 'pee']),
  location: z.enum(['correct_spot', 'wrong_spot', 'accident']),
  consistency: z.enum(['normal', 'soft', 'diarrhea', 'hard']).optional(),
  notes: z.string().optional(),
  logged_at: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreatePottyLogSchema.parse(body);

    const userRepo = new UserRepository();
    const petRepo = new PetRepository();
    const pottyRepo = new PottyTrainingRepository();

    const user = await userRepo.findByPhone(validatedData.phone);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const pet = await petRepo.findByUserId(user.id);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    const log = await pottyRepo.create({
      pet_id: pet.id,
      event_type: validatedData.event_type,
      location: validatedData.location,
      consistency: validatedData.consistency,
      notes: validatedData.notes,
      logged_at: validatedData.logged_at,
    });

    // Get success rate
    const successRate = await pottyRepo.getSuccessRate(pet.id, 7);

    return NextResponse.json({
      success: true,
      log,
      success_rate_7_days: successRate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create potty log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const userRepo = new UserRepository();
    const petRepo = new PetRepository();
    const pottyRepo = new PottyTrainingRepository();

    const user = await userRepo.findByPhone(phone);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const pet = await petRepo.findByUserId(user.id);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    const [recentLogs, todayLogs, successRate] = await Promise.all([
      pottyRepo.getRecentByPetId(pet.id, 30),
      pottyRepo.getTodayLogs(pet.id),
      pottyRepo.getSuccessRate(pet.id, 7),
    ]);

    return NextResponse.json({
      success: true,
      recent_logs: recentLogs,
      today_logs: todayLogs,
      success_rate_7_days: successRate,
    });
  } catch (error) {
    console.error('Get potty logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
