import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { LostPetRepository } from '@/repositories/lost-pet-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { UserRepository } from '@/repositories/user-repository';

const CreateAlertSchema = z.object({
  phone: z.string().min(1),
  last_seen_location: z.string().optional(),
  last_seen_at: z.string().optional(),
  description: z.string().optional(),
  contact_info: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action; // 'create', 'found', or 'cancel'

    const userRepo = new UserRepository();
    const petRepo = new PetRepository();
    const lostPetRepo = new LostPetRepository();

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

    if (action === 'create') {
      // Check if there's already an active alert
      const existingAlert = await lostPetRepo.getActiveAlert(pet.id);
      if (existingAlert) {
        return NextResponse.json(
          { error: 'An active lost pet alert already exists for this pet' },
          { status: 400 }
        );
      }

      const validatedData = CreateAlertSchema.parse(body);
      const alert = await lostPetRepo.create({
        pet_id: pet.id,
        last_seen_location: validatedData.last_seen_location,
        last_seen_at: validatedData.last_seen_at,
        description: validatedData.description,
        contact_info: validatedData.contact_info,
      });

      return NextResponse.json({
        success: true,
        alert,
        message: `🚨 Lost pet alert created for ${pet.name}. We'll help you find them!`,
      });
    } else if (action === 'found') {
      const activeAlert = await lostPetRepo.getActiveAlert(pet.id);
      if (!activeAlert) {
        return NextResponse.json(
          { error: 'No active alert found' },
          { status: 404 }
        );
      }

      const alert = await lostPetRepo.markFound(activeAlert.id);
      return NextResponse.json({
        success: true,
        alert,
        message: `🎉 Great news! ${pet.name} has been found!`,
      });
    } else if (action === 'cancel') {
      const activeAlert = await lostPetRepo.getActiveAlert(pet.id);
      if (!activeAlert) {
        return NextResponse.json(
          { error: 'No active alert found' },
          { status: 404 }
        );
      }

      const alert = await lostPetRepo.cancel(activeAlert.id);
      return NextResponse.json({
        success: true,
        alert,
        message: 'Alert cancelled',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "create", "found", or "cancel"' },
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

    console.error('Lost pet API error:', error);
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
    const lostPetRepo = new LostPetRepository();

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

    const [activeAlert, history] = await Promise.all([
      lostPetRepo.getActiveAlert(pet.id),
      lostPetRepo.getHistory(pet.id),
    ]);

    return NextResponse.json({
      success: true,
      active_alert: activeAlert,
      history,
    });
  } catch (error) {
    console.error('Get lost pet data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
