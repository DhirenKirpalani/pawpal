import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/repositories/user-repository';
import { PetRepository } from '@/repositories/pet-repository';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const userRepository = new UserRepository();
    const petRepository = new PetRepository();

    const user = await userRepository.findByPhone(phone);
    
    if (!user) {
      return NextResponse.json(
        { error: 'No pet registered for this phone number' },
        { status: 404 }
      );
    }

    const pet = await petRepository.findByUserId(user.id);

    if (!pet) {
      return NextResponse.json(
        { error: 'No pet registered for this phone number' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      pet: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age_years: pet.age_years,
        weight_kg: pet.weight_kg,
      },
    });
  } catch (error: any) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
