import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

interface PRRecord {
  id: string;
  exerciseId: string;
  estimated1RM: number;
  exercise: {
    id: string;
    name: string;
  };
}

// GET - Fetch user's PR records
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get all PRs grouped by exercise (latest PR for each exercise)
    const prs = await db.pRRecord.findMany({
      where: {
        userId: user.id,
        ...(exerciseId ? { exerciseId } : {}),
      },
      include: {
        exercise: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    // Group by exercise and get the best PR for each
    const prsByExercise = prs.reduce<Record<string, PRRecord>>((acc, pr) => {
      if (!acc[pr.exerciseId] || pr.estimated1RM > acc[pr.exerciseId].estimated1RM) {
        acc[pr.exerciseId] = pr;
      }
      return acc;
    }, {});

    const bestPRs = Object.values(prsByExercise);

    // Also get recent PRs (last few hit)
    const recentPRs = await db.pRRecord.findMany({
      where: { userId: user.id },
      include: { exercise: true },
      orderBy: { date: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      bestPRs,
      recentPRs,
    });
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PRs' },
      { status: 500 }
    );
  }
}

// POST - Create initial PR records (used during onboarding)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { prs } = body as { prs: Array<{ exerciseName: string; estimated1RM: number }> };

    if (!prs || !Array.isArray(prs)) {
      return NextResponse.json({ error: 'Invalid PR data' }, { status: 400 });
    }

    const createdPRs = [];

    for (const pr of prs) {
      if (!pr.exerciseName || !pr.estimated1RM || pr.estimated1RM <= 0) {
        continue;
      }

      // Find the exercise by name
      const exercise = await db.exercise.findFirst({
        where: { name: pr.exerciseName },
      });

      if (!exercise) {
        console.warn(`Exercise not found: ${pr.exerciseName}`);
        continue;
      }

      // Create PR record (1 rep at the 1RM weight)
      const prRecord = await db.pRRecord.create({
        data: {
          userId: user.id,
          exerciseId: exercise.id,
          weight: pr.estimated1RM,
          reps: 1,
          estimated1RM: pr.estimated1RM,
          date: new Date(),
        },
        include: { exercise: true },
      });

      createdPRs.push(prRecord);

      // Note: Muscle group scores are calculated dynamically in /api/stats
      // based on PRs, so no additional updates needed here
    }

    return NextResponse.json({
      success: true,
      createdPRs: createdPRs.map(pr => ({
        exercise: pr.exercise.name,
        estimated1RM: pr.estimated1RM,
      })),
    });
  } catch (error) {
    console.error('Error creating PRs:', error);
    return NextResponse.json(
      { error: 'Failed to create PRs' },
      { status: 500 }
    );
  }
}
