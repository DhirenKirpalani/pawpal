import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FeedingRepository } from '@/repositories/feeding-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { UserRepository } from '@/repositories/user-repository';

const CreateFeedingLogSchema = z.object({
  phone: z.string().min(1),
  food_type: z.string().min(1),
  portion_size: z.string().optional(),
  supplements: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  fed_at: z.string().optional(),
});

const CreateFeedingScheduleSchema = z.object({
  phone: z.string().min(1),
  meal_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  meal_name: z.string().min(1),
  food_type: z.string().optional(),
  portion_size: z.string().optional(),
  supplements: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action; // 'log' or 'schedule'

    const userRepo = new UserRepository();
    const petRepo = new PetRepository();
    const feedingRepo = new FeedingRepository();

    const user = await userRepo.findByPhone(body.phone);
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

    if (action === 'log') {
      const validatedData = CreateFeedingLogSchema.parse(body);
      const log = await feedingRepo.createLog({
        pet_id: pet.id,
        food_type: validatedData.food_type,
        portion_size: validatedData.portion_size,
        supplements: validatedData.supplements,
        notes: validatedData.notes,
        fed_at: validatedData.fed_at,
      });

      return NextResponse.json({
        success: true,
        log,
      });
    } else if (action === 'schedule') {
      const validatedData = CreateFeedingScheduleSchema.parse(body);
      const schedule = await feedingRepo.createSchedule({
        pet_id: pet.id,
        meal_time: validatedData.meal_time,
        meal_name: validatedData.meal_name,
        food_type: validatedData.food_type,
        portion_size: validatedData.portion_size,
        supplements: validatedData.supplements,
      });

      return NextResponse.json({
        success: true,
        schedule,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "log" or "schedule"' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Feeding API error:', error);
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
    const feedingRepo = new FeedingRepository();

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

    const [schedules, recentLogs, todayLogs] = await Promise.all([
      feedingRepo.getActiveSchedules(pet.id),
      feedingRepo.getRecentLogs(pet.id, 30),
      feedingRepo.getTodayLogs(pet.id),
    ]);

    return NextResponse.json({
      success: true,
      schedules,
      recent_logs: recentLogs,
      today_logs: todayLogs,
    });
  } catch (error) {
    console.error('Get feeding data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
