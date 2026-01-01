import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { birthDate, sex, height, heightUnit, bodyWeight, weightUnit, trainingAgeYears, preferredUnits } = body;

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        birthDate: birthDate ? new Date(birthDate) : undefined,
        sex,
        height,
        heightUnit,
        bodyWeight,
        weightUnit,
        trainingAgeYears,
        preferredUnits,
      },
      create: {
        userId: session.user.id,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        sex,
        height,
        heightUnit,
        bodyWeight,
        weightUnit,
        trainingAgeYears,
        preferredUnits,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user - cascading deletes will handle related data
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
