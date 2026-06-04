import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PetReminderRepository } from '@/repositories/pet-reminder-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { UserRepository } from '@/repositories/user-repository';

const CreateReminderSchema = z.object({
  phone: z.string().min(1),
  reminder_type: z.enum(['vaccine', 'deworming', 'vet_appointment', 'checkup', 'medication']),
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: z.string(),
  recurring: z.boolean().optional(),
  recurring_interval_days: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateReminderSchema.parse(body);

    const userRepo = new UserRepository();
    const petRepo = new PetRepository();
    const reminderRepo = new PetReminderRepository();

    const user = await userRepo.findByPhone(validatedData.phone);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register your pet first.' },
        { status: 404 }
      );
    }

    const pet = await petRepo.findByUserId(user.id);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found. Please register your pet first.' },
        { status: 404 }
      );
    }

    const reminder = await reminderRepo.create({
      pet_id: pet.id,
      reminder_type: validatedData.reminder_type,
      title: validatedData.title,
      description: validatedData.description,
      due_date: validatedData.due_date,
      recurring: validatedData.recurring,
      recurring_interval_days: validatedData.recurring_interval_days,
    });

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create reminder error:', error);
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
    const reminderRepo = new PetReminderRepository();

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

    const [upcoming, overdue] = await Promise.all([
      reminderRepo.getUpcomingByPetId(pet.id),
      reminderRepo.getOverdueByPetId(pet.id),
    ]);

    return NextResponse.json({
      success: true,
      upcoming,
      overdue,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
