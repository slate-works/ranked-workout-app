import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Fetch user's calendar/activity data
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null;

    // Get all sessions for the specified period
    let startDate: Date;
    let endDate: Date;

    if (month !== null) {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    const sessions = await db.session.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // Group sessions by date and calculate daily stats
    const activityByDate: Record<string, {
      count: number;
      volume: number;
      duration: number;
      types: string[];
    }> = {};

    for (const s of sessions) {
      const dateKey = s.startTime.toISOString().split('T')[0];
      
      if (!activityByDate[dateKey]) {
        activityByDate[dateKey] = {
          count: 0,
          volume: 0,
          duration: 0,
          types: [],
        };
      }

      activityByDate[dateKey].count++;
      
      // Calculate volume
      let sessionVolume = 0;
      for (const exerciseLog of s.exercises) {
        for (const set of exerciseLog.sets) {
          if (!set.isWarmup) {
            sessionVolume += set.weight * set.reps;
          }
        }
      }
      activityByDate[dateKey].volume += sessionVolume;

      // Calculate duration
      if (s.endTime) {
        const duration = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60);
        activityByDate[dateKey].duration += duration;
      }

      // Track workout types
      if (s.workoutType && !activityByDate[dateKey].types.includes(s.workoutType)) {
        activityByDate[dateKey].types.push(s.workoutType);
      }
    }

    // Calculate streak data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Check from today backwards
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      
      if (activityByDate[dateKey]) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
        if (i > 0) {
          currentStreak = 0;
        }
      }
    }
    
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate weekly stats
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekKey = thisWeekStart.toISOString().split('T')[0];
    
    let thisWeekWorkouts = 0;
    let thisMonthWorkouts = 0;
    
    for (const [dateKey, data] of Object.entries(activityByDate)) {
      const date = new Date(dateKey);
      if (date >= thisWeekStart) {
        thisWeekWorkouts += data.count;
      }
      if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
        thisMonthWorkouts += data.count;
      }
    }

    return NextResponse.json({
      activity: activityByDate,
      streaks: {
        current: currentStreak,
        longest: longestStreak,
      },
      summary: {
        thisWeek: thisWeekWorkouts,
        thisMonth: thisMonthWorkouts,
        total: sessions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}
