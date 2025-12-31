'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Calendar as CalendarIcon,
  Dumbbell,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CalendarData {
  activity: Record<string, { count: number; volume: number; duration: number; types: string[] }>;
  streaks: { current: number; longest: number };
  summary: { thisWeek: number; thisMonth: number; total: number };
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch calendar data
  useEffect(() => {
    async function fetchCalendarData() {
      try {
        setIsLoading(true);
        const year = currentDate.getFullYear();
        const res = await fetch(`/api/calendar?year=${year}`);
        if (!res.ok) throw new Error('Failed to fetch calendar data');
        const data = await res.json();
        setCalendarData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCalendarData();
  }, [currentDate.getFullYear()]);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateYear = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-green-900';
    if (count === 2) return 'bg-green-700';
    return 'bg-green-500';
  };

  const activity = calendarData?.activity || {};

  // Generate year heatmap data
  const yearHeatmapData = useMemo(() => {
    const weeks: { date: Date; count: number }[][] = [];
    const endDate = new Date(currentDate.getFullYear(), 11, 31);
    const startDate = new Date(currentDate.getFullYear(), 0, 1);

    // Adjust start date to beginning of week
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    let currentWeek: { date: Date; count: number }[] = [];
    const currentIterDate = new Date(startDate);

    while (currentIterDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentIterDate.toISOString().split('T')[0];
      const workoutData = activity[dateStr];

      currentWeek.push({
        date: new Date(currentIterDate),
        count: workoutData?.count || 0,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentIterDate.setDate(currentIterDate.getDate() + 1);

      if (currentIterDate > endDate && currentWeek.length === 0) break;
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [currentDate, activity]);

  // Generate month calendar data
  const monthCalendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    const days: { date: Date | null; count: number; volume: number }[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, count: 0, volume: 0 });
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const workoutData = activity[dateStr];

      days.push({
        date,
        count: workoutData?.count || 0,
        volume: workoutData?.volume || 0,
      });
    }

    return days;
  }, [currentDate, activity]);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Activity Calendar</h1>
          <p className="text-muted-foreground">
            Track your workout consistency and streaks
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('year')}
          >
            Year
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Streak Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{calendarData?.streaks.current || 0}</p>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{calendarData?.streaks.longest || 0}</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{calendarData?.summary.thisMonth || 0}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Dumbbell className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {calendarData?.summary.total || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {viewMode === 'year'
                  ? `${currentDate.getFullYear()} Activity`
                  : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </CardTitle>
              <CardDescription>
                {viewMode === 'year'
                  ? 'Your workout activity throughout the year'
                  : 'Daily workout breakdown'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  viewMode === 'year'
                    ? navigateYear(-1)
                    : navigateMonth(-1)
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  viewMode === 'year' ? navigateYear(1) : navigateMonth(1)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'year' ? (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Month labels */}
                <div className="flex mb-2 text-xs text-muted-foreground">
                  <div className="w-8"></div>
                  {monthNames.map((month) => (
                    <div key={month} className="flex-1 text-center">
                      {month}
                    </div>
                  ))}
                </div>
                {/* Day labels */}
                <div className="flex">
                  <div className="w-8 flex flex-col text-xs text-muted-foreground">
                    <div className="h-3"></div>
                    <div className="h-3">Mon</div>
                    <div className="h-3"></div>
                    <div className="h-3">Wed</div>
                    <div className="h-3"></div>
                    <div className="h-3">Fri</div>
                    <div className="h-3"></div>
                  </div>
                  {/* Heatmap grid */}
                  <div className="flex gap-[2px]">
                    {yearHeatmapData.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[2px]">
                        {week.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`w-3 h-3 rounded-sm ${getIntensityClass(
                              day.count
                            )} hover:ring-1 hover:ring-primary cursor-pointer`}
                            title={`${day.date.toLocaleDateString()}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  <div className="w-3 h-3 rounded-sm bg-green-900" />
                  <div className="w-3 h-3 rounded-sm bg-green-700" />
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span>More</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs text-muted-foreground font-medium py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthCalendarData.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square p-1 rounded-lg ${
                      day.date
                        ? day.count > 0
                          ? 'bg-green-500/20 hover:bg-green-500/30'
                          : 'bg-muted/50 hover:bg-muted'
                        : ''
                    } cursor-pointer transition-colors`}
                  >
                    {day.date && (
                      <div className="h-full flex flex-col">
                        <span
                          className={`text-xs ${
                            day.count > 0
                              ? 'text-green-400 font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {day.date.getDate()}
                        </span>
                        {day.count > 0 && (
                          <div className="flex-1 flex items-center justify-center">
                            <Dumbbell className="h-3 w-3 text-green-500" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Goal</CardTitle>
          <CardDescription>
            Train consistently to maintain your streak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const today = new Date();
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const targetDate = new Date(weekStart);
                targetDate.setDate(weekStart.getDate() + day);
                const dateStr = targetDate.toISOString().split('T')[0];
                const hasWorkout = activity[dateStr];

                return (
                  <div
                    key={day}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      hasWorkout
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day]}
                  </div>
                );
              })}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {calendarData?.summary.thisWeek || 0}/4 workouts this week
              </p>
              <p className="text-xs text-muted-foreground">
                {(calendarData?.summary.thisWeek || 0) < 4
                  ? `${4 - (calendarData?.summary.thisWeek || 0)} more to hit your goal`
                  : '🎉 Goal reached!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
