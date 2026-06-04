import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PetNoteRepository } from '@/repositories/pet-note-repository';
import { PetRepository } from '@/repositories/pet-repository';
import { UserRepository } from '@/repositories/user-repository';

const CreateNoteSchema = z.object({
  phone: z.string().min(1),
  note_type: z.enum(['health', 'behavior', 'food', 'general', 'incident']),
  title: z.string().min(1),
  content: z.string().min(1),
  severity: z.enum(['normal', 'concern', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  created_by: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateNoteSchema.parse(body);

    const userRepo = new UserRepository();
    const petRepo = new PetRepository();
    const noteRepo = new PetNoteRepository();

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

    const note = await noteRepo.create({
      pet_id: pet.id,
      note_type: validatedData.note_type,
      title: validatedData.title,
      content: validatedData.content,
      severity: validatedData.severity,
      tags: validatedData.tags,
      created_by: validatedData.created_by,
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create note error:', error);
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
    const noteType = searchParams.get('type');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const userRepo = new UserRepository();
    const petRepo = new PetRepository();
    const noteRepo = new PetNoteRepository();

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

    const notes = noteType
      ? await noteRepo.getByType(pet.id, noteType)
      : await noteRepo.getByPetId(pet.id);

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
