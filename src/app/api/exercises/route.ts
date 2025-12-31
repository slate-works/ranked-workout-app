import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const muscleGroup = searchParams.get('muscleGroup') || '';
    const category = searchParams.get('category') || '';

    const exercises = await db.exercise.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query } },
                  { category: { contains: query } },
                ],
              }
            : {},
          muscleGroup
            ? {
                muscleContributions: {
                  some: {
                    muscleGroup: {
                      name: { contains: muscleGroup },
                    },
                  },
                },
              }
            : {},
          category ? { category: { equals: category } } : {},
        ],
      },
      include: {
        muscleContributions: {
          include: {
            muscleGroup: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}
