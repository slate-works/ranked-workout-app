import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { estimate1RM } from '@/lib/scoring';

// GET - Fetch user's workout sessions
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sessions = await db.session.findMany({
      where: { userId: user.id },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.session.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      sessions,
      total,
      hasMore: offset + sessions.length < total,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new workout session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, exercises, startTime, endTime, notes } = body;

    // Validate required fields
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json(
        { error: 'At least one exercise is required' },
        { status: 400 }
      );
    }

    // Create the session with nested exercises and sets
    const newSession = await db.session.create({
      data: {
        userId: user.id,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(),
        workoutType: type || 'custom',
        notes: notes || null,
        exercises: {
          create: exercises.map((exercise: any, exerciseIndex: number) => ({
            exerciseId: exercise.exerciseId,
            orderIndex: exerciseIndex,
            sets: {
              create: exercise.sets.map((set: any, setIndex: number) => ({
                setNumber: setIndex + 1,
                reps: set.reps,
                weight: set.weight,
                weightUnit: set.weightUnit || 'kg',
                rpe: set.rpe || null,
                rir: set.rir || null,
                isDumbbellPair: set.isDumbbellPair || false,
                isWarmup: set.isWarmup || false,
                isDropSet: set.isDropSet || false,
                isFailure: set.isFailure || false,
                restAfter: set.restAfter || null,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    // Process PRs and update muscle group scores
    const newPRs: any[] = [];
    const muscleGroupUpdates: Record<string, { volume: number; maxE1RM: number }> = {};

    for (const exerciseLog of newSession.exercises) {
      const exercise = exerciseLog.exercise;
      
      // Calculate best set and estimated 1RM for this exercise
      let bestE1RM = 0;
      let bestSet = null;

      for (const set of exerciseLog.sets) {
        if (set.isWarmup) continue;
        
        const e1rm = estimate1RM(set.weight, set.reps);
        if (e1rm > bestE1RM) {
          bestE1RM = e1rm;
          bestSet = set;
        }
      }

      if (bestE1RM > 0) {
        // Check if this is a new PR
        const existingPR = await db.pRRecord.findFirst({
          where: {
            userId: user.id,
            exerciseId: exercise.id,
          },
          orderBy: { estimated1RM: 'desc' },
        });

        if (!existingPR || bestE1RM > existingPR.estimated1RM) {
          // Create new PR record
          const pr = await db.pRRecord.create({
            data: {
              userId: user.id,
              exerciseId: exercise.id,
              weight: bestSet!.weight,
              reps: bestSet!.reps,
              estimated1RM: bestE1RM,
              date: new Date(),
            },
            include: { exercise: true },
          });
          newPRs.push({
            exercise: exercise.name,
            weight: bestSet!.weight,
            reps: bestSet!.reps,
            estimated1RM: bestE1RM,
            improvement: existingPR ? bestE1RM - existingPR.estimated1RM : null,
          });
        }

        // Get muscle contributions for this exercise
        const contributions = await db.muscleContribution.findMany({
          where: { exerciseId: exercise.id },
          include: { muscleGroup: true },
        });

        for (const contrib of contributions) {
          const muscleId = contrib.muscleGroupId;
          if (!muscleGroupUpdates[muscleId]) {
            muscleGroupUpdates[muscleId] = { volume: 0, maxE1RM: 0 };
          }
          
          // Apply contribution percentage to volume
          const setVolume = exerciseLog.sets
            .filter((s: { isWarmup: boolean }) => !s.isWarmup)
            .reduce((sum: number, s: { weight: number; reps: number }) => sum + s.weight * s.reps, 0);
          
          muscleGroupUpdates[muscleId].volume += setVolume * (contrib.contributionPercentage / 100);
          
          if (bestE1RM > muscleGroupUpdates[muscleId].maxE1RM) {
            muscleGroupUpdates[muscleId].maxE1RM = bestE1RM * (contrib.contributionPercentage / 100);
          }
        }
      }
    }

    // Update user's streak
    const lastSession = await db.session.findFirst({
      where: {
        userId: user.id,
        id: { not: newSession.id },
      },
      orderBy: { startTime: 'desc' },
    });

    let newStreak = user.currentStreak;
    if (lastSession) {
      const daysDiff = Math.floor(
        (new Date().getTime() - lastSession.startTime.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff <= 1) {
        newStreak = user.currentStreak + 1;
      } else if (daysDiff > 2) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Update user streak
    await db.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastWorkoutAt: new Date(),
      },
    });

    return NextResponse.json({
      session: newSession,
      newPRs,
      streak: newStreak,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
