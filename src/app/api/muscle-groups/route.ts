import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const muscleGroups = await db.muscleGroup.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(muscleGroups);
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch muscle groups' },
      { status: 500 }
    );
  }
}
