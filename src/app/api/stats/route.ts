import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { calculateStrengthScore, determineRank, calculateRecoveryState, RankTier } from '@/lib/scoring';
import scoringConfig from '@/../config/scoring.json';

// GET - Fetch user's dashboard stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get workout count this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const workoutsThisWeek = await db.session.count({
      where: {
        userId: user.id,
        startTime: { gte: weekStart },
      },
    });

    // Get total workout count
    const totalWorkouts = await db.session.count({
      where: { userId: user.id },
    });

    // Get recent PRs
    const recentPRs = await db.pRRecord.findMany({
      where: { userId: user.id },
      include: { exercise: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    // Get muscle group scores (latest snapshot or calculate from PRs)
    const muscleGroups = await db.muscleGroup.findMany();
    
    const muscleScores: Record<string, number> = {};
    const muscleRecovery: Record<string, number> = {};

    for (const mg of muscleGroups) {
      // Get the best PR for exercises targeting this muscle group
      const exercisesForMuscle = await db.exercise.findMany({
        where: {
          muscleContributions: {
            some: {
              muscleGroupId: mg.id,
              contributionPercentage: { gte: 50 }, // Primary muscles only
            },
          },
        },
        include: {
          muscleContributions: true,
        },
      });

      let totalScore = 0;
      let scoreCount = 0;

      for (const exercise of exercisesForMuscle) {
        const bestPR = await db.pRRecord.findFirst({
          where: {
            userId: user.id,
            exerciseId: exercise.id,
          },
          orderBy: { estimated1RM: 'desc' },
        });

        if (bestPR && user.profile && user.profile.bodyWeight && user.profile.birthDate && user.profile.sex) {
          // Calculate normalized strength score
          const score = calculateStrengthScore(
            bestPR.estimated1RM,
            user.profile.bodyWeight,
            user.profile.sex,
            calculateAge(user.profile.birthDate),
            exercise.strengthStandard || 1.0
          );
          totalScore += score;
          scoreCount++;
        }
      }

      // Average score for muscle group (0-100)
      muscleScores[mg.name.toLowerCase()] = scoreCount > 0 
        ? Math.min(100, Math.round(totalScore / scoreCount)) 
        : 0;

      // Calculate recovery state
      const lastWorkoutWithMuscle = await db.session.findFirst({
        where: {
          userId: user.id,
          exercises: {
            some: {
              exercise: {
                muscleContributions: {
                  some: {
                    muscleGroupId: mg.id,
                    contributionPercentage: { gte: 30 },
                  },
                },
              },
            },
          },
        },
        orderBy: { startTime: 'desc' },
      });

      if (lastWorkoutWithMuscle) {
        const hoursSince = (Date.now() - lastWorkoutWithMuscle.startTime.getTime()) / (1000 * 60 * 60);
        const recoveryState = calculateRecoveryState(hoursSince, 7); // Default RPE 7
        muscleRecovery[mg.name.toLowerCase()] = recoveryState.fraction;
      } else {
        muscleRecovery[mg.name.toLowerCase()] = 1.0; // Fully recovered
      }
    }

    // Calculate overall rank (include all muscle groups, even with 0 scores)
    // This ensures training any muscle group always helps your overall rank
    const avgScore = Object.values(muscleScores).reduce((a, b) => a + b, 0) / 
      Math.max(1, Object.values(muscleScores).length);
    
    const overallRank = determineRank(avgScore);

    // Calculate progress within current rank
    const rankThresholds = scoringConfig.rankTiers;
    const rankTierKeys: RankTier[] = ['bronze', 'silver', 'gold', 'diamond', 'apex', 'mythic'];
    const currentTierIndex = rankTierKeys.indexOf(overallRank);
    const currentTier = rankThresholds[overallRank];
    const nextTierKey = rankTierKeys[currentTierIndex + 1];
    const nextTier = nextTierKey ? rankThresholds[nextTierKey] : null;
    
    let rankProgress = 0;
    if (currentTier && nextTier) {
      const range = nextTier.min - currentTier.min;
      rankProgress = ((avgScore - currentTier.min) / range) * 100;
    } else if (currentTier) {
      rankProgress = 100; // Max rank achieved
    }

    // Get volume data for the past week
    const weeklyVolume = await calculateWeeklyVolume(user.id);

    // Calculate current streak dynamically
    const currentStreak = await calculateCurrentStreak(user.id);

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
      stats: {
        workoutsThisWeek,
        totalWorkouts,
        currentStreak,
        longestStreak: Math.max(user.longestStreak, currentStreak),
        weeklyVolume,
      },
      rank: {
        overall: overallRank,
        score: Math.floor(avgScore),
        progress: Math.round(rankProgress),
      },
      muscleScores,
      muscleRecovery,
      recentPRs: recentPRs.map((pr: { exercise: { name: string }; weight: number; reps: number; estimated1RM: number; date: Date }) => ({
        exercise: pr.exercise.name,
        weight: pr.weight,
        reps: pr.reps,
        estimated1RM: pr.estimated1RM,
        date: pr.date,
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function calculateWeeklyVolume(userId: string): Promise<number> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const sessions = await db.session.findMany({
    where: {
      userId,
      startTime: { gte: weekStart },
    },
    include: {
      exercises: {
        include: {
          sets: true,
        },
      },
    },
  });

  let totalVolume = 0;
  for (const session of sessions) {
    for (const exerciseLog of session.exercises) {
      for (const set of exerciseLog.sets) {
        if (!set.isWarmup) {
          totalVolume += set.weight * set.reps;
        }
      }
    }
  }

  return totalVolume;
}

async function calculateCurrentStreak(userId: string): Promise<number> {
  // Get all sessions ordered by date descending
  const sessions = await db.session.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
    select: { startTime: true },
  });

  if (sessions.length === 0) {
    return 0;
  }

  // Get unique workout dates (normalized to start of day)
  const workoutDates = new Set<string>();
  for (const session of sessions) {
    const date = new Date(session.startTime);
    date.setHours(0, 0, 0, 0);
    workoutDates.add(date.toISOString());
  }

  // Sort dates in descending order
  const sortedDates = Array.from(workoutDates)
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Check if there's a workout today or yesterday (streak must be active)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentWorkout = sortedDates[0];
  
  // If most recent workout is older than yesterday, streak is 0
  if (mostRecentWorkout.getTime() < yesterday.getTime()) {
    return 0;
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = mostRecentWorkout;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    if (sortedDates[i].getTime() === prevDate.getTime()) {
      streak++;
      currentDate = sortedDates[i];
    } else {
      break;
    }
  }

  return streak;
}
