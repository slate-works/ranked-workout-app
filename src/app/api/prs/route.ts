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
